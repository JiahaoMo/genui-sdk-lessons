import OpenAI from 'openai';
import { availableTools } from './tools';

/**
 * 执行工具调用
 */
async function executeToolCall(toolName, args) {
  const tool = availableTools[toolName];
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  try {
    const result = await tool.execute(args);
    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * 累积工具调用数据
 * 将流式返回的工具调用增量数据累积成完整的工具调用对象
 */
function accumulateToolCalls(toolCalls, toolCallDeltas) {
  for (const delta of toolCallDeltas) {
    const index = delta.index ?? 0;
    const toolCall = (toolCalls[index] ??= {
      id: delta.id ?? '',
      type: 'function',
      function: { name: '', arguments: '' },
    });
    if (delta.id) toolCall.id = delta.id;
    if (delta.function?.name) toolCall.function.name += delta.function.name;
    if (delta.function?.arguments) toolCall.function.arguments += delta.function.arguments;
  }
}

/**
 * 执行单个工具调用并返回结果
 */
async function executeSingleToolCall(toolCall, currentMessages) {
  const createResult = (result) => {
    currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
    return {
      id: toolCall.id,
      type: 'function',
      function: { name: toolCall.function.name, arguments: toolCall.function.arguments, result },
    };
  };
  try {
    const args = JSON.parse(toolCall.function.arguments);
    const result = await executeToolCall(toolCall.function.name, args);
    return createResult(result);
  } catch (error) {
    return createResult(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
  }
}

/**
 * 使用 OpenAI SDK 创建 customRequest 函数（处理工具调用和多轮对话）
 *
 * @param config OpenAI 配置
 * @returns CustomFetch 函数
 */
export function createOpenAICustomFetch(config) {
  return async (
    url,
    options
  ) => {
    // 解析请求体
    const requestBody = JSON.parse(options.body);
    const { messages, model, temperature, metadata } = requestBody;

    try {
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        dangerouslyAllowBrowser: true,
      });

      const tools = Object.values(availableTools).map((tool) => tool.definition);
      const maxSteps = 20; // 最大工具调用步骤数

      // 将流转换为 SSE 格式的 Response
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            let currentMessages = [...messages];
            let stepCount = 0;

            while (stepCount < maxSteps) {
              // 创建流式请求
              const stream = await openai.chat.completions.create(
                {
                  model,
                  messages: currentMessages,
                  temperature,
                  tools: tools.length > 0 ? tools : undefined,
                  tool_choice: tools.length > 0 ? 'auto' : undefined,
                  stream: true,
                  metadata,
                  thinking: { type: 'disabled' }
                },
                {
                  signal: options.signal,
                },
              );

              let toolCalls = [];
              let hasToolCalls = false;

              // 处理流式响应
              for await (const chunk of stream) {
                const choice = chunk.choices?.[0];
                if (!choice) continue;

                const delta = choice.delta;

                // 累积工具调用数据
                if (delta.tool_calls) {
                  hasToolCalls = true;
                  accumulateToolCalls(toolCalls, delta.tool_calls);
                }

                // 透传原始 chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

                // 处理完成原因
                if (choice.finish_reason === 'tool_calls' && toolCalls.length > 0) {
                  // 执行工具调用
                  currentMessages.push({ role: 'assistant', content: null, tool_calls: toolCalls });
                  const toolResults = await Promise.all(
                    toolCalls.map((toolCall, i) =>
                      executeSingleToolCall(toolCall, currentMessages).then((result) => ({ ...result, index: i })),
                    ),
                  );

                  // 发送工具调用结果
                  if (toolResults.length > 0) {
                    const toolResultChunk = {
                      id: chunk.id,
                      object: 'chat.completion.chunk',
                      model: chunk.model || model,
                      created: chunk.created || Math.floor(Date.now() / 1000),
                      choices: [{ index: 0, delta: { tool_calls_result: toolResults }, finish_reason: 'tool_calls' }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolResultChunk)}\n\n`));
                  }

                  stepCount++;
                  break;
                }

                if (choice.finish_reason) {
                  // 正常完成，退出外层循环
                  break;
                }
              }

              // 如果没有工具调用，退出循环
              if (!hasToolCalls) {
                break;
              }
            }

            // 发送结束标记
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            const errorData = {
              error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                type: 'stream_error',
              },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        status: 200,
      });
    } catch (error) {
      console.error('[OpenAI SDK Error]', {
        url,
        error: error.message,
      });

      // 返回错误响应
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
            type: error.type || 'unknown',
            code: 500,
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  };
}
