<template>
  <div>
    <div class="biggestBox">
      <div class="box">

        <div class="registerForm">
          <el-form :model="formData" :rules="rules" ref="formDataRef" class="form-group">
            <h2>创建您的账户</h2>

            <!-- Tab 切换（使用 router-link） -->
            <div class="tab-container">
              <div class="tab-buttons">
                <router-link to="/login" class="tab-button"
                  :class="{ active: $route.path === '/login' }">登录</router-link>
                <router-link to="/register" class="tab-button"
                  :class="{ active: $route.path === '/register' }">注册</router-link>
              </div>
            </div>

            <el-form-item prop="username" class="form-item">
              <label>用户名</label>
              <el-input v-model="formData.username" maxlength="20" type="text" placeholder="用户名" class="input-field-el">
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>


            <el-form-item prop="email" class="form-item">
              <label>邮箱</label>
              <el-input v-model="formData.email" type="email" placeholder="邮箱" class="input-field-el">
                <template #prefix>
                  <el-icon>
                    <Message />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="checkCode" class="form-item">
              <label>验证码</label>
              <div class="check-code-panel">
                <el-input v-model="formData.emailCheckCode" maxlength="6" placeholder="请输入验证码" class="input-field-el"
                  width="250px">
                  <template #prefix>
                    <el-icon>
                      <EditPen />
                    </el-icon>
                  </template>
                </el-input>

                <el-button class="checkCode" type="success" :disabled="!isEmailValid || waitTime > 0"
                  @click="sendEmailBtn">
                  {{ waitTime > 0 ? `请稍后 ${waitTime} 秒` : "获取验证码" }}
                </el-button>
              </div>
            </el-form-item>


            <el-form-item prop="password" class="form-item">
              <label>密码</label>
              <el-input v-model="formData.password" maxlength="20" type="password" placeholder="密码" show-password
                class="input-field-el">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="repeatPassword" class="form-item">
              <label>重复密码</label>
              <el-input v-model="formData.repeatPassword" maxlength="20" type="password" placeholder="重复密码"
                show-password class="input-field-el">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>



          </el-form>

          <el-button type="danger" style="" plain @click="registerBtn" class="register-btn">立即注册</el-button>

          <div style="margin-top: 20px; display: flex; align-items: center; justify-content: center">
            <span style="color: grey">已有账号?</span>
            <el-button style="" type="primary" link @click="router.push('/login')">立即登录</el-button>
          </div>

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

// 注册按钮节流控制
const isRegistering = ref(false);
const registerThrottleTime = 5000; // 5秒内只能点击一次

// 提交表单
const formData = ref({
  username: "",
  password: "",
  repeatPassword: "",
  email: "",
  emailCheckCode: "", // 注意：字段名与规则一致
});

// 节流函数
function throttle(func, delay) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}

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

// 注册按钮（添加节流）
function registerBtn() {
  // 如果正在注册中，直接返回
  if (isRegistering.value) {
    ElMessage.warning("请勿重复提交");
    return;
  }

  formDataRef.value.validate((valid) => {
    if (valid) {
      // 设置注册状态为true，防止重复点击
      isRegistering.value = true;

      // 去掉password_repeat字段
      const RegisterDto = { ...formData.value };
      delete RegisterDto.repeatPassword;

      register(RegisterDto)
        .then(() => {
          ElMessage.success("注册成功，欢迎进入博客");
          router.push("/login");
        })
        .finally(() => {
          // 无论成功失败，3秒后重置注册状态
          setTimeout(() => {
            isRegistering.value = false;
          }, registerThrottleTime);
        });
    } else {
      ElMessage.warning("请完整填写注册内容");
    }
  });
}


</script>

<style lang="scss" scoped>
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
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

h2 {
  font-family: Roboto;
  font-size: 30px;
  font-weight: bold;
  line-height: 12px;
  text-align: center;
  letter-spacing: normal;
  color: #4B5563;
}

.registerForm {
  width: 100%;
  max-width: 550px;
  padding: 33px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.check-code-panel {
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

  .checkCode {
    margin-left: 10px;
    width: 110px;
    height: 40px;
    border-radius: 12px;
  }
}

/* ========== Tab ========== */
.tab-container {
  width: 100%;
  margin-bottom: 25px;
  margin-top: -20px;
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
  margin-top: -10px;
}

.form-item {
  width: 100%;
  margin-top: 8px;
  margin-bottom: 12px;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
  line-height: 12px;
}

/* 覆盖 el-input 样式以匹配新设计 */
:deep(.input-field-el .el-input__wrapper) {
  width: 250px;
  height: 40px;
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
  height: 40px;
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
.register-btn {
  width: 100%;
  height: 48px !important;
  margin-top: 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: #ff8e3c;
  border: 0;
  color: white;
  line-height: 48px;
}


.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
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