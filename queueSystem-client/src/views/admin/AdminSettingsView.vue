<template>
  <div class="admin-settings" id="admin-settings">
    <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="logo">
        <span v-if="!isSidebarCollapsed">Admin Panel</span>
        <span v-else>AP</span>
      </div>
      <div class="toggle-sidebar" @click="toggleSidebar">
        <span v-if="!isSidebarCollapsed">&#9664;</span>
        <span v-else>&#9654;</span>
      </div>
      <ul class="nav-menu">
        <li :class="{ active: activeTab === 'system' }" @click="activeTab = 'system'">
          <span class="icon">⚙️</span>
          <span class="menu-text" v-if="!isSidebarCollapsed">Settings</span>
        </li>
        <li :class="{ active: activeTab === 'counters' }" @click="activeTab = 'counters'">
          <span class="icon">🖥️</span>
          <span class="menu-text" v-if="!isSidebarCollapsed">Counters</span>
        </li>
        <li :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
          <span class="icon">🔑</span>
          <span class="menu-text" v-if="!isSidebarCollapsed">Change Password</span>
        </li>
        <li @click="logout">
          <span class="icon">🚪</span>
          <span class="menu-text" v-if="!isSidebarCollapsed">Log out</span>
        </li>
      </ul>
    </div>

    <div class="content" :class="{ 'content-expanded': isSidebarCollapsed }">
      <div class="header">
        <h1>{{ getTabTitle }}</h1>
      </div>

      <!-- 系统设置 -->
      <div v-if="activeTab === 'system'" class="settings-panel">
        <div v-if="isLoading" class="loading">Loading...</div>
        <div v-else>
          <div class="setting-item" v-for="setting in systemSettings" :key="setting.key">
            <div class="setting-header">
              <h3>{{ setting.description_en || setting.description }}</h3>
            </div>
            <div class="setting-content">
              <!-- 根据设置类型显示不同的输入控件 -->
              <input 
                v-if="setting.key === 'ticket_reset_time'" 
                type="time" 
                v-model="setting.value"
              />
              <input 
                v-else-if="isBoolean(setting.value)" 
                type="checkbox" 
                v-model="setting.boolValue"
                @change="updateBooleanValue(setting)"
              />
              <input 
                v-else-if="isNumber(setting.value)" 
                type="number" 
                v-model.number="setting.value"
              />
              <input 
                v-else 
                type="text" 
                v-model="setting.value"
              />
              <button class="btn-save" @click="saveSetting(setting)">Save</button>
            </div>
          </div>
          
          <!-- 如果没有设置项，显示提示信息 -->
          <div v-if="systemSettings.length === 0" class="empty-settings">
            <h3>System settings have been simplified</h3>
            <p>Most system settings (including system name, IP binding features, etc.) have been removed.</p>
          </div>
        </div>
      </div>

      
      <!-- Counters面板 -->
      <div v-if="activeTab === 'counters'" class="counters-panel">
        <div v-if="isLoading" class="loading">Loading...</div>
        <div v-else>
          <div class="panel-actions">
            <button class="btn-primary" @click="showCounterForm = true; currentCounter = {}">
              Add Counter
            </button>
          </div>

          <table class="counters-table">
            <thead>
              <tr>
                <th>Counter Number</th>
                <th>Name</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="counter in counters" :key="counter.id">
                <td>{{ counter.counterNumber }}</td>
                <td>{{ counter.name }}</td>
                <td>{{ counter.ipAddress || 'Not Set' }}</td>
                <td>
                  <button class="btn-small" @click="editCounter(counter)">Edit</button>
                  <button class="btn-small btn-danger" @click="confirmDeleteCounter(counter)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Counter表单弹窗 -->
          <div class="modal" v-if="showCounterForm">
            <div class="modal-content">
              <div class="modal-header">
                <h2>{{ currentCounter.id ? 'Edit Counter' : 'Add Counter' }}</h2>
                <span class="close" @click="showCounterForm = false">&times;</span>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>Counter Number</label>
                  <input type="number" v-model.number="currentCounter.counterNumber" placeholder="Enter counter number" />
                </div>
                <div class="form-group">
                  <label>Counter Name</label>
                  <input type="text" v-model="currentCounter.name" placeholder="Enter counter name" />
                </div>
                <div class="form-group">
                  <label>IP Address (Optional)</label>
                  <input type="text" v-model="currentCounter.ipAddress" placeholder="Enter IP address" />
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-cancel" @click="showCounterForm = false">Cancel</button>
                <button class="btn-primary" @click="saveCounter">Save</button>
              </div>
            </div>
          </div>
          
          <!-- 如果没有数据，显示提示信息 -->
          <div v-if="counters.length === 0" class="empty-settings">
            <h3>No counters found</h3>
            <p>There are no counters in the system.</p>
          </div>
        </div>
        
        <!-- 删除确认弹窗 -->
        <ConfirmModal
          v-model:visible="showDeleteConfirm"
          title="Confirm Delete"
          :message="`Are you sure you want to delete counter '${counterToDelete?.name || ''}'?`"
          @confirm="deleteCounter"
        />
      </div>

      <!-- 密码设置 -->
      <div v-if="activeTab === 'password'" class="password-panel">
        <div class="setting-item">
          <div class="setting-header">
            <h3>Change Administrator Password</h3>
          </div>
          <div class="setting-content">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" v-model="passwordForm.currentPassword" placeholder="Enter current password" />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" v-model="passwordForm.newPassword" placeholder="Enter new password" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" v-model="passwordForm.confirmPassword" placeholder="Confirm new password" />
            </div>
            <div class="error" v-if="passwordError">{{ passwordError }}</div>
            <button class="btn-save" @click="changePassword">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import messageService from '@/utils/messageService';
