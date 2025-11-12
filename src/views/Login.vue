<template>
  <div class="biggestBox">
    <div class="box">
      <!-- 左侧表单区 -->
      <div class="form-section">
        <h1 class="title">欢迎回来</h1>
        <p class="subtitle">请登录您的账户以继续使用服务</p>

        <!-- Tab 切换（用 el-tabs） -->
        <el-tabs v-model="activeTab" class="tab-container" @tab-click="handleTabClick">
          <el-tab-pane label="登录" name="login" class="tab-container-login"></el-tab-pane>
          <el-tab-pane label="注册" name="register" class="tab-container-register"></el-tab-pane>
        </el-tabs>

        <!-- 表单 -->
        <div class="form-group">
          <!-- 邮箱输入 -->
          <div class="form-item">
            <label>邮箱地址</label>
            <div class="input-wrapper">
              <input type="email" class="input-field" placeholder="请输入您的邮箱地址" />
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="form-item">
            <label>密码</label>
            <div class="input-wrapper">
              <input type="password" class="input-field" placeholder="请输入您的密码" />
            </div>
          </div>
        </div>

        <div class="forgetPassword">
          <span class="remMe">记住我</span>
          <span class="Password">忘记密码?</span>
        </div>

        <el-button type="primary" native-type="submit" class="login-btn" style="width: 480px">
          登录账户
        </el-button>

        <!-- 分割线 -->
        <div class="login-divider">
          <span>或使用以下方式登录</span>
        </div>


        <!-- 第三方登录 -->
        <div class="social-icons">
          <el-button circle :icon="ChatLineRound" />
          <el-button circle :icon="ChromeFilled" />
          <el-button circle :icon="Platform" />
        </div>
      </div>

      <!-- 右侧宣传区（保持原样） -->
      <div class="promo-section">
        <div class="logo-text">logo</div>
        <h2 class="promo-title">开启您的数字体验之旅</h2>
        <p class="promo-desc">
          加入我们数百万用户的行列，享受安全、便捷、高效的在线服务体验。
        </p>

        <div class="features">
          <div class="feature-item">
            <el-icon class="feature-icon security-icon">
              <Lock />
            </el-icon>
            <span>安全保障</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon speed-icon">
              <Lightning />
            </el-icon>
            <span>极速体验</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon sync-icon">
              <Refresh />
            </el-icon>
            <span>实时同步</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import {
  ref,
  onMounted
} from 'vue'

import {
  // 图标
  User,
  Lock,
  Lightning,
  Refresh,
  ChatLineRound,
  ChromeFilled,
  Platform
} from '@element-plus/icons-vue'

// 表单数据
const activeTab = ref('login')
const formData = ref({
  email: '',
  password: ''
})
const rememberMe = ref(false)
const formRef = ref()

// 表单验证规则
const onFocus = (event) => {
  event.target.style.borderColor = '#3b82f6'
  event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
}

const onBlur = (event) => {
  event.target.style.borderColor = '#d1d5db'
  event.target.style.boxShadow = 'none'
}


// 方法
const onSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('提交:', formData.value)
    }
  })
}

const handleTabClick = (tab) => {
  activeTab.value = tab.name
}
</script>




<style scoped>
/* 保留你原有的布局样式 */
.biggestBox {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-width: 100;
  width: 100%;
  height: 100%;
  background-color: #F9FAFB;
  padding: 20px;
  box-sizing: border-box;
}

.box {
  width: 1152px;
  height: 691px;
  display: flex;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-section {
  position: relative;
  width: 50%;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* gap: 20px; */
}

.promo-section {
  width: 50%;
  background: linear-gradient(to bottom right, #eff6ff, #dbeafe);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.title {
  font-size: 24px;
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.subtitle {
  margin-top: 8px;
  font-size: 16px;
  color: #6b7280;
}

.tab-container {
  margin-top: 32px;
  margin-bottom: 32px;
}


/* 自定义 Element Plus 样式 */
:deep(.el-tabs__nav-wrap::after) {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
  content: '';
}

:deep(.el-tabs__item.is-active) {
  color: #f97316 !important;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #f97316 !important;
}

/* 表单 */
.form-group {
  width: 480px;
  height: 50px;
  margin: 0 auto;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin-bottom: 6px;
  color: #374151;
}

.input-wrapper {
  position: relative;
  width: 480px;
  height: 50px;
}

.input-field {
  width: 100%;
  padding: 12px 12px 12px 36px;
  /* 左边留出图标空间 */
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  color: #374151;
  transition: all 0.2s ease;
  outline: none;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #6b7280;
}

/* 在 <style scoped> 中添加 */
.form-content .el-form-item__content {
  margin-left: 0 !important;
}

:deep(.el-input__inner) {
  padding: 12px 12px 12px 36px !important;
  /* 给图标留空间 */
  font-size: 14px;
  color: #374151;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

:deep(.el-input__prefix) {
  padding-left: 12px;
}

.login-btn {
  position: absolute;
  width: 480px;
  height: 48px;
  /* 自动布局 */
  display: flex;
  padding: 12px 20px;
  margin-top: 415px;
  border-radius: 8px;
  /* 可用颜色 */
  background: #FF8E3C;
  margin-left: 9px;
  border: 0;
}


.social-icons {
  position: absolute;
  width: 480px;
  height: 44px;
  bottom: 48px;
  left: 50px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-icons .el-button {
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: #f3f4f6;
  border: none;
  color: #6b7280;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #f97316;
  margin-bottom: 20px;
}

.promo-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
}

.promo-desc {
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 30px;
  line-height: 1.5;
}

.features {
  display: flex;
  gap: 20px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 80px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
}

.security-icon {
  background-color: #dcfce7;
  color: #16a34a;
}

.speed-icon {
  background-color: #ede9fe;
  color: #7c3aed;
}

.sync-icon {
  background-color: #dbeafe;
  color: #2563eb;
}

.feature-item span {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 1200px) {
  .box {
    width: 95vw;
    height: auto;
    flex-direction: column;
  }

  .form-section,
  .promo-section {
    width: 100%;
  }
}


/* 忘记密码 */
.forgetPassword {
  position: absolute;
  width: 480px;
  height: 20px;
  /* 自动布局 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 371px;
}

.remMe {
  font-family: Roboto;
  font-size: 14px;
  line-height: 20px;
  color: #374151;
  margin-left: 24px;
}

.Password {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #3B82F6;
}


/* 左半边分割线 */
.login-divider {
  position: absolute;
  top: 513px;
  left: 50px;
  display: flex;
  align-items: center;
  width: 480px;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  margin: 24px 0;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}
</style>