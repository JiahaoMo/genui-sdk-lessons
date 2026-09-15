import { confetti } from "./confetti"
export const availableTools = {
    celebrate: {
      definition: {
        type: 'function',
        function: {
          name: 'celebrate',
          description:
            '只有在用户分享任何值得高兴的事，或要求庆祝、恭喜、撒花时调用本工具。',
          parameters: {
            type: 'object',
            properties: {
                blessing: {
                  type: 'string',
                  description: '一句直接显示在屏幕中央的祝福语，不超过 15 字，可以带一个 emoji。要具体、有温度，贴合用户说的事，别写“恭喜恭喜”这种空话，也不要加引号'
                }
            },
            required: ['blessing'],
          },
        },
    },
    execute: async ( {blessing} ) => {
      confetti(blessing)
      return '工具调用成功了'
    },
  }
}