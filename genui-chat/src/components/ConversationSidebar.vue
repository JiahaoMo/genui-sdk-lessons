<script setup>
import { computed } from 'vue'
const props = defineProps({
  conversation: { type: Object, default: null }
})

const conversation = computed(()=>props.conversation)
const conversations = computed(()=>conversation.value?.state.conversations || [])
const currentId = computed(()=>conversation.value?.state.currentId)

const handleNewConversation = ()=>{
  // console.log('conversation: ', conversation.value)
  // console.log('conversations: ', conversations.value)
  // console.log('currentId: ', currentId.value)
  conversation.value?.createConversation()
}

const handleSwitchConversation = (id)=>{
  conversation.value?.switchConversation(id)
}

const handleDeleteConversation = (id) => {
  if(confirm('确定要删除这个会话吗')){
    conversation.value?.deleteConversation(id)
  }
}
</script>

<template>
<div class="sidebar">
  <div class="sidebar-header">
    <button class="new-chat-btn" @click="handleNewConversation">+ 新建会话</button>
  </div>
  <div class="conversations-list">
    <div
      v-for="conv in conversations"
      :key="conv.id"
      :class="['conversation-item', { active: conv.id === currentId }]"
      @click="handleSwitchConversation(conv.id)"
    >
      <div class="conversation-title">{{ conv.title || '新会话' }}</div>
      <button class="delete-btn" @click.stop="handleDeleteConversation(conv.id)">×</button>
    </div>
  </div>
</div>

</template>


<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  height: 100%;
  border-right: 1px solid #e3e6eb;
  background: #fafbfc;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #e3e6eb;
}

.new-chat-btn {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d9e0ff;
  border-radius: 6px;
  background: #eef1ff;
  font-size: 13px;
  color: #5b6bff;
  cursor: pointer;
}
.new-chat-btn:hover {
  background: #e2e7ff;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}
.conversation-item:hover {
  background: #f0f2f5;
}
.conversation-item.active {
  background: #eef1ff;
  font-weight: 600;
  color: #5b6bff;
}

.conversation-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  flex: none;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 14px;
  line-height: 1;
  color: #b0b5bd;
  cursor: pointer;
}
.delete-btn:hover {
  background: #ffe8e8;
  color: #e5484d;
}
</style>