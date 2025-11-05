<template>
  <message-modal
    :visible="message.show"
    :title="message.title"
    :text="message.text"
    :type="message.type"
    @update:visible="onVisibleChange"
    @close="onClose"
  />
</template>

<script>
import { computed } from 'vue';
import MessageModal from './MessageModal.vue';
import messageService from '@/utils/messageService';

export default {
  name: 'GlobalMessage',
  components: {
    MessageModal
  },
  setup() {
    // 通过计算属性获取消息状态，确保响应式更新
    const message = computed(() => messageService.message.value);

    const onVisibleChange = (value) => {
      messageService.message.value.show = value;
    };

    const onClose = () => {
      messageService.closeMessage();
    };

    return {
      message,
      onVisibleChange,
      onClose
    };
  }
};
</script>
