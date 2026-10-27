// 自定义 Action：Chat 和 Renderer 都可以复用
export const speakAction = {
  name: 'speak',
  description: '用语言合成把一段文字朗读出来，并且支持多语言',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要朗读的文本' },
      lang: {
        type: 'string',
        description:
          '语言（BCP-47 格式）。常用：zh-CN 中文、en-US 美式英语、en-GB 英式英语、ja-JP 日语、ko-KR 韩语、fr-FR 法语、de-DE 德语；默认 zh-CN',
      },
      rate: { type: 'number', description: '语速 0.1~2，默认值是 1' },
    },
    required: ['text'],
  },
  execute: async (params) => {
    console.log('[customAction speak] 参数：', params)
    if (!('speechSynthesis' in window)) {
      return false
    }
    const lang = params.lang || 'zh-CN'
    const rate = params.rate || 1
    const utterance = new SpeechSynthesisUtterance(params.text)
    utterance.lang = lang
    utterance.rate = rate

    const voices = speechSynthesis.getVoices()
    const prefix = lang.split('-')[0].toLowerCase()
    const matchedVoice =
      voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix))
    if (matchedVoice) {
      utterance.voice = matchedVoice
    }

    return new Promise((resolve) => {
      utterance.onend = () => resolve(true)
      utterance.onerror = () => resolve(false)
      speechSynthesis.speak(utterance)
    })
  },
}
