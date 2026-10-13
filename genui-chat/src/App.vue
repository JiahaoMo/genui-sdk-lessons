<script setup>
import { GenuiChat, GenuiConfigProvider } from '@opentiny/genui-sdk-vue';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue';
import { ref, computed } from 'vue'
import WeatherCard from './components/WeatherCard.vue';
import { createOpenAICustomFetch } from './utils/toolFetch.js';
import CustomThink from './components/CustomThink.vue';
import AssistantFooter from './components/AssistantFooter.vue';
import UserFooter from './components/UserFooter.vue';
import ConversationSidebar from './components/ConversationSidebar.vue';

const url = 'http://localhost:3100/chat/completions'
const model = ref('deepseek-v4-flash')
const temperature = ref(0.7)
const theme = ref('light')

// const customFetch = async (url, options) => {
//   const body = JSON.parse(options.body)
//   body.thinking = {
//     type: 'disabled'
//   }
//   return fetch(url, {...options, body: JSON.stringify(body)})
// }

const customFetch = createOpenAICustomFetch(
  {
    apiKey: 'whatever',
    baseURL: 'http://localhost:3100'
  }
)


const initialMessage = [
  {
    role: 'user',
    content: '你好',
    messages: [
      {
        type: 'text',
        content: '你好，这是messages里面的你好'
      }
    ]
  },
  {
    role: 'assistant',
    content: '你好呀， 有什么可以帮助你的吗？',
    messages: [
      {
        type: 'text',
        content: '你好呀， 有什么可以帮助你的吗？'
      }
    ]
  },
  {
    role: 'user',
    content: '你好，请帮我生成一个表单吧',
    messages: [
      {
        type: 'text',
        content: '你好，请帮我生成一个表单吧'
      }
    ]
  },
  {
    role: 'assistant',
    content: '好的，我给你生成一个表单',
    messages: [
      {
        type: 'text',
        content: '表单已经生成好了'
      },
      {
        type: 'schema-card',
        content: `{"componentName":"Page","state":{"formData":{"name":"","gender":"","department":"","position":""}},"refs":{"formRef":null},"methods":{},"children":[{"componentName":"TinyCard","children":[{"componentName":"h3","children":"新增员工"},{"componentName":"TinyForm","props":{"model":{"type":"JSExpression","value":"this.state.formData"},"ref":{"type":"JSExpression","value":"this.refs.formRef"},"labelPosition":"top"},"children":[{"componentName":"TinyFormItem","props":{"label":"姓名","prop":"name","required":true},"children":[{"componentName":"TinyInput","props":{"placeholder":"请输入姓名","modelValue":{"type":"JSExpression","model":true,"value":"this.state.formData.name"}}}]},{"componentName":"TinyFormItem","props":{"label":"性别","prop":"gender"},"children":[{"componentName":"TinyRadioGroup","props":{"modelValue":{"type":"JSExpression","model":true,"value":"this.state.formData.gender"},"options":[{"label":"男","text":"男"},{"label":"女","text":"女"}]}}]},{"componentName":"TinyFormItem","props":{"label":"部门","prop":"department","required":true},"children":[{"componentName":"TinySelect","props":{"placeholder":"请选择部门","modelValue":{"type":"JSExpression","model":true,"value":"this.state.formData.department"},"options":[{"label":"技术部","value":"技术部"},{"label":"人事部","value":"人事部"},{"label":"财务部","value":"财务部"},{"label":"市场部","value":"市场部"}]}}]},{"componentName":"TinyFormItem","props":{"label":"职位","prop":"position"},"children":[{"componentName":"TinyInput","props":{"placeholder":"请输入职位","modelValue":{"type":"JSExpression","model":true,"value":"this.state.formData.position"}}}]},{"componentName":"TinyFormItem","props":{"label":""},"children":[{"componentName":"TinyButton","props":{"text":"保存","type":"primary","onClick":{"type":"JSFunction","value":"function() { this.refs.formRef.validate().then(() => { this.callAction('saveState'); this.callAction('continueChat', { message: '员工信息已保存' }); }).catch(() => {}); }"}}]}]}]}]}`
      }
    ]
  },
  {
    role: 'user',
    content: '请给我生成一个冒泡排序的算法代码',
    messages: [
      {
        type: 'text',
        content: '请给我生成一个冒泡排序的算法代码'
      }
    ]
  },
  {
    role: 'assistant',
    content: '好的，我帮你生成一个冒泡排序算法',
    messages: [
      {
        type: 'markdown',
        content: `好的，这是一个使用JavaScript实现的冒泡排序算法示例：

\`\`\`javascript
function bubbleSort(arr) {
  const len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        // 交换相邻元素
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// 使用示例
const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
const sortedArray = bubbleSort(unsortedArray);
console.log(sortedArray); // 输出: [11, 12, 22, 25, 34, 64, 90]
\`\`\`

这段代码实现了经典的冒泡排序算法，通过相邻元素的两两比较和交换，将较大的元素逐步"冒泡"到数组末尾，最终完成整个数组的升序排列。`
      }
    ]
  }
]

const chatConfig = {
  showThinkingResult: true,
};