import ConfirmModal from '@/components/ConfirmModal.vue';

export default {
  name: 'AdminSettingsView',
  components: {
    ConfirmModal
  },
  setup() {
    const router = useRouter();
    const activeTab = ref('system');
    const isLoading = ref(false);
    const systemSettings = ref([]);
    const counters = ref([]);
    const showCounterForm = ref(false);
    const currentCounter = ref({});
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const passwordError = ref('');
    const isSidebarCollapsed = ref(false);
    
    // 使用全局消息服务

    // 检查是否已登录
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
      }
    };
    
    // 判断值是否为布尔类型
    const isBoolean = (value) => {
      return value === 'true' || value === 'false' || value === true || value === false;
    };
    
    // 判断值是否为数字类型
    const isNumber = (value) => {
      return !isNaN(Number(value)) && value !== '' && value !== true && value !== false;
    };
    
    // 更新布尔值
    const updateBooleanValue = (setting) => {
      setting.value = setting.boolValue ? 'true' : 'false';
    };

    // 获取标签标题
    const getTabTitle = computed(() => {
      switch (activeTab.value) {
        case 'system': return 'Settings';
        case 'counters': return 'Counters';
        case 'password': return 'Change Password';
        default: return 'Settings';
      }
    });


    // 获取系统设置
    const fetchSettings = async () => {
      try {
        isLoading.value = true;
        const token = localStorage.getItem('adminToken');
        
        const response = await api.get('/admin-system/settings', {
          headers: {
            'Admin-Token': token
          }
        });

        // 过滤掉ID为1的设置项，保留其他所有设置
        const filteredSettings = response.data.filter(setting => 
          setting.id !== 1
        );
        
        systemSettings.value = filteredSettings;
      } catch (error) {
        console.error('获取系统设置失败:', error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        isLoading.value = false;
      }
    };


    // 获取窗口列表
    const fetchCounters = async () => {
      // 先关闭之前可能存在的错误消息
      closeMessage();
      
      try {
        isLoading.value = true;
        const token = localStorage.getItem('adminToken');
        
        // 使用adminService获取窗口列表
        const response = await api.adminService.getCounters(token);
        
        // 成功获取数据
        counters.value = response.data;
        // console.log('成功获取counters数据:', counters.value);
      } catch (error) {
        console.error('Failed to get counters:', error);
        // 使用带有自动关闭时间的错误消息，3秒后自动关闭
        showMessage('error', 'Error', 'Failed to load counters data', 3000);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        isLoading.value = false;
      }
    };

    // 保存系统设置
    const saveSetting = async (setting) => {
      try {
        isLoading.value = true;
        const token = localStorage.getItem('adminToken');
        
        await api.put(`/admin-system/settings/${setting.key}`, {
          value: setting.value
        }, {
          headers: {
            'Admin-Token': token
          }
        });
        
        showMessage('success', 'Success', 'Settings saved successfully!');
      } catch (error) {
        console.error('保存设置失败:', error);
        showMessage('error', 'Error', 'Failed to save settings: ' + (error.response?.data?.message || 'Unknown error'));
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    // 编辑counter
    const editCounter = (counter) => {
      // 直接使用服务器返回的字段名，保持一致性
      currentCounter.value = { 
        id: counter.id,
        counterNumber: counter.counterNumber,
        name: counter.name,
        ipAddress: counter.ipAddress
      };
      showCounterForm.value = true;
    };

    // 保存counter
    const saveCounter = async () => {
      try {
        if (!currentCounter.value.counterNumber || !currentCounter.value.name) {
          showMessage('error', 'Validation Error', 'Counter number and name cannot be empty');
          return;
        }

        isLoading.value = true;
        const token = localStorage.getItem('adminToken');
        
        if (currentCounter.value.id) {
          // 更新counter - 直接使用模型字段名
          await api.adminService.updateCounter(currentCounter.value.id, currentCounter.value, token);
        } else {
          // 创建counter - 直接使用模型字段名
          await api.adminService.createCounter(currentCounter.value, token);
        }
        
        showCounterForm.value = false;
        fetchCounters();
        showMessage('success', 'Success', currentCounter.value.id ? 'Counter updated successfully!' : 'Counter created successfully!');
      } catch (error) {
        console.error('保存counter失败:', error);
        showMessage('error', 'Error', 'Failed to save counter: ' + (error.response?.data?.message || 'Unknown error'));
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        isLoading.value = false;
      }
    };

    // 删除counter相关变量
    const counterToDelete = ref(null);
    const showDeleteConfirm = ref(false);
    
    // 显示删除确认弹窗
    const confirmDeleteCounter = (counter) => {
      counterToDelete.value = counter;
      showDeleteConfirm.value = true;
    };
    
    // 删除counter
    const deleteCounter = async () => {
      try {
        isLoading.value = true;
        const token = localStorage.getItem('adminToken');
        
        if (!counterToDelete.value || !counterToDelete.value.id) {
          throw new Error('Invalid counter ID');
        }
        
        // 无条件删除，不再检查是否有正在处理的票号
        
        await api.adminService.deleteCounter(counterToDelete.value.id, token);
        
        fetchCounters();
        showMessage('success', 'Success', 'Counter deleted successfully!');
        counterToDelete.value = null;
      } catch (error) {
        console.error('删除counter失败:', error);
        // 直接使用后端返回的错误消息，避免重复
        showMessage('error', 'Error', error.response?.data?.message || 'Failed to delete counter');
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        isLoading.value = false;
      }
    };


    // 修改密码
    const changePassword = async () => {
      if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
        passwordError.value = 'All password fields are required';
        return;
      }
      
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordError.value = 'The new passwords do not match';
        return;
      }
      
      try {
        isLoading.value = true;
        passwordError.value = '';
        const token = localStorage.getItem('adminToken');
        
        await api.post('/admin-system/change-password', {
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        }, {
          headers: {
            'Admin-Token': token
          }
        });
        
        showMessage('success', 'Success', 'Password changed successfully! Please log in again');
        logout();
      } catch (error) {
        console.error('修改密码失败:', error);
        passwordError.value = error.response?.data?.message || 'Failed to change password';
        if (error.response && error.response.status === 401 && !error.response?.data?.message) {
          logout();
        }
      } finally {
        isLoading.value = false;
      }
    };

    // 退出登录
    const logout = () => {
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    };

    onMounted(() => {
      checkAuth();
      
      // 恢复侧边栏状态
      const savedState = localStorage.getItem('sidebar_collapsed');
      if (savedState === 'true') {
        isSidebarCollapsed.value = true;
      }
      
      // 根据当前标签加载数据
      if (activeTab.value === 'system') {
        fetchSettings();
      } else if (activeTab.value === 'counters') {
        fetchCounters();
      }

      // 设置内容区域高度以适应视口
      adjustContentHeight();
      window.addEventListener('resize', adjustContentHeight);
    });
    
    // 处理布尔值的设置项
    const handleBooleanSettings = () => {
      systemSettings.value.forEach(setting => {
        if (isBoolean(setting.value)) {
          setting.boolValue = setting.value === 'true' || setting.value === true;
        }
      });
    };
    
    // 监听systemSettings变化，处理布尔值
    watch(systemSettings, () => {
      handleBooleanSettings();
    }, { deep: true });

    // 调整内容区域高度
    const adjustContentHeight = () => {
      // 使用requestAnimationFrame确保DOM已更新
      requestAnimationFrame(() => {
        const adminSettings = document.getElementById('admin-settings');
        if (adminSettings) {
          const viewportHeight = window.innerHeight;
          adminSettings.style.height = `${viewportHeight}px`;
        }
      });
    };

    // 监听标签切换
    const watchActiveTab = (newTab) => {
      if (newTab === 'system') {
        fetchSettings();
      } else if (newTab === 'counters') {
        fetchCounters();
      }
    };

    // 切换侧边栏展开/折叠状态
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
      // 保存用户偏好到本地存储
      localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.value ? 'true' : 'false');
    };
    
    // 删除重复的onMounted，因为前面已经有一个

    // 使用全局消息服务的方法
    const showMessage = (type, title, text) => {
      messageService.showMessage(type, title, text);
    };
    const closeMessage = () => {
      messageService.closeMessage();
    };
    
    return {
      activeTab,
      isLoading,
      systemSettings,
      counters,
      showCounterForm,
      currentCounter,
      passwordForm,
      passwordError,
      isSidebarCollapsed,
      counterToDelete,
      showDeleteConfirm,
      getTabTitle,
      saveSetting,
      editCounter,
      saveCounter,
      deleteCounter,
      confirmDeleteCounter,
      changePassword,
      logout,
      toggleSidebar,
      watchActiveTab,
      adjustContentHeight,
      isBoolean,
      isNumber,
      updateBooleanValue,
      showMessage,
      closeMessage
    };
  },
  watch: {
    activeTab(newTab) {
      this.watchActiveTab(newTab);
    }
  }
};
</script>

