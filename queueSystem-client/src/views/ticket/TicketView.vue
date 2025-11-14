<template>
  <div class="ticket-container">
    <div class="content-wrapper">
      <!-- 首页视图 -->
      <div v-if="currentView === 'home'" class="home-view">
        <div class="image-section">
          <img :src="bannerImage" alt="Banner" class="banner-image" />
        </div>
        <!-- 添加日期时间显示 -->
        <div class="date-time-display">
          <div class="current-date">{{ currentDateFormatted }}</div>
          <div class="current-time">{{ currentTimeFormatted }}</div>
        </div>
        <div class="action-section">
          <button class="select-service-btn" @click="showBusinessTypes">
            <div class="chinese-text">選擇辦理業務</div>
            <div class="english-text">Select Service</div>
          </button>
        </div>
      </div>

      <!-- 业务类型选择视图（使用独立组件） -->
      <BusinessTypeSelector 
        v-else-if="currentView === 'business-types'"
        :businessTypes="businessTypesWithEnglish"
        @back="returnToHome"
        @getTicket="handleGetTicket"
        ref="businessTypeSelectorRef"
      />
    </div>
  </div>

  <!-- 错误提示弹窗 -->
  <div v-if="showErrorDialog" class="custom-dialog-overlay" @click="closeErrorDialog">
    <div class="custom-dialog" @click.stop>
      <div class="dialog-icon">
        <div class="error-icon">!</div>
      </div>
      <div class="dialog-content">
        <div class="dialog-title">
          <div class="chinese-text">{{ errorType === 'noSelection' ? '提示' : '功能不可用' }}</div>
          <div class="english-text">{{ errorType === 'noSelection' ? 'Reminder' : 'Service Unavailable' }}</div>
        </div>
        <div class="dialog-message">
          <template v-if="errorType === 'noSelection'">
            <div class="chinese-text">請先選擇業務類型</div>
            <div class="english-text">Please select a service type first</div>
          </template>
          <template v-else-if="errorType === 'serviceRemoved'">
            <div class="chinese-text">此功能已不可用</div>
            <div class="english-text">This feature is no longer available</div>
          </template>
          <template v-else>
            <div class="chinese-text">取票失敗，請重試</div>
            <div class="english-text">Failed to get ticket, please try again</div>
          </template>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn" @click="closeErrorDialog">
          <div class="chinese-text">確定</div>
          <div class="english-text">OK</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { businessTypeService, ticketService } from '@/api';
import BusinessTypeSelector from './BusinessTypeSelector.vue';

const businessTypes = ref([]);
const currentDate = ref(new Date());
const timerInterval = ref(null);
const isLoading = ref(false);
const showErrorDialog = ref(false);
const errorType = ref('apiError'); // 'apiError' 或 'noSelection'
const currentView = ref('home'); // 'home' 或 'business-types'
const bannerImage = ref('/pic/ticket_bg.jpg'); // 默认值，会在 onMounted 中从后端获取
const businessTypeSelectorRef = ref(null);

// 格式化日期：年月日 星期几(英文)
const currentDateFormatted = computed(() => {
  const date = currentDate.value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[date.getDay()];
  
  return `${year}-${month}-${day} ${weekday}`;
});

// 格式化时间：时分秒
const currentTimeFormatted = computed(() => {
  const date = currentDate.value;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
});

// 为业务类型准备英文翻译
const businessTypesWithEnglish = computed(() => {
  return businessTypes.value.map(type => ({
    ...type,
    englishName: type.english_name || ''
  }));
});

onMounted(async () => {
  try {
    const response = await businessTypeService.getAll();
    businessTypes.value = response.data;
  } catch (error) {
    console.error('获取业务类型失败:', error);
  }
  
  // 获取自定义背景图片路径
  try {
    const imageResponse = await businessTypeService.getTicketBannerImage();
    if (imageResponse.data?.value) {
      bannerImage.value = imageResponse.data.value;
    }
  } catch (error) {
    console.error('获取取票页面背景图片路径失败:', error);
    // 使用默认值，不阻止页面加载
  }
  
  // 启动时间更新定时器，每秒更新一次
  timerInterval.value = setInterval(() => {
    currentDate.value = new Date();
  }, 1000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

// 切换到业务类型选择页面
const showBusinessTypes = () => {
  currentView.value = 'business-types';
};

// 返回首页
const returnToHome = () => {
  currentView.value = 'home';
};

// 处理子组件的取票事件
const handleGetTicket = async (selectedType) => {
  // 如果已经在加载中，不执行操作
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    // 调用API获取票号
    const response = await ticketService.create(selectedType.id);
    const ticketInfo = response.data;
    
    // 更新子组件中的票号信息和等待人数
    if (businessTypeSelectorRef.value) {
      businessTypeSelectorRef.value.setTicketInfo({
        ticket_number: ticketInfo.ticket_number
      });
      businessTypeSelectorRef.value.setWaitingCount(ticketInfo.waiting_count);
    }
  } catch (error) {
    console.error('取票失败:', error);
    showErrorDialog.value = true;
    errorType.value = 'apiError';
  } finally {
    isLoading.value = false;
  }
};

// 关闭错误弹窗
const closeErrorDialog = () => {
  showErrorDialog.value = false;
};
</script>

<style>
/* 基础样式设置，使用相对单位 */
:root {
  --base-font-size: 20px;  /* 增大基础字体大小 */
}
</style>

<style scoped>
/* 消除默认边距，防止滚动条出现 */
:root, body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 主容器设置为纵向显示 */
.ticket-container {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh; /* 使用固定高度而非最小高度 */
  max-height: 100vh; /* 限制最大高度 */
  background-color: #f5f7fa;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出 */
}

/* 内容包装器，实现垂直排列 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  height: 100%; /* 使用100%高度填充容器 */
  width: 100%;
  box-sizing: border-box;
}

/* 首页样式 */
.home-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/* 图片区域样式 - 占据更多空间 */
.image-section {
  flex: 2; /* 从1增加到2，使图片区域占据更多空间 */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #000;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片覆盖整个区域且保持比例 */
}

/* 日期时间显示区域 */
.date-time-display {
  text-align: center;
  padding: 1.5vh 0;
  background-color: rgba(0, 0, 0, 0.6); /* 半透明黑色背景 */
  color: white;
  width: 100%;
  z-index: 10;
  position: relative;
}

.current-date {
  font-size: calc(var(--base-font-size) * 1.2);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 5px;
}

.current-time {
  font-size: calc(var(--base-font-size) * 1.8);
  font-weight: 700;
  color: white;
}

/* 操作区域样式 - 占据下半部分 */
.action-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
}