const customActions = [
  {
    name: 'speak',
    description: '用语言合成把一段文字朗读出来，并且支持多语言',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '要朗读的文本'},
        lang: { type: 'sting', description: '语言（BCP-47 格式）。常用：zh-CN 中文、en-US 美式英语、en-GB 英式英语、ja-JP 日语、ko-KR 韩语、fr-FR 法语、de-DE 德语；默认 zh-CN'},
        rate: { type: 'number', description: '语速 0.1~2， 默认值是1'}
      },
      required: ['text']
    },
    execute: async (params) => {
      console.log('[customAction speak] 参数：', params);
      if (!('speechSynthesis' in window)) {
        return false;
      }
      const lang = params.lang || 'zh-CN';
      const rate = params.rate || 1
      const utterance = new SpeechSynthesisUtterance(params.text);
      utterance.lang = lang;
      utterance.rate = rate

      const voices = speechSynthesis.getVoices();
      const prefix = lang.split('-')[0].toLowerCase();
      const matchedVoice =
        voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      return new Promise((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        speechSynthesis.speak(utterance);
      });

    }
  }
]

const customExamples = [
  {
    name: '程序员今日运势卡',
    description: '当用户想“测运势 / 看看今天适合做什么的时候”， 就要用这种卡片： 一句运势结论 + 几个关键词标签 + 一句俏皮话结尾',
    schema: {
      componentName: 'TinyCard',
      children: [
        {
          componentName: 'div',
          props: { style: 'font-size:18px; font-weight:bold; margin-bottom:8px;' },
          children: '🔮 程序员今日运势',
        },
        {
          componentName: 'div',
          props: { style: 'font-size:20px; margin-bottom:12px;' },
          children: '大吉 · 宜提交代码，忌删库跑路',
        },
        {
          componentName: 'div',
          props: { style: 'display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;' },
          children: [
            {
              componentName: 'div',
              props: { style: 'padding:2px 12px; border:1px solid #e5e5e5; border-radius:12px; font-size:12px;' },
              children: '幸运数：7',
            },
            {
              componentName: 'div',
              props: { style: 'padding:2px 12px; border:1px solid #e5e5e5; border-radius:12px; font-size:12px;' },
              children: '幸运色：就交给主题吧',
            },
            {
              componentName: 'div',
              props: { style: 'padding:2px 12px; border:1px solid #e5e5e5; border-radius:12px; font-size:12px;' },
              children: '今日摸鱼指数：85%',
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'padding: 2px 12px; border: 1px solid #e5e5e5; boder-radius: 12px; font-size: 12px'},
          children: '长命工夫长命做，今日不做就明日做；今日的事，明日做；明日的事情，明日再说！'
        }
      ],
    }
  }
]

const customComponents = [
  {
    component: 'WeatherCard',
    name: '天气卡片',
    description: '展示一个城市的天气卡片，包含天气现象、气温和温馨提示',
    schema: {
      properties: [
        { property: 'city', type: 'string', description: '城市名', required: true },
        { property: 'weather', type: 'string', description: '天气现象，如：晴/多云/小雨' },
        { property: 'temperature', type: 'number', description: '气温，单位摄氏度' },
        { property: 'tips', type: 'string', description: '给用户的温馨提示' },
      ]
    },
    ref: WeatherCard
  }
]

const customSnippets = [
  {
    componentName: 'TinyTabs',
    props: {
      modelValue: 'tab1',
    },
    children: [
      {
        componentName: 'TinyTabItem',
        props: {
          title: '标签页1',
          name: 'tab1',
        },
        children: [
          {
            componentName: 'div',
            props: {
              style: 'padding: 16px;',
            },
            children: '标签页1的内容',
          },
        ],
      },
      {
        componentName: 'TinyTabItem',
        props: {
          title: '标签页2',
          name: 'tab2',
        },
        children: [
          {
            componentName: 'div',
            props: {
              style: 'padding: 16px;',
            },
            children: '标签页2的内容',
          },
        ],
      },
    ],
  },
]

const roles = {
  assistant: {
    slots: {
      trailer: AssistantFooter,
    },
  },
  user: {
    slots: {
      trailer: UserFooter
    }
  }
}

const chatRef = ref(null)
const conversation = computed(()=>chatRef.value?.getConversation())

</script>

<template>
  <GenuiConfigProvider :materials="materials" :theme="theme">
    <div class="chat-with-sidebar">
      <ConversationSidebar :conversation="conversation"></ConversationSidebar>
      <div class="chat-container">
        <GenuiChat
          ref="chatRef"
          :url="url" 
          :model="model" 
          :temperature="temperature"
          :custom-fetch="customFetch"
          :messages="initialMessage"
          :chat-config="chatConfig"
          :custom-actions="customActions"
          :custom-examples="customExamples"
          :custom-components="customComponents"
          :custom-snippets="customSnippets"
          :think-component="CustomThink"
          :roles="roles"
        >
        <template #empty>
          <div class="empty-text">欢迎使用生成式UI</div>
        </template>
      </GenuiChat>
      </div>
    </div>
  </GenuiConfigProvider>
</template>

<style>
body,
html {
  padding: 0;
  margin: 0;
}

#app {
  position: fixed;
  height: 100vh;
  width: 100vw;
}

.tiny-config-provider {
  height: 100%;
}

.empty-text {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}
.chat-with-sidebar {
  display: flex;
  height: 100%;
}
.chat-container {
  flex: 1;
}

</style>
