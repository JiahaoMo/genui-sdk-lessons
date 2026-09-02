<script setup>
import { GenuiChat, GenuiConfigProvider } from '@opentiny/genui-sdk-vue';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue';
import { ref } from 'vue'

const url = 'http://localhost:3100/chat/completions'
const model = ref('deepseek-v4-flash')
const temperature = ref(0.7)
const theme = ref('dark')
</script>

<template>
  <GenuiConfigProvider :materials="materials" :theme=" theme">
    <GenuiChat :url="url" :model="model" :temperature="temperature">
      <template #empty>
        <div class="empty-text">欢迎使用生成式UI</div>
      </template>
    </GenuiChat>
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

</style>
