<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
const props = defineProps({
  message: { type: Object, default: ()=>{} },
  emitter: { type: Object, required: true }
})
const title = ref('')
const payloadType = {
  'markdown': '正在组织语言...',
  'schema-card': '正在生成卡片...'
}
const handleNotication = (payload)=>{
  if(payload.type === 'done') return
  title.value = payloadType[payload.type] || '响应中...'
}
onMounted(()=>props.emitter.on('notification', handleNotication))
onUnmounted(()=>props.emitter.off('notification', handleNotication))
</script>

<template>
<div class="think-bar">
  <div class="think-bar__title">
    {{ title }}
  </div>
  <span class="think-bar__track">
    <span class="think-bar__fill"></span>
  </span>
</div>

</template>

<style scoped>
.think-bar {
  --think-accent: #5b6bff;

  order: -1;

  position: sticky;
  top: 0;
  z-index: 2;

  overflow: hidden; 

  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  margin: 10px 0;
  padding: 8px 14px 9px;
  border: 1px solid var(--think-border, #e3e6eb);
  border-radius: 10px;
  background: var(--think-bg, #f7f8fa);
  font-size: 13px;
  color: #333;
}
.think-bar__title {
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.think-bar__track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.06);
}
.think-bar__fill {
  display: block;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--think-accent), transparent);
  animation: think-sweep 1.4s ease-in-out infinite;
}
@keyframes think-sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}
</style>
<style>
.tr-bubble__content-items:has(> .think-bar) {
  overflow-x: clip;
}
</style>