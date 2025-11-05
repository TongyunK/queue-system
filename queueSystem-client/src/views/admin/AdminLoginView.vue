<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <h1>管理员登录</h1>
        <div class="logo-icon">
          <i class="lock-icon"></i>
        </div>
      </div>
      
      <div class="form-content">
        <div class="form-group">
          <label for="password">管理员密码</label>
          <div class="input-wrapper">
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="请输入管理员密码"
              @keyup.enter="login"
              autocomplete="current-password"
            />
          </div>
        </div>
        
        <div class="error-container">
          <div class="error" v-if="error">{{ error }}</div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-primary" @click="login" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

export default {
  name: 'AdminLoginView',
  setup() {
    const password = ref('');
    const error = ref('');
    const isLoading = ref(false);
    const router = useRouter();

    const login = async () => {
      if (!password.value) {
        error.value = '请输入密码';
        return;
      }

      try {
        isLoading.value = true;
        error.value = '';

        const response = await api.adminService.login(password.value);

        // 保存登录令牌到本地存储
        localStorage.setItem('adminToken', response.data.token);
        
        // 跳转到管理页面
        router.push('/admin/settings');
      } catch (err) {
        if (err.response && err.response.data) {
          error.value = err.response.data.message || '登录失败';
        } else {
          error.value = '登录失败，请稍后再试';
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      password,
      error,
      isLoading,
      login
    };
  }
};
</script>

<style scoped>
.admin-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-container {
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.login-header {
  margin-bottom: 2rem;
}

.logo-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.lock-icon {
  display: inline-block;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #3498db;
  position: relative;
}

.lock-icon::before {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 16px;
  border: 4px solid white;
  border-radius: 8px;
}

.lock-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -30%);
  width: 8px;
  height: 18px;
  background-color: white;
  border-radius: 2px;
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.8rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
  text-align: left;
}

.input-wrapper {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #546e7a;
  font-weight: 500;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  outline: none;
}

.error-container {
  min-height: 1.5rem;
  width: 100%;
  margin-bottom: 1rem;
}

.error {
  color: #e74c3c;
  text-align: left;
  font-size: 0.9rem;
}

.button-container {
  width: 100%;
}

.btn {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 6px;
  background-color: #3498db;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .lock-icon {
    width: 50px;
    height: 50px;
  }
  
  .lock-icon::before {
    width: 24px;
    height: 13px;
  }
}
</style>
