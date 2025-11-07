<template>
  <div class="business-types-view">
    <div class="header">
      <!-- 返回按钮移到header中 -->
      <button class="back-btn" @click="goBack">
        <div class="chinese-text">返回</div>
        <div class="english-text">Back</div>
      </button>
      
      <div class="header-content">
        <h1>請選擇業務類型</h1>
        <h2>Please Select Service Type</h2>
      </div>
    </div>
    
    <div class="business-type-grid">
      <div 
        v-for="type in businessTypes" 
        :key="type.id" 
        class="business-type-btn" 
        :class="{ 'selected': selectedType && selectedType.id === type.id }"
        @click="selectBusinessType(type)"
      >
        <div class="btn-content">
          <div class="btn-code">{{ type.code }}</div>
          <div class="btn-chinese-text">{{ type.name }}</div>
          <div class="btn-english-text">{{ type.englishName }}</div>
        </div>
      </div>
    </div>

    <div class="get-ticket-section">
      <button 
        class="get-ticket-btn" 
        :class="{ 'disabled': !selectedType || ticketInfo }"
        @click="getTicket"
      >
        <div class="chinese-text">取票</div>
        <div class="english-text">Get Ticket</div>
      </button>
    </div>

    <!-- 取票成功弹窗 -->
    <div v-if="ticketInfo && showTicketDialog" class="ticket-dialog-overlay">
      <div class="ticket-dialog">
        <div class="ticket-dialog-content">
          <div class="ticket-header">
            <div class="chinese-text">您已成功獲取【{{ selectedType.name }}】服務號碼</div>
            <div class="english-text">You have successfully obtained a 【{{ selectedType.englishName }}】 service number</div>
          </div>
          <div class="ticket-number-section">
            <div class="ticket-label">
              <div class="chinese-text">您的號碼</div>
              <div class="english-text">Your Number</div>
            </div>
            <div class="ticket-number">{{ ticketInfo.ticket_number }}</div>
          </div>
          <div class="waiting-info">
            <div class="waiting-label">
              <div class="chinese-text">前面等待人數</div>
              <div class="english-text">People Waiting</div>
            </div>
            <div class="waiting-count">{{ waitingCount }}</div>
          </div>
        </div>
        <div class="ticket-dialog-footer">
          <button class="dialog-btn" @click="closeTicketDialog">
            <div class="chinese-text">確定</div>
            <div class="english-text">OK</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

const props = defineProps({
  businessTypes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['back', 'getTicket']);

const selectedType = ref(null);
const ticketInfo = ref(null);
const waitingCount = ref(0);
const showTicketDialog = ref(false);

// 选择业务类型
const selectBusinessType = (type) => {
  selectedType.value = type;
  ticketInfo.value = null; // 清除之前的票号信息
};

// 返回首页
const goBack = () => {
  emit('back');
};

// 取票
const getTicket = () => {
  if (!selectedType.value) return;
  
  // 向父组件发送取票请求
  emit('getTicket', selectedType.value);
};

// 设置票号信息
const setTicketInfo = (info) => {
  ticketInfo.value = info;
  showTicketDialog.value = true; // 显示票号弹窗
};

// 设置等待人数
const setWaitingCount = (count) => {
  waitingCount.value = count;
};

// 关闭票号弹窗并返回首页
const closeTicketDialog = () => {
  showTicketDialog.value = false;
  // 返回首页
  emit('back');
};

// 暴露方法给父组件调用
defineExpose({
  setTicketInfo,
  setWaitingCount
});
</script>

<style scoped>
/* 业务类型选择页面样式 */
.business-types-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* 改为顶部对齐，以便底部按钮可以固定 */
  width: 100%;
  height: 100%;
  padding: 80px 1.5vw 1vh; /* 调整顶部内边距，适应70px高的header */
  box-sizing: border-box;
  overflow-y: auto; /* 将滚动设置在整个页面 */
  position: relative;
  padding-bottom: 85px; /* 为底部取票按钮留出空间 */
}

.header {
  display: flex;
  width: 100%;
  position: fixed; /* 固定定位，不随滚动而移动 */
  top: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  min-height: 70px; /* 调整header高度为70px */
  padding: 3px 0; /* 添加极小的上下内边距 */
  background-color: #fff; /* 添加背景色 */
  z-index: 100; /* 确保在最上层 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03); /* 进一步减小阴影效果 */
}