/* 选择业务按钮样式 */
.select-service-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 3vh 6vw;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--base-font-size) * 1.5);
}

.select-service-btn:hover {
  background-color: #66b1ff;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.6);
}

.select-service-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.5);
}

.select-service-btn .chinese-text {
  margin-bottom: 0.5rem;
  font-size: calc(var(--base-font-size) * 1.8) !important;
  color: white;
}

.select-service-btn .english-text {
  font-size: calc(var(--base-font-size) * 1.2) !important;
  color: rgba(255, 255, 255, 0.9);
}

/* 首页组件的文本样式 */
.chinese-text {
  font-size: calc(var(--base-font-size) * 1) !important;
  color: #303133;
  font-weight: bold;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.english-text {
  font-size: calc(var(--base-font-size) * 0.9) !important;
  color: #505050;
  line-height: 1.2;
}

/* 自定义弹窗样式 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-dialog {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dialog-icon {
  margin-bottom: 15px;
}

.error-icon {
  width: 60px;
  height: 60px;
  background-color: #f56c6c;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
}

.dialog-content {
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
}

.dialog-title {
  margin-bottom: 10px;
}

.dialog-title .chinese-text {
  font-size: calc(var(--base-font-size) * 1.2) !important;
  color: #303133;
  margin-bottom: 5px;
}

.dialog-title .english-text {
  font-size: calc(var(--base-font-size) * 1) !important;
  color: #606266;
}

.dialog-message .chinese-text {
  font-size: calc(var(--base-font-size) * 1.1) !important;
  margin-bottom: 5px;
}

.dialog-message .english-text {
  font-size: calc(var(--base-font-size) * 0.9) !important;
  color: #606266;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.dialog-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 25px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

.dialog-btn:hover {
  background-color: #66b1ff;
}

.dialog-btn .chinese-text {
  margin-bottom: 3px;
  color: white;
}

.dialog-btn .english-text {
  font-size: calc(var(--base-font-size) * 0.8) !important;
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式布局 - 大屏幕 */
@media (min-width: 1400px) {
  :root {
    --base-font-size: 24px;  /* 大屏幕上使用更大字体 */
  }
  
  .business-type-grid {
    max-width: 1000px;
  }
}

/* 响应式布局 - 平板电脑 */
@media (max-width: 1024px) {
  :root {
    --base-font-size: 18px;
  }
  
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
  :root {
    --base-font-size: 17px;
  }
  
  .business-type-grid {
    grid-template-columns: 1fr;
    width: 90%;
  }
  
  .header h1 {
    font-size: calc(var(--base-font-size) * 1.6);
  }
  
  .header h2 {
    font-size: calc(var(--base-font-size) * 1.2);
  }
  
  .business-type-btn {
    padding: 15px;
  }
  
  .get-ticket-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .get-ticket-btn, .back-btn {
    width: 60%;
  }
}

/* 响应式布局 - 小型手机 */
@media (max-width: 480px) {
  :root {
    --base-font-size: 14px;
  }
  
  .header {
    margin-bottom: 2vh;
  }
  
  .header h1 {
    font-size: calc(var(--base-font-size) * 1.4);
  }
  
  .header h2 {
    font-size: calc(var(--base-font-size) * 1.1);
  }
  
  .business-type-grid {
    width: 95%;
    gap: 10px;
  }
  
  .business-type-btn {
    padding: 12px 10px;
  }
  
  .btn-icon {
    font-size: calc(var(--base-font-size) * 1.5);
    margin-right: 8px;
  }
  
  .ticket-number {
    font-size: calc(var(--base-font-size) * 3);
  }
  
  .custom-dialog {
    width: 95%;
    padding: 15px;
  }
  
  .error-icon {
    width: 50px;
    height: 50px;
    font-size: 30px;
  }
  
  .select-service-btn {
    padding: 2vh 8vw;
  }
  
  .select-service-btn .chinese-text {
    font-size: calc(var(--base-font-size) * 1.5) !important;
  }
  
  .select-service-btn .english-text {
    font-size: calc(var(--base-font-size) * 1) !important;
  }
}
</style>
