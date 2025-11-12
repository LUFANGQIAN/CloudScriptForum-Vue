<template>
  <div class="biggestBox">
    <div class="box">
      <!-- 表单区（左边） -->
      <div class="form-section">
        <h1 class="title">欢迎回来</h1>
        <p class="subtitle">请登录您的账户以继续使用服务</p>

        <!-- Tab 切换（使用 router-link） -->
        <div class="tab-container">
          <div class="tab-buttons">
            <router-link to="/login" class="tab-button" :class="{ active: $route.path === '/login' }">登录</router-link>
            <router-link to="/register" class="tab-button"
              :class="{ active: $route.path === '/register' }">注册</router-link>
          </div>
        </div>

        <!-- 登录表单（使用 el-form 保持验证逻辑） -->
        <el-form :model="formData" :rules="rules" ref="formDataRef" class="form-group">
          <!-- 用户名 -->
          <el-form-item prop="username" class="form-item">
            <label>用户名</label>
            <el-input clearable placeholder="请输入您的用户名" maxlength="50" v-model="formData.username"
              class="input-field-el">
              <template #prefix>
                <el-icon>
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password" class="form-item">
            <label>密码</label>
            <el-input clearable placeholder="请输入您的密码" maxlength="20" v-model="formData.password" show-password
              class="input-field-el">
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item prop="checkCode" class="form-item">
            <label>验证码</label>
            <div class="check-code-panel">
              <el-input placeholder="请输入验证码" maxlength="6" v-model="formData.checkCode"
                class="input-field-el VerificationCode">
                <template #prefix>
                  <el-icon>
                    <EditPen />
                  </el-icon>
                </template>
              </el-input>
              <img class="check-code" :src="checkCodeInfo.checkCodeBase64" alt="验证码" @click="changeCheckCode()" />
            </div>
          </el-form-item>

          <!-- 记住密码 & 忘记密码 -->
          <div class="forgetPassword">
            <el-checkbox v-model="formData.rememberMe" class="remMe">记住我</el-checkbox>
            <el-button class="Password" type="primary" link @click="router.push('/reset')">
              忘记密码?
            </el-button>
          </div>

          <!-- 登录按钮 -->
          <el-button type="primary" class="login-btn" @click="throttledLoginBtn">
            登录账户
          </el-button>



        </el-form>
      </div>


      <!-- 右边宣传图 -->
      <div class="login_right">
        <div class="login_right_bgc"></div>
        <div class="login_right_middle">
          <div class="logo"></div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { giteeLogin, githubLogin, qqLogin } from "@/api/oauth";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { login, checkCode, info } from "@/api/user";
import { SetJwt } from "@/utils/Auth";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore.js";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute(); // 用于 tab active 判断

const formDataRef = ref(null);
const formData = ref({
  username: "",
  password: "",
  rememberMe: false,
  checkCodeKey: "",
  checkCode: "",
});

// 验证规则（保持不变）
const validateUsername = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入用户名"));
  } else if (!/^[a-zA-Z0-9@._-]+$/.test(value)) {
    callback(new Error("请输入有效的邮箱地址"));
  } else {
    callback();
  }
};

const validatePasswordCharacters = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else if (!/^[a-zA-Z0-9@]+$/.test(value)) {
    callback(new Error("密码只能包含英文、数字和@符号"));
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error("密码的长度必须在 6-20 个字符之间"));
  } else {
    callback();
  }
};

const validateCheckCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入验证码"));
  } else {
    callback();
  }
};

const rules = ref({
  username: [{ validator: validateUsername, trigger: ["blur", "change"] }],
  password: [{ validator: validatePasswordCharacters, trigger: ["blur", "change"] }],
  checkCode: [{ validator: validateCheckCode, trigger: ["blur", "change"] }],
});

const loginBtn = () => {
  formDataRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.error("请填写完整信息");
      return;
    } else {
      login(formData.value)
        .then((res) => {
          ElMessage.success("登录成功");
          SetJwt(res.data.data);
          info().then((res) => {
            userStore.user = res.data.data;
          });
          router.push({ name: "Home" });
        })
        .catch(() => {
          changeCheckCode();
        });
    }
  });
};

const checkCodeInfo = ref({});
const changeCheckCode = async () => {
  await checkCode().then((res) => {
    checkCodeInfo.value = res.data.data;
    formData.value.checkCodeKey = res.data.data.checkCodeKey;
  });
};

onMounted(() => {
  changeCheckCode();
});


// 登录节流
// 替换原来的 throttle 函数（放在合适位置，比如 loginBtn 上方或下方）
function throttle(fn, delay) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

// 创建节流后的登录函数
const throttledLoginBtn = throttle(loginBtn, 2000); // 2000ms 内只允许点一次

</script>

<style scoped>
/* ========== 全局布局 ========== */
.biggestBox {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background-color: #f9fafb;
  /* 保留原背景色 */
  padding: 20px;
  box-sizing: border-box;
}

.box {
  width: 100%;
  max-width: 1100px;
  display: flex;
  height: 660px;
  /* 约等于 480px + padding */
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.form-section {
  width: 100%;
  max-width: 550px;
  padding: 33px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-family: Roboto, sans-serif;
  margin-left: -360px;
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin-top: -2px;
  margin-bottom: -4px;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin-left: -258px;
  margin-bottom: 32px;
}

/* ========== Tab ========== */
.tab-container {
  width: 100%;
  margin-bottom: 25px;
  margin-top: -15px;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
}

.tab-button {
  padding: 8px 16px;
  font-size: 16px;
  color: #6b7280;
  text-decoration: none;
  cursor: pointer;
  position: relative;
}

.tab-button.active {
  color: #f97316;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #f97316;
}

/* ========== 表单 ========== */
.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.form-item {
  width: 100%;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
}

/* 覆盖 el-input 样式以匹配新设计 */
:deep(.input-field-el .el-input__wrapper) {
  width: 480px;
  height: 50px;
  padding: 12px 12px 12px 14px !important;
  background-color: #f9fafb !important;
  border: 1px solid #d1d5db !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

:deep(.input-field-el .el-input__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

:deep(.input-field-el .el-input__prefix) {
  left: 12px !important;
  color: #9ca3af;
}

/* 验证码 */
.VerificationCode {
  width: 370px;
}

/* 验证码面板 */
.check-code-panel {
  display: flex;
  width: 100%;
}

.check-code {
  width: 100px;
  height: 50px;
  margin-left: 10px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}

/* ========== 记住密码 ========== */
.forgetPassword {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.remMe :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #374151;
}

.Password {
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  padding: 0;
  height: auto;
}

/* ========== 按钮 ========== */
.login-btn {
  width: 100%;
  height: 48px;
  margin-top: 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: #ff8e3c;
  border: 0;
  color: white;
}


/* 右侧宣传图 */
.login_right {
  position: relative;
  width: 550px;
  height: 660px;
}

.login_right_bgc {
  background-image: url(../../../assets/img/login_right_bgc.png);
  width: 100%;
  height: 100%;
  border-radius: 0 20px 20px 0;
  opacity: 0.4;
}

.login_right_middle {
  position: absolute;
  background-image: url(../../../assets/img/login_middle_logo.png);
  width: 448px;
  height: 288px;
  top: 187px;
  left: 51px;
}
</style>