<template>
  <div class="confirm-modal" v-if="visible">
    <div class="confirm-content">
      <div class="confirm-header">
        <span>{{ title }}</span>
        <span class="close" @click="handleCancel">&times;</span>
      </div>
      <div class="confirm-body">
        {{ message }}
      </div>
      <div class="confirm-footer">
        <button class="btn-cancel" @click="handleCancel">Cancel</button>
        <button class="btn-confirm" @click="handleConfirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm'
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed?'
    }
  },
  emits: ['update:visible', 'confirm', 'cancel'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
      this.$emit('update:visible', false);
    },
    handleCancel() {
      this.$emit('cancel');
      this.$emit('update:visible', false);
    }
  }
}
</script>

<style scoped>
.confirm-modal {
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

.confirm-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.confirm-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  background-color: #2196f3;
  color: white;
}

.confirm-body {
  padding: 1.5rem;
  font-size: 1rem;
  color: #333;
}

.confirm-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #f5f5f5;
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #f44336;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background-color: #d32f2f;
}

.close {
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
