<template>

  <div class="biggestBox">
    <div class="box">


      <div class="registerForm">
        <div style="width: 100%; height: 100%;">
          <h2>重置密码</h2>

          <el-steps style="margin: 0 auto;margin-top: 60px; margin-bottom: 30px" align-center :active="step"
            finish-status="success">
            <el-step title="验证邮箱" />
            <el-step title="重置密码" />
            <el-step title="重置成功" />
          </el-steps>

          <div class="reset">

            <el-form :model="formData" :rules="rules" ref="formDataRef" v-if="step === 0">
              <el-form-item prop="email" class="form-item">
                <label class="lablestyle">邮箱</label>
                <el-input v-model="formData.email" type="email" placeholder="邮箱" class="input-field-el">
                  <template #prefix>
                    <el-icon>
                      <Message />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="checkCode">
                <label class="lablestyle">验证码</label>
                <div class="check-code-panel">
                  <el-input v-model="formData.emailCheckCode" maxlength="6" placeholder="请输入验证码" class="input-field-el">
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
              <el-button type="primary" plain :disabled="!hasRequestedCode" @click="verifyResetBtn"
                class="reset-btn" style="background-color: #FFEDD5; color: #FF9F00;">开始重置密码</el-button>
            </el-form>
          </div>

          <div>
            <el-form :model="formData" :rules="rules" ref="formDataRef" v-if="step === 1">
              <el-form-item prop="password" class="form-item">
                <label class="lablestyle">密码</label>
                <el-input v-model="formData.password" placeholder="密码" class="input-field-el">
                  <template #prefix>
                    <el-icon>
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="password_repeat" class="form-item">
                <label class="lablestyle">确认密码</label>
                <el-input v-model="formData.repeatPassword" placeholder="确认密码 " class="input-field-el">
                  <template #prefix>
                    <el-icon>
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-button type="primary" plain @click="resetPasswordBtn" class="reset-btn">重置密码</el-button>
            </el-form>
            <div style="width: 380px; margin-bottom: 232px; font-size: 22px; color: #409eff" v-if="step == 2">重置密码成功,{{
              jumpTime
            }}秒后跳转到登录页面</div>
          </div>
          <el-button class="login reset-btn" style="background-color: #3B82F6;" type="info"
            @click="router.push('/login')">返回登录</el-button>
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
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { EditPen, Lock, Message } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { sendEmail, verifyResetPassword, resetPassword } from "@/api/user";

const router = useRouter();
const formData = ref({
  email: "",
  emailCheckCode: "",
  password: "",
  repeatPassword: "",
});
const formDataRef = ref(null);

// 发送邮箱验证码倒计时
const waitTime = ref(0);

// 是否已请求过验证码
const hasRequestedCode = ref(false);

// 邮箱正则表达式
const EmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 判断邮箱是否正确
const isEmailValid = computed(() => EmailRegex.test(formData.value.email));

// 验证邮箱格式
const validateEmailFormat = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入邮箱"));
  } else if (!EmailRegex.test(value)) {
    callback(new Error("请输入合法的邮箱"));
  } else {
    callback();
  }
};

// 验证邮箱验证码
const validateEmailCheckCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入获取的验证码"));
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error("验证码必须是6位数字"));
  } else {
    callback();
  }
};

// 验证密码字符类型
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

// 验证重复密码
const validatePassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== formData.value.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = {
  password: [{ validator: validatePasswordCharacters, trigger: ["blur", "change"] }],
  repeatPassword: [{ validator: validatePassword, trigger: ["blur", "change"] }],
  email: [{ validator: validateEmailFormat, trigger: ["blur", "change"] }],
  emailCheckCode: [{ validator: validateEmailCheckCode, trigger: ["blur", "change"] }],
};

// 发送验证码
function sendEmailBtn() {
  if (isEmailValid.value) {
    const EmailDto = ref({
      email: formData.value.email,
      type: "resetPassword",
    });
    sendEmail(EmailDto.value).then(() => {
      ElMessage.success(`验证码已发送到邮箱：${formData.value.email}，请注意查收`);
      hasRequestedCode.value = true; // 标记已请求验证码
      waitTime.value = 60;
      const interval = setInterval(() => {
        if (waitTime.value === 0) {
          clearInterval(interval);
        } else {
          waitTime.value--;
        }
      }, 1000);
    });
  } else {
    ElMessage.warning("请输入正确的邮箱");
  }
}

// 步骤
const step = ref(0);

// 验证重置密码
const verifyResetBtn = () => {
  if (isEmailValid.value) {
    const VerifyResetDto = ref({
      email: formData.value.email,
      emailCheckCode: formData.value.emailCheckCode,
    });
    verifyResetPassword(VerifyResetDto.value).then(() => {
      step.value++;
    });
  }
};

// 跳转倒计时
const jumpTime = ref(3);

// 重置密码
const resetPasswordBtn = () => {
  formDataRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.error("请填写完整信息");
      return;
    } else {
      resetPassword(formData.value).then(() => {
        step.value++;
        const interval = setInterval(() => {
          jumpTime.value--;
          if (jumpTime.value === 0) {
            clearInterval(interval);
          }
        }, 1000);
        setTimeout(() => {
          step.value = 0; // 重置步骤
          router.push("/login");
        }, 3000);
      });
    }
  });
};
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
  width: 100%;

  .checkCode {
    margin-left: 10px;
    width: 110px;
    height: 50px;
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
  margin-bottom: 28px;
}

.lablestyle {
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
.reset-btn {
  width: 100%;
  height: 48px !important;
  margin-top: 12px;
  margin-bottom: 12px;
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
