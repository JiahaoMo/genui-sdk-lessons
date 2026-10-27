<script setup>
import { GenuiRenderer, GenuiConfigProvider } from '@opentiny/genui-sdk-vue'
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue'
import { onBeforeUnmount, ref } from 'vue';
import { fetchSchemaStream } from './fetchSchemaStream';
import { speakAction } from './utils/customActions';
import WeatherCard from './components/WeatherCard.vue';

const inputValue = ref('')
const generating = ref(false)
const errorMsg = ref('')
const schema = ref('')
const API_URL = 'http://localhost:3100/chat/completions'
const schemaContent = ref({
  "componentName": "Page",
  "state": {
    "formData": {
      "username": "",
      "password": ""
    }
  },
  "methods": {
    "handleSubmit": {
      "type": "JSFunction",
      "value": "function() { this.callAction('continueChat', { message: '提交登录：' + JSON.stringify(this.state.formData) }); }"
    }
  },
  "children": [
    {
      "componentName": "TinyCard",
      "children": [
        {
          "componentName": "h3",
          "children": "登录表单"
        },
        {
          "componentName": "TinyForm",
          "props": {
            "labelWidth": "70px",
            "labelPosition": "right",
            "model": {
              "type": "JSExpression",
              "value": "this.state.formData"
            }
          },
          "children": [
            {
              "componentName": "TinyFormItem",
              "props": {
                "label": "账号",
                "prop": "username",
                "required": true
              },
              "children": [
                {
                  "componentName": "TinyInput",
                  "props": {
                    "placeholder": "请输入账号",
                    "modelValue": {
                      "type": "JSExpression",
                      "model": true,
                      "value": "this.state.formData.username"
                    }
                  }
                }
              ]
            },
            {
              "componentName": "TinyFormItem",
              "props": {
                "label": "密码",
                "prop": "password",
                "required": true
              },
              "children": [
                {
                  "componentName": "TinyInput",
                  "props": {
                    "type": "password",
                    "placeholder": "请输入密码",
                    "modelValue": {
                      "type": "JSExpression",
                      "model": true,
                      "value": "this.state.formData.password"
                    }
                  }
                }
              ]
            },
            {
              "componentName": "TinyFormItem",
              "props": {
                "label": ""
              },
              "children": [
                {
                  "componentName": "TinyButton",
                  "props": {
                    "text": "登录",
                    "type": "primary",
                    "onClick": {
                      "type": "JSFunction",
                      "value": "function() { this.handleSubmit(); }"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})
const actionSchema = {
  componentName: 'Page',
  children: [
    {
      componentName: 'TinyButton',
      props: {
        text: '朗读一句话',
        type: 'primary',
        onClick: {
          type: 'JSFunction',
          value: "function() { this.callAction('speak', {text: '你好， 这是自定义Actions'}); }"
        }
      }
    }
  ]
}
const customActions = { speak: speakAction }

const customComponents= { WeatherCard }
const componentSchema = {
  componentName: 'Page',
  children: [
    {
      componentName: 'WeatherCard',
      props: { city: '深圳', weather: '晴天', temperature: 26, tips: '注意防晒' }
    }
  ]
}

const fullText = JSON.stringify({
  componentName: 'Page',
  state: { framework: '' },
  children: [
    {
      componentName: 'TinySelect',
      props: {
        placeholder: '请选择框架',
        modelValue: { type: 'JSExpression', model: true, value: 'this.state.framework' },
        options: [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
          { label: '6', value: '6' },
        ],
      },
    },
  ],
})
const stream = ref(false)
const streamText = ref('')
let timer = null
const startStream = ()=>{
  if (stream.value) return
  clearInterval(timer)
  streamText.value = ''
  stream.value = true
  let i = 0
  timer = setInterval(()=>{
    i = Math.min(i+10, fullText.length)
    streamText.value = fullText.slice(0, i)
    if(i === fullText.length){
      clearInterval(timer)
      stream.value = false
    }
  }, 80)
}
const bufferSelectors = [ '[componentName=TinySelect] > props > options' ]
onBeforeUnmount(()=>clearInterval(timer))
startStream()

const savedStateSchema = {
  componentName: 'Page',
  state: { formData: { name: '' } },
  children: [
    {
      componentName: 'TinyInput',
      props: {
        placeholder: '输入姓名',
        modelValue: { type: 'JSExpression', model: true, value: 'this.state.formData.name' },
      },
    },
    {
      componentName: 'TinyButton',
      props: {
        text: '保存当前状态',
        onClick: { type: 'JSFunction', value: "function() { this.callAction('saveState') }" },
      },
    },
  ],
}

const STORAGE_KEY = 'rederer-demo-state'
const savedState = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'))
const savedStateActions = {
  saveState: {
    execute: (params, context) => {
      savedState.value = JSON.parse(JSON.stringify(context.state))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState.value))
    }
  }
}


const handleSend = async () => {
  const userInput = inputValue.value.trim()
  if(!userInput || generating.value) return

  generating.value = true
  errorMsg.value = ''
  schema.value = ''

  try {
    await fetchSchemaStream(API_URL, userInput, (chunk)=>{
      schema.value += chunk
    })
  } catch(error){
    errorMsg.value = `请求失败： ${error}`
  }finally{
    generating.value = false
  }
}
</script>

<template>
<div class="app">
  <div class="composer">
    <input v-model="inputValue"/>
    <button :disabled="generating" @click="handleSend">{{ generating?'生成中':'发送' }}</button>
  </div>
  <div class="stage">
    <GenuiConfigProvider :materials="materials">
      <GenuiRenderer
        :content="savedStateSchema"
        :generating="stream"
        :customActions="savedStateActions"
        :customComponents="customComponents"
        :requiredCompleteFieldSelectors="bufferSelectors"
        :state="savedState"
      >

      </GenuiRenderer>
    </GenuiConfigProvider>
  </div>
</div>
</template>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #1d1d1d;
}

.composer {
  display: flex;
  gap: 10px;
}

.composer input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.composer input:focus {
  border-color: #5e7ce0;
}

.composer button {
  padding: 10px 22px;
  border: none;
  border-radius: 8px;
  background: #5e7ce0;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.composer button:disabled {
  background: #c4cbe0;
  cursor: not-allowed;
}

.stage {
  margin-top: 20px;
  min-height: 200px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
}

.error {
  margin: 0;
  color: #d54941;
  font-size: 13px;
  line-height: 20px;
}
</style>
