<template>
  <div class="display-container">
    <div class="header">
      <div class="header-image">
        <img src="/pic/display_bg.png" alt="Display Background" />
      </div>
    </div>
    
    <div class="content">
      <div 
        v-for="item in displayData" 
        :key="item.business_type_id"
        class="business-row"
      >
        <!-- 左侧1/3区域：业务信息 -->
        <div class="business-info">
          <div class="business-code">{{ item.code }}</div>
          <div class="business-name">{{ item.name }}</div>
          <div class="business-english-name">{{ item.english_name || '' }}</div>
        </div>
        
        <!-- 右侧2/3区域：最新服务号及对应柜台 -->
        <div class="service-info">
          <div v-if="item.last_ticket_no && item.counter_number" class="service-details">
            <!-- 第一行：标题 -->
            <div class="service-header">
              <div class="ticket-label">
                <div>現時籌號</div>
                <div>Current Queue No.</div>
              </div>
              <div class="arrow-placeholder"></div>
              <div class="counter-label">
                <div>櫃台</div>
                <div>Counter</div>
              </div>
            </div>
            <!-- 第二行：数据 -->
            <div class="service-data">
              <div class="ticket-number">{{ item.last_ticket_no }}</div>
              <div class="arrow">➜</div>
              <div class="counter-number">{{ item.counter_number }}</div>
            </div>
          </div>
          <div v-else class="no-service">
            <div class="no-service-text">
              <div>暫無服務記錄</div>
              <div>No Service Record</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 备注信息显示区域 -->
    <div v-if="displayRemarks" class="remarks-area">
      <div ref="remarksContentRef" class="remarks-content">{{ displayRemarks }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { businessTypeService } from '@/api';
import socket from '@/socket';

const displayData = ref([]);
const displayRemarks = ref('');
const remarksContentRef = ref(null);
const backgroundColor = ref('#1e7e34'); // 默认绿色
let refreshInterval = null;
let resizeObserver = null;
let handleResize = null;

// 获取显示数据
const fetchDisplayData = async () => {
  try {
    const response = await businessTypeService.getDisplayData();
    displayData.value = response.data || [];
  } catch (error) {
    console.error('获取显示数据失败:', error);
    displayData.value = [];
  }
};

// 获取显示屏备注
const fetchDisplayRemarks = async () => {
  try {
    const response = await businessTypeService.getDisplayRemarks();
    displayRemarks.value = response.data?.value || '';
    // 等待DOM更新后调整字体大小
    await nextTick();
    adjustRemarksFontSize();
  } catch (error) {
    console.error('获取显示屏备注失败:', error);
    displayRemarks.value = '';
  }
};

// 从图片中提取背景色
const extractBackgroundColor = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/pic/display_bg.png';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 从图片的四个角和中心区域采样颜色
        const samplePoints = [
          { x: 0, y: 0 }, // 左上角
          { x: img.width - 1, y: 0 }, // 右上角
          { x: 0, y: img.height - 1 }, // 左下角
          { x: img.width - 1, y: img.height - 1 }, // 右下角
          { x: Math.floor(img.width / 2), y: Math.floor(img.height / 2) } // 中心
        ];
        
        const colors = samplePoints.map(point => {
          const imageData = ctx.getImageData(point.x, point.y, 1, 1);
          const [r, g, b] = imageData.data;
          return { r, g, b };
        });
        
        // 计算平均颜色
        const avgColor = {
          r: Math.round(colors.reduce((sum, c) => sum + c.r, 0) / colors.length),
          g: Math.round(colors.reduce((sum, c) => sum + c.g, 0) / colors.length),
          b: Math.round(colors.reduce((sum, c) => sum + c.b, 0) / colors.length)
        };
        
        // 转换为十六进制
        const hexColor = `#${avgColor.r.toString(16).padStart(2, '0')}${avgColor.g.toString(16).padStart(2, '0')}${avgColor.b.toString(16).padStart(2, '0')}`;
        resolve(hexColor);
      } catch (error) {
        console.error('提取背景色失败:', error);
        resolve('#1e7e34'); // 失败时使用默认颜色
      }
    };
    
    img.onerror = () => {
      console.error('加载图片失败');
      resolve('#1e7e34'); // 失败时使用默认颜色
    };
  });
};

