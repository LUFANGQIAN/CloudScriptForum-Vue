<template>
  <div class="biggestBox">
    <div class="box">
      <!-- 左侧表单区 -->
      <div class="form-section">
        <h1 class="title">创建您的帐户</h1>

        <!-- Tab 切换 -->
        <div class="tab-container">
          <div class="tab-buttons">
            <router-link to="/login" class="tab-button" :class="{ active: $route.path === '/login' }">登录</router-link>
            <router-link to="/register" class="tab-button"
              :class="{ active: $route.path === '/register' }">注册</router-link>
          </div>
        </div>

        <!-- 表单 -->
        <el-form :model="formData" :rules="rules" ref="formDataRef" class="form-group" @submit.prevent="registerBtn">
          <!-- 用户名（姓名） -->
          <div class="form-item">
            <label>姓名</label>
            <div class="input-wrapper">
              <el-input v-model="formData.username" maxlength="20" placeholder="请输入您的姓名" class="custom-input">
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <!-- 邮箱 -->
          <div class="form-item">
            <label>邮箱账号</label>
            <div class="input-wrapper">
              <el-input v-model="formData.email" type="email" placeholder="请输入您的邮箱地址" class="custom-input">
                <template #prefix>
                  <el-icon>
                    <Message />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <!-- 验证码 -->
          <div class="form-item">
            <label>验证码</label>
            <div class="input-wrapper flex-row">
              <el-input v-model="formData.emailCheckCode" maxlength="6" placeholder="请输入验证码" class="custom-input"
                style="flex: 1">
                <template #prefix>
                  <el-icon>
                    <EditPen />
                  </el-icon>
                </template>
              </el-input>
              <el-button class="verify-btn" :disabled="!isEmailValid || waitTime > 0" @click="sendEmailBtn">
                {{ waitTime > 0 ? `请稍后 ${waitTime} 秒` : "获取验证码" }}
              </el-button>
            </div>
          </div>

          <!-- 密码 -->
          <div class="form-item">
            <label>密码</label>
            <div class="input-wrapper">
              <el-input v-model="formData.password" type="password" show-password maxlength="20" placeholder="请输入密码"
                class="custom-input">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <!-- 再次输入密码 -->
          <div class="form-item">
            <label>再次输入密码</label>
            <div class="input-wrapper">
              <el-input v-model="formData.repeatPassword" type="password" show-password maxlength="20"
                placeholder="请再次输入密码" class="custom-input">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <!-- 注册按钮 -->
          <el-button type="primary" native-type="submit" class="login-btn" @click="registerBtn">
            注册账户
          </el-button>
        </el-form>
      </div>

      <!-- 右侧宣传区 -->
      <div class="right">
        <div class="promo-section"></div>
        <div class="login_right_small"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { EditPen, Lock, Message, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { register, sendEmail } from "@/api/user";

// 邮件发送等待时间
const waitTime = ref(0);
const formDataRef = ref();
const router = useRouter();

const formData = ref({
  username: "",
  password: "",
  repeatPassword: "",
  email: "",
  emailCheckCode: "", // 注意：字段名与规则一致
});

// 验证函数（保持不变）
const validateUsername = (rule, value, callback) => {
  if (value === "") callback(new Error("请输入用户名"));
  else if (!/^[a-zA-Z0-9]+$/.test(value)) callback(new Error("用户名只能是英文和数字"));
  else if (value.length < 4 || value.length > 20) callback(new Error("用户名的长度必须在 4-20 个字符之间"));
  else callback();
};

const validatePasswordCharacters = (rule, value, callback) => {
  if (value === "") callback(new Error("请输入密码"));
  else if (!/^[a-zA-Z0-9@]+$/.test(value)) callback(new Error("密码只能包含英文、数字和@符号"));
  else if (value.length < 6 || value.length > 20) callback(new Error("密码的长度必须在 6-20 个字符之间"));
  else callback();
};

const validatePassword = (rule, value, callback) => {
  if (value === "") callback(new Error("请再次输入密码"));
  else if (value !== formData.value.password) callback(new Error("两次输入的密码不一致"));
  else callback();
};

const EmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateEmailFormat = (rule, value, callback) => {
  if (!value) callback(new Error("请输入邮箱"));
  else if (!EmailRegex.test(value)) callback(new Error("请输入合法的邮箱"));
  else callback();
};

const validateEmailCheckCode = (rule, value, callback) => {
  if (!value) callback(new Error("请输入获取的验证码"));
  else if (!/^\d{6}$/.test(value)) callback(new Error("验证码必须是6位数字"));
  else callback();
};

const isEmailValid = computed(() => {
  return formData.value.email && EmailRegex.test(formData.value.email);
});

const rules = {
  username: [{ validator: validateUsername, trigger: ["blur", "change"] }],
  password: [{ validator: validatePasswordCharacters, trigger: ["blur", "change"] }],
  repeatPassword: [{ validator: validatePassword, trigger: ["blur", "change"] }],
  email: [{ validator: validateEmailFormat, trigger: ["blur", "change"] }],
  emailCheckCode: [{ validator: validateEmailCheckCode, trigger: ["blur", "change"] }],
};

function sendEmailBtn() {
  if (isEmailValid.value) {
    const EmailDto = { email: formData.value.email, type: "register" };
    waitTime.value = 60;
    sendEmail(EmailDto).then(() => {
      ElMessage.success(`验证码已发送到邮箱：${formData.value.email}，请注意查收`);
      const interval = setInterval(() => {
        if (waitTime.value <= 0) {
          clearInterval(interval);
        } else {
          waitTime.value--;
        }
      }, 1000);
    }).catch(() => {
      waitTime.value = 0; // 发送失败重置
    });
  } else {
    ElMessage.warning("请输入正确的邮箱");
  }
}

function registerBtn() {
  formDataRef.value.validate((valid) => {
    if (valid) {
      const RegisterDto = { ...formData.value };
      // 注意：后端字段可能叫 checkCode 而不是 emailCheckCode
      // 如果 API 要求字段名为 checkCode，则需映射
      RegisterDto.checkCode = RegisterDto.emailCheckCode;
      delete RegisterDto.emailCheckCode;
      delete RegisterDto.repeatPassword;

      register(RegisterDto).then(() => {
        ElMessage.success("注册成功，欢迎进入博客");
        router.push("/login");
      }).catch(() => {
        // 错误处理可扩展
      });
    } else {
      ElMessage.warning("请完整填写注册内容");
    }
  });
}

</script>


<style scoped>
/* ========== 复用你提供的样式 ========== */
.biggestBox {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background-color: #F9FAFB;
  padding: 20px;
  box-sizing: border-box;
}

.box {
  position: relative;
  width: 1097px;
  height: 660px;
  display: flex;
  margin-left: 40px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-section {
  width: 50%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.promo-section {
  opacity: 0.3;
  background-image: url(../assets/img/login_right_big.png);
  width: 550px;
  height: 660px;
}

.title {
  font-family: Roboto;
  margin-top: 25px;
  font-size: 30px;
  font-weight: bold;
  line-height: 36px;
  color: #4B5563;
}

.tab-container {
  margin-top: -10px;
  margin-bottom: 11px;
  width: 480px;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  width: 480px;
  height: 39px;
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

.form-group {
  width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  width: 384px;

  margin-left: 63px;
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
  width: 100%;
  height: 50px;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 覆盖 Element Plus 输入框样式 ========== */
:deep(.custom-input .el-input__wrapper) {
  padding: 0 12px 0 36px !important;
  height: 48px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 8px !important;
  background-color: #f9fafb !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

:deep(.custom-input .el-input__prefix) {
  left: 12px !important;
  color: #9CA3AF !important;
}

.verify-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: #F97316;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 48px;
}

.verify-btn:hover {
  background-color: #e57300;
}

.login-btn {
  width: 384px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: #F97316;
  border: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 63px;
  color: white;
}

/* ========== 右侧宣传区 ========== */
.right {
  position: relative;
  width: 550px;
  height: 660px;
}

.promo-section {
  background-image: url(../../../assets/img/login_right_bgc.png);
  width: 100%;
  height: 100%;
  border-radius: 0 20px 20px 0;
  opacity: 0.4;
}

.login_right_small {
  position: absolute;
  background-image: url(../../../assets/img/login_middle_logo.png);
  width: 448px;
  height: 288px;
  top: 187px;
  left: 51px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .box {
    width: 95vw;
    height: auto;
    flex-direction: column;
  }

  .form-section,
  .right {
    width: 100%;
  }

  .right .promo-section {
    display: none;
  }
}
</style>