.header-content {
  text-align: center;
  width: calc(100% - 70px); /* 为返回按钮留出空间 */
  margin-left: auto;
  margin-right: auto;
}

.header h1 {
  font-size: calc(var(--base-font-size) * 1.5); /* 增大标题字体 */
  color: #303133;
  margin-bottom: 6px; /* 增加底部边距 */
  margin-top: 0; /* 移除顶部边距 */
  font-weight: 600;
  line-height: 1.3; /* 增加行高 */
}

.header h2 {
  font-size: calc(var(--base-font-size) * 0.9); /* 增大副标题字体 */
  color: #606266;
  font-weight: normal;
  margin-bottom: 0; /* 移除底部边距 */
  margin-top: 0; /* 添加顶部边距 */
  line-height: 1.2; /* 增加行高 */
}

.business-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8vw; /* 进一步减小间距 */
  width: 98%; /* 增加宽度比例，充分利用空间 */
  max-width: 800px;
  margin: 0; /* 移除顶部边距，因为已在视图中设置了顶部内边距 */
  padding: 5px 0 0 0; /* 添加顶部内边距，防止内容被遮挡 */
  /* 移除max-height和overflow-y，让整个页面滚动 */
  flex: 1; /* 让网格占据主要空间 */
  /* 移除padding-bottom，已在业务类型视图中添加 */
}

.business-type-btn {
  display: flex;
  flex-direction: column; /* 确保垂直布局 */
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 8px; /* 稍微减小圆角 */
  padding: 0.8vh 1vw; /* 进一步减小内边距 */
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border-top: 4px solid #409EFF; /* 从左边框改为上边框 */
  margin-bottom: 0.8vh; /* 减小底部边距 */
  height: 18vw; /* 减小高度 */
  max-height: 110px; /* 减小最大高度 */
  min-height: 85px; /* 减小最小高度 */
  overflow: hidden; /* 防止内容溢出 */
}

.business-type-btn:hover {
  transform: translateY(-3px); /* 减小悬浮效果 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.btn-code {
  font-size: clamp(32px, 4.2vw, 36px); /* 增大代码字体 */
  color: #409EFF;
  font-weight: bold;
  margin-bottom: 0.2rem; /* 减少底部边距 */
  line-height: 1;
}

.chinese-text {
  font-size: calc(var(--base-font-size) * 1) !important;
  color: #303133;
  font-weight: bold;
  margin-bottom: 0.5rem; /* 调整中英文间距 */
  line-height: 1.3;
}

.english-text {
  font-size: calc(var(--base-font-size) * 0.9) !important;
  color: #505050;
  line-height: 1.2;
}

/* 按钮内的中文文本 */
.btn-chinese-text {
  font-size: clamp(20px, 3.6vw, 22px); /* 增大中文字体 */
  color: #303133;
  font-weight: bold;
  margin-bottom: 0.1rem; /* 减小底部边距 */
  line-height: 1.1; /* 适当增加行高 */
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 限制为1行 */
  line-clamp: 1; /* 标准属性 */
  -webkit-box-orient: vertical;
}

/* 按钮内的英文文本 */
.btn-english-text {
  font-size: clamp(18px, 2.8vw, 18px); /* 增大英文字体 */
  color: #606266;
  line-height: 1.1; /* 适当增加行高 */
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 限制为1行 */
  line-clamp: 1; /* 标准属性 */
  -webkit-box-orient: vertical;
}

/* 选中状态 */
.business-type-btn.selected {
  background-color: #e6f1fc;
  border-top: 4px solid #1989fa; /* 改为顶部边框 */
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 取票按钮区域 */
.get-ticket-section {
  margin-top: 0;
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直居中 */
  width: 100%;
  position: fixed; /* 固定在底部 */
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.6vh 0; /* 减小上下内边距 */
  background-color: rgba(255, 255, 255, 0.95); /* 半透明背景 */
  z-index: 99;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.08); /* 减小阴影 */
  height: 70px; /* 调整高度 */
  border-top: 1px solid rgba(0, 0, 0, 0.03); /* 添加顶部细边框 */
}

.get-ticket-btn {
  background-color: #67c23a; /* 使用绿色表示取票 */
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8vh 8vw; /* 增加垂直内边距 */
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.4); /* 减小阴影 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0; /* 移除上下边距 */
  height: 56px; /* 增加固定高度 */
}

.get-ticket-btn:hover {
  background-color: #85ce61;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(103, 194, 58, 0.5);
}

.get-ticket-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.5);
}

.get-ticket-btn.disabled {
  background-color: #b3e19d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.get-ticket-btn.disabled:hover {
  background-color: #b3e19d;
  transform: none;
  box-shadow: none;
}

.get-ticket-btn .chinese-text {
  margin-bottom: 2px; /* 增加底部间距 */
  font-size: calc(var(--base-font-size) * 1.3) !important; /* 增大字体 */
  color: white;
  line-height: 1.2;
}

.get-ticket-btn .english-text {
  font-size: calc(var(--base-font-size) * 0.8) !important; /* 增大字体 */
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
}

/* 返回按钮样式 - 左上角小按钮 */
.back-btn {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
  background-color: rgba(144, 147, 153, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 1vh 1vw; /* 减小内边距 */
  max-width: 80px; /* 减小最大宽度 */
  width: auto;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); /* 减小阴影 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 101; /* 确保按钮在最上层 */
}

.back-btn:hover {
  background-color: rgba(144, 147, 153, 0.9);
}

.back-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.back-btn .chinese-text {
  margin-bottom: 0;
  font-size: calc(var(--base-font-size) * 0.8) !important; /* 更小字体 */
  color: white;
  font-weight: normal;
  line-height: 1.1;
}

.back-btn .english-text {
  font-size: calc(var(--base-font-size) * 0.7) !important; /* 更小字体 */
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
}

/* 票号弹窗 */
.ticket-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ticket-dialog {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px; /* 增加最大宽度 */
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box; /* 确保padding不会增加宽度 */
  overflow: hidden; /* 防止内容溢出 */
}

.ticket-dialog-content {
  width: 100%;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 10px;
  padding: 15px; /* 使用固定内边距而不是响应式内边距 */
  text-align: center;
  margin-bottom: 20px;
  box-sizing: border-box; /* 确保padding不会增加宽度 */
  overflow: hidden; /* 防止内容溢出 */
}

.ticket-header {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #c0e3b2;
  width: 100%;
}

.ticket-header .chinese-text {
  font-size: clamp(16px, calc(var(--base-font-size) * 1.1), 22px); /* 使用clamp限制字体大小范围 */
  color: #67c23a;
  font-weight: bold;
  margin-bottom: 3px;
  word-break: break-word; /* 允许长词换行 */
}

.ticket-header .english-text {
  font-size: clamp(14px, calc(var(--base-font-size) * 0.85), 18px); /* 使用clamp限制字体大小范围 */
  color: #85ce61;
  word-break: break-word; /* 允许长词换行 */
}

.ticket-number-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.ticket-label {
  margin-bottom: 8px;
}

.ticket-label .chinese-text {
  font-size: clamp(15px, calc(var(--base-font-size) * 1), 20px);
  color: #303133;
  margin-bottom: 2px;
}

.ticket-label .english-text {
  font-size: clamp(13px, calc(var(--base-font-size) * 0.75), 16px);
  color: #606266;
}

.ticket-number {
  font-size: clamp(36px, calc(var(--base-font-size) * 3.5), 70px); /* 限制最大字体大小 */
  color: #67c23a;
  font-weight: bold;
  margin: 8px 0;
}

.waiting-info {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #c0e3b2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.waiting-label {
  margin-bottom: 8px;
}

.waiting-label .chinese-text {
  font-size: clamp(15px, calc(var(--base-font-size) * 1), 20px);
  color: #303133;
  margin-bottom: 2px;
}

.waiting-label .english-text {
  font-size: clamp(13px, calc(var(--base-font-size) * 0.75), 16px);
  color: #606266;
}

.waiting-count {
  font-size: clamp(28px, calc(var(--base-font-size) * 2.2), 50px); /* 限制最大字体大小 */
  color: #e6a23c;
  font-weight: bold;
}

.ticket-dialog-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.dialog-btn {
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 30px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.4);
}

.dialog-btn:hover {
  background-color: #85ce61;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.5);
}

.dialog-btn .chinese-text {
  margin-bottom: 2px;
  font-size: calc(var(--base-font-size) * 1.1) !important;
  color: white;
  font-weight: bold;
}