// 动态调整备注文字大小
const adjustRemarksFontSize = () => {
  if (!remarksContentRef.value) return;
  
  const element = remarksContentRef.value;
  const container = element.parentElement;
  
  if (!container) return;
  
  // 获取容器尺寸（减去padding）
  const containerHeight = container.clientHeight - 40; // 上下各20px padding
  const containerWidth = container.clientWidth - 40; // 左右各20px padding
  
  // 检查是否超出容器（允许一些容差，避免因为像素舍入导致的误判）
  const checkFit = () => {
    const scrollHeight = element.scrollHeight;
    const scrollWidth = element.scrollWidth;
    
    // 允许2px的容差，避免因为浏览器渲染精度问题导致的误判
    // 主要检查scrollHeight和scrollWidth，因为这是实际内容的大小
    return scrollHeight <= containerHeight + 2 && 
           scrollWidth <= containerWidth + 2;
  };
  
  // 使用更大的字体范围，充分利用空间
  // 根据容器高度动态计算最大字体
  // 考虑line-height 1.4，每行高度约为 fontSize * 1.4
  // 允许最多3行，所以最大字体 = 容器高度 / (3 * 1.4) ≈ 容器高度 / 4.2
  const maxFontSizeByHeight = Math.floor(containerHeight / 4.2);
  const maxFontSizeByWidth = Math.floor(containerWidth / 8); // 更宽松的宽度计算
  const calculatedMaxFontSize = Math.min(maxFontSizeByHeight, maxFontSizeByWidth, 72); // 最大不超过72px
  
  // 二分查找合适的字体大小
  let minFontSize = 6;
  let maxFontSize = Math.max(24, calculatedMaxFontSize); // 至少从24px开始，但可以更大
  let bestSize = minFontSize;
  let fontSize;
  
  // 先尝试从较大的字体开始
  while (minFontSize <= maxFontSize) {
    fontSize = Math.floor((minFontSize + maxFontSize) / 2);
    element.style.fontSize = `${fontSize}px`;
    
    // 等待浏览器重新渲染
    void element.offsetHeight;
    
    if (checkFit()) {
      bestSize = fontSize;
      minFontSize = fontSize + 1;
    } else {
      maxFontSize = fontSize - 1;
    }
  }
  
  // 应用最佳字体大小
  element.style.fontSize = `${bestSize}px`;
};

// 监听备注内容变化
watch(displayRemarks, async (newVal) => {
  if (newVal) {
    await nextTick();
    // 如果ResizeObserver还没有初始化，现在初始化
    if (!resizeObserver && remarksContentRef.value && remarksContentRef.value.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        adjustRemarksFontSize();
      });
      resizeObserver.observe(remarksContentRef.value.parentElement);
    }
    adjustRemarksFontSize();
  }
});

// 初始化
onMounted(async () => {
  // 提取图片背景色并应用到页面
  const bgColor = await extractBackgroundColor();
  backgroundColor.value = bgColor;
  
  // 立即获取一次数据
  fetchDisplayData();
  fetchDisplayRemarks();
  
  // 每5秒刷新一次数据
  refreshInterval = setInterval(() => {
    fetchDisplayData();
    fetchDisplayRemarks();
  }, 5000);
  
  // 监听叫号事件，刷新显示数据
  socket.on('ticket:nextCalled', async () => {
    console.log('收到叫号事件，刷新显示数据');
    // 立即刷新显示数据
    await fetchDisplayData();
  });
  
  // 监听窗口大小变化
  handleResize = () => {
    adjustRemarksFontSize();
  };
  window.addEventListener('resize', handleResize);
  
  // 初始化ResizeObserver（延迟执行，确保DOM已渲染）
  nextTick(() => {
    if (remarksContentRef.value && remarksContentRef.value.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        adjustRemarksFontSize();
      });
      resizeObserver.observe(remarksContentRef.value.parentElement);
    }
  });
  
});