<style scoped>
.admin-settings {
  display: block; /* 改为block布局，因为侧边栏已固定定位 */
  min-height: 100vh;
  max-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  overflow-x: hidden; /* 防止水平滚动 */
}

.sidebar {
  width: 200px;
  background-color: #2c3e50;
  color: white;
  padding-top: 1rem;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  height: 100vh;
}

.sidebar-collapsed {
  width: 60px;
}

.logo {
  padding: 1.5rem 0.5rem;
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  border-bottom: 1px solid #34495e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-sidebar {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #95a5a6;
  font-size: 14px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.toggle-sidebar:hover {
  background-color: #34495e;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.nav-menu li {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.nav-menu li .icon {
  margin-right: 10px;
  font-size: 18px;
  width: 24px;
  display: flex;
  justify-content: center;
}

.sidebar-collapsed .nav-menu li .icon {
  margin-right: 0;
}

.menu-text {
  white-space: nowrap;
}

.nav-menu li:hover {
  background-color: #34495e;
}

.nav-menu li.active {
  background-color: #3498db;
}

.content {
  flex: 1;
  padding: 1.5rem;
  transition: margin-left 0.3s ease;
  margin-left: 200px; /* 与侧边栏宽度相同 */
  width: calc(100% - 200px);
  height: 100vh;
  overflow-y: auto; /* 允许内容垂直滚动 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
}

/* 侧边栏折叠时调整内容区域 */
.content-expanded {
  margin-left: 60px; /* 与折叠后侧边栏宽度相同 */
  width: calc(100% - 60px);
  box-sizing: border-box; /* 确保计算正确 */
}

.header {
  display: flex;
  justify-content: flex-start; /* 左对齐，不需要两端对齐了 */
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  color: #333;
}

/* 已删除logout样式，因为不再使用右上角的logout按钮 */

.settings-panel,
.devices-panel,
.counters-panel,
.password-panel {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-settings {
  text-align: center;
  padding: 2rem 0;
}

.empty-settings h3 {
  font-size: 1.4rem;
  color: #777;
  margin-bottom: 1rem;
}

.empty-settings p {
  color: #999;
  max-width: 600px;
  margin: 0 auto;
}

.setting-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-header h3 {
  margin-top: 0;
  color: #333;
}

.setting-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.setting-content input,
.setting-content select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 1rem;
  max-width: 300px;
  box-sizing: border-box; /* 确保包含padding和border */
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* 确保包含padding和border */
}

.btn-save,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover,
.btn-primary:hover {
  background-color: #2980b9;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #95a5a6;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 0.5rem;
}

.btn-cancel:hover {
  background-color: #7f8c8d;
}

.btn-small {
  padding: 0.3rem 0.6rem;
  margin-right: 0.3rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 3px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
}

.btn-danger {
  background-color: #e74c3c;
}

.btn-bind {
  background-color: #27ae60;
}

.btn-unbind {
  background-color: #f39c12;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.devices-table,
.counters-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  table-layout: fixed; /* 固定表格布局 */
}

.devices-table th,
.devices-table td,
.counters-table th,
.counters-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.devices-table th {
  background-color: #f9f9f9;
  font-weight: bold;
}

.panel-actions {
  margin-bottom: 1.5rem;
}

.error {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 0 20px; /* 确保在小屏幕上有边距 */
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
}

.close {
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}
/* 移除了消息弹窗样式，因为已经移到独立组件中 */
</style>