.dialog-btn .english-text {
  font-size: calc(var(--base-font-size) * 0.8) !important;
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式布局 - 大屏幕 */
@media (min-width: 1400px) {
  .business-type-grid {
    max-width: 1000px;
  }
  
  .ticket-dialog {
    max-width: 550px; /* 在大屏幕上增加弹窗最大宽度 */
  }
  
  .ticket-dialog-content {
    padding: 20px; /* 在大屏幕上增加内边距 */
  }
}

/* 响应式布局 - 平板电脑 */
@media (max-width: 1024px) {
  .business-type-grid {
    width: 95%;
    gap: 15px;
  }
  
  .business-type-btn {
    padding: 20px 15px;
  }
}

/* 响应式布局 - 大型手机 */
@media (max-width: 768px) {
  .business-types-view {
    padding-top: 75px; /* 调整顶部内边距，适应70px高的header */
    padding-bottom: 75px; /* 为大型手机调整底部内边距 */
  }
  
  .business-type-grid {
    grid-template-columns: 1fr;
    width: 90%;
    margin-bottom: 0; /* 移除底部边距 */
  }
  
  .header {
    min-height: 65px; /* 调整header高度，小于PC端高度 */
    padding-top: 4px; /* 调整顶部内边距 */
    padding-bottom: 4px; /* 调整底部内边距 */
  }
  
  .header h1 {
    font-size: calc(var(--base-font-size) * 1.4);
    margin-bottom: 5px; /* 增加底部边距 */
    line-height: 1.2; /* 增加行高 */
  }
  
  .header h2 {
    font-size: calc(var(--base-font-size) * 0.85);
    line-height: 1.1; /* 增加行高 */
  }
  
  .business-type-btn {
    padding: 10px;
    height: 80px; /* 固定高度 */
    max-height: none;
    min-height: 80px;
  }
  
  .get-ticket-section {
    padding: 0.5vh 0; /* 减小内边距 */
  }
  
  .get-ticket-btn {
    width: 60%;
    padding: 1vh 8vw; /* 减小内边距 */
  }
}

/* 响应式布局 - 小型手机 */
@media (max-width: 480px) {
  .business-types-view {
    padding-top: 65px; /* 调整顶部内边距，适应更小的header */
    padding-bottom: 60px; /* 为小屏幕设备减小底部内边距 */
  }

  .header {
    min-height: 60px; /* 调整header高度，比大型手机更小 */
    padding-top: 3px; /* 调整顶部内边距 */
    padding-bottom: 3px; /* 调整底部内边距 */
  }
  
  .header h1 {
    font-size: calc(var(--base-font-size) * 1.3); /* 增大标题字体 */
    margin-top: 0; /* 移除顶部边距 */
    margin-bottom: 3px; /* 增加底部边距 */
    line-height: 1.2; /* 增加行高 */
  }
  
  .header h2 {
    font-size: calc(var(--base-font-size) * 0.8); /* 增大副标题字体 */
    margin-bottom: 0; /* 移除底部边距 */
    line-height: 1.1; /* 增加行高 */
  }
  
  .business-type-grid {
    width: 95%;
    gap: 8px;
    margin-top: 1vh; /* 减小与header的距离 */
    margin-bottom: 0; /* 移除底部外边距 */
  }
  
  .business-type-btn {
    padding: 6px 4px; /* 减小内边距 */
    height: 65px; /* 减小高度 */
    max-height: 65px;
    min-height: 65px;
    margin-bottom: 0.5vh; /* 减小底部边距 */
  }
  
  .btn-code {
    margin-bottom: 0.3rem;
    font-size: clamp(16px, 4vw, 22px); /* 调整小屏幕下的代码字体大小 */
  }
  
  .btn-chinese-text {
    margin-bottom: 0.2rem;
    font-size: clamp(14px, 3.5vw, 20px); /* 调整小屏幕下的中文字体大小 */
  }
  
  .btn-english-text {
    font-size: clamp(11px, 2.6vw, 16px); /* 调整小屏幕下的英文字体大小 */
  }
  
  .ticket-number {
    font-size: calc(var(--base-font-size) * 2.5);
  }
  
  .get-ticket-section {
    padding: 0.4vh 0;
    height: 50px; /* 减小固定高度 */
  }
  
  .get-ticket-btn {
    width: 70%;
    padding: 0.6vh 8vw;
    height: 40px; /* 减小按钮高度 */
  }
  
  .get-ticket-btn .chinese-text {
    margin-bottom: 0;
  }
}
</style>