// 清理定时器和事件监听器
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  // 移除 socket 事件监听器
  socket.off('ticket:nextCalled');
  // 清理窗口resize监听器
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
  }
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.display-container {
  background-color: v-bind(backgroundColor);
  height: 100vh;
  padding: 2px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  padding: 0;
  flex-shrink: 0;
  width: 100%;
  height: calc(100vh / 13 + 20px);
  box-sizing: border-box;
}

.header-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  flex-shrink: 1;
}

.content {
  display: flex;
  flex-direction: column;
  gap: clamp(5px, 1vh, 10px);
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.business-row {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: clamp(8px, 1.5vh, 15px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 0;
  flex: 1 1 0;
  align-items: center;
}

/* 左侧1/3区域：业务信息 */
.business-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-right: 15px;
  border-right: 2px solid #e4e7ed;
}

.business-code {
  font-size: clamp(60px, 12vw, 140px);
  font-weight: bold;
  color: #1e7e34;
  margin-bottom: -10px;
  line-height: 0.8;
  text-align: center;
  width: 100%;
  padding: 0;
  display: block;
}

.business-name {
  font-size: clamp(14px, 2vw, 24px);
  color: #303133;
  margin-top: 6px;
  margin-bottom: 2px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.business-english-name {
  font-size: clamp(12px, 1.5vw, 18px);
  color: #909399;
  font-style: italic;
  text-align: center;
  line-height: 1.2;
  margin-top: 0;
}

/* 右侧2/3区域：服务信息 */
.service-info {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 15px;
}

.service-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 第一行：标题 */
.service-header {
  display: flex;
  align-items: center;
}

.ticket-label {
  font-size: clamp(12px, 1.8vw, 20px);
  color: #606266;
  font-weight: 500;
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}

.counter-label {
  font-size: clamp(12px, 1.8vw, 20px);
  color: #606266;
  font-weight: 500;
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}

/* 箭头占位（标题行） */
.arrow-placeholder {
  flex: 0 0 auto;
  width: clamp(36px, 6vw, 72px);
  margin: 0 10px;
  text-align: center;
}

/* 第二行：数据 */
.service-data {
  display: flex;
  align-items: center;
}

.ticket-number {
  font-size: clamp(36px, 6vw, 72px);
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
  flex: 1;
  text-align: center;
}

.arrow {
  font-size: clamp(36px, 6vw, 72px);
  color: #1e7e34;
  font-weight: bold;
  flex: 0 0 auto;
  width: clamp(36px, 6vw, 72px);
  margin: 0 10px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(30, 126, 52, 0.3);
  filter: drop-shadow(0 2px 4px rgba(30, 126, 52, 0.2));
}

.counter-number {
  font-size: clamp(36px, 6vw, 72px);
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
  flex: 1;
  text-align: center;
}

.no-service {
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-service-text {
  font-size: clamp(14px, 2vw, 24px);
  color: #c0c4cc;
  font-style: italic;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* 备注信息显示区域 */
.remarks-area {
  margin-top: 0px;
  padding: 20px;
  flex-shrink: 0;
  height: calc(100vh / 13 + 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.remarks-content {
  font-size: 24px; /* 初始字体大小，会被JavaScript动态调整 */
  color: #000000;
  text-align: center;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .business-code {
    font-size: 90px;
  }
  
  .business-name {
    font-size: 20px;
  }
  
  .business-english-name {
    font-size: 16px;
  }
  
  .ticket-number {
    font-size: 54px;
  }
  
  .counter-number {
    font-size: 54px;
  }
  
  .arrow {
    font-size: 54px;
    width: 54px;
  }
  
  .ticket-label,
  .counter-label {
    font-size: 16px;
  }
}
</style>
