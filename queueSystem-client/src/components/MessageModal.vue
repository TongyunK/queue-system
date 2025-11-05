<template>
  <div class="message-modal" v-if="visible">
    <div class="message-content" :class="type">
      <div class="message-header">
        <span>{{ title }}</span>
        <span class="close" @click="close">&times;</span>
      </div>
      <div class="message-body">
        {{ text }}
      </div>
      <div class="message-footer">
        <button class="btn-primary" @click="close">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Tips'
    },
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'error'].includes(value)
    }
  },
  emits: ['update:visible', 'close'],
  methods: {
    close() {
      this.$emit('update:visible', false);
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.message-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* 确保在其他模态框之上 */
}

.message-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.message-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.message-content.success .message-header {
  background-color: #4caf50;
  color: white;
}

.message-content.error .message-header {
  background-color: #f44336;
  color: white;
}

.message-content.info .message-header {
  background-color: #2196f3;
  color: white;
}

.message-body {
  padding: 1.5rem;
  font-size: 1rem;
  color: #333;
}

.message-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.close {
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
