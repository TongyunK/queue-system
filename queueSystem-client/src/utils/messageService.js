import { ref } from 'vue';

// 创建一个响应式消息状态
const message = ref({
  show: false,
  type: 'info', // info, success, error
  title: '',
  text: ''
});

/**
 * 显示消息
 * @param {string} type - 消息类型: 'info', 'success', 'error'
 * @param {string} title - 消息标题
 * @param {string} text - 消息内容
 * @param {number} [duration] - 自动关闭的时间(毫秒)，如果为0则不自动关闭
 */
const showMessage = (type, title, text, duration = 0) => {
  message.value = {
    show: true,
    type,
    title,
    text
  };

  if (duration > 0) {
    setTimeout(() => {
      closeMessage();
    }, duration);
  }
};

/**
 * 关闭消息
 */
const closeMessage = () => {
  message.value.show = false;
};

/**
 * 显示成功消息
 * @param {string} title - 消息标题
 * @param {string} text - 消息内容
 * @param {number} [duration] - 自动关闭的时间(毫秒)
 */
const showSuccess = (title, text, duration = 0) => {
  showMessage('success', title, text, duration);
};

/**
 * 显示错误消息
 * @param {string} title - 消息标题
 * @param {string} text - 消息内容
 * @param {number} [duration] - 自动关闭的时间(毫秒)
 */
const showError = (title, text, duration = 0) => {
  showMessage('error', title, text, duration);
};

/**
 * 显示信息消息
 * @param {string} title - 消息标题
 * @param {string} text - 消息内容
 * @param {number} [duration] - 自动关闭的时间(毫秒)
 */
const showInfo = (title, text, duration = 0) => {
  showMessage('info', title, text, duration);
};

export default {
  message,
  showMessage,
  closeMessage,
  showSuccess,
  showError,
  showInfo
};
