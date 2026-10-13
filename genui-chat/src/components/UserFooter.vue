<script setup>
import { ref } from 'vue'
const props = defineProps({
  index: { type: Number, default: -1 },
  bubbleProps: { type: Object, default: ()=>({}) },
  isFinished: { type: Boolean, default: false },
  messageManager: { type: Object, default: null }
})

const text = props.bubbleProps.content
const edited = ref(false)

const onEdit = ()=> {
  if(!props.messageManager || !text) return
  props.messageManager.inputMessage.value = text
  edited.value = true
  setTimeout(()=>edited.value = false, 1500)
}

</script>

<template>
<div class="msg-actions msg-action--user">
  <button class="msg-actions__btn" @click="onEdit">{{ edited?'已填入输入框': '编辑' }}</button>
</div>
</template>

<style scoped>
.msg-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  opacity: 0.75;
  transition: opacity 0.2s;
}
.msg-actions:hover {
  opacity: 1;
}

.msg-actions--user {
  justify-content: flex-end;
}

.msg-actions__btn {
  padding: 2px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  line-height: 1.6;
  color: #8a8f99;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
}
.msg-actions__btn:hover {
  border-color: #e3e6eb;
  background: #f5f6f8;
  color: #5b6bff;
}
</style>