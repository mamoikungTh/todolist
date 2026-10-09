<script setup>
import { ref, reactive } from 'vue'
import { loginAccount, registerAccount, verifyRecovery, resetPassword, saveSession, DEMO_RECOVERY_CODE } from '../../services/demoAuth'

defineProps({ currentUser: { type: Object, default: null } })
const emit = defineEmits(['login-success', 'logout'])
const currentMode = ref('login')
const busy = ref(false)
const showPassword = ref(false)
const error = ref('')
const success = ref('')
const recoveryCode = ref('')
const pendingLogin = ref(null)
const loginForm = reactive({ email: '', password: '', rememberMe: false })
const registerForm = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const forgotForm = reactive({ email: '', code: '', newPassword: '', confirmNewPassword: '' })
const forgotStep = ref(1)

async function run(action) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  success.value = ''
  try { await action() } catch (err) { error.value = err.message }
  finally { busy.value = false }
}
function switchMode(mode) {
  if (busy.value) return
  currentMode.value = mode
  error.value = ''; success.value = ''; recoveryCode.value = ''; pendingLogin.value = null
  forgotStep.value = 1; forgotForm.code = ''; forgotForm.newPassword = ''; forgotForm.confirmNewPassword = ''
  loginForm.password = ''; registerForm.password = ''; registerForm.confirmPassword = ''
  showPassword.value = false
}
function finishLogin(user) {
  saveSession(user, loginForm.rememberMe)
  loginForm.password = ''
  emit('login-success', user)
}
async function handleLogin() {
  await run(async () => {
    const result = await loginAccount(loginForm.email, loginForm.password)
    if (result.recoveryCode) {
      recoveryCode.value = result.recoveryCode
      pendingLogin.value = result.user
      success.value = 'ปรับปรุงบัญชีเดิมแล้ว กรุณาเก็บรหัสกู้คืนก่อนเข้าใช้งาน'
    } else finishLogin(result.user)
  })
}
async function continueLogin() { await run(() => finishLogin(pendingLogin.value)) }
async function handleRegister() {
  await run(async () => {
    const result = await registerAccount(registerForm)
    recoveryCode.value = result.recoveryCode
    success.value = 'สมัครสมาชิกสำเร็จ กรุณาจดรหัสกู้คืน แล้วกดไปหน้าเข้าสู่ระบบ'
    loginForm.email = result.user.email
    registerForm.password = ''; registerForm.confirmPassword = ''
  })
}
async function handleForgotRequest() {
  await run(async () => { await verifyRecovery(forgotForm.email, forgotForm.code); forgotStep.value = 2 })
}
async function handleResetPassword() {
  await run(async () => {
    const result = await resetPassword(forgotForm.email, forgotForm.code, forgotForm.newPassword, forgotForm.confirmNewPassword)
    recoveryCode.value = result.recoveryCode
    success.value = 'ตั้งรหัสผ่านใหม่สำเร็จ รหัสกู้คืนเดิมใช้ไม่ได้แล้ว กรุณาจดรหัสใหม่'
    loginForm.email = forgotForm.email
    forgotForm.code = ''; forgotForm.newPassword = ''; forgotForm.confirmNewPassword = ''
  })
}
function fillDemoAccount() { loginForm.email = 'student@example.com'; loginForm.password = 'password123'; error.value = '' }
</script>

<template>
  <div class="auth-card">
    <div class="student-badge">Student 2 Assignment</div>
    <p class="demo-note">ระบบสมาชิกจำลองสำหรับ Lab บัญชีและงานอยู่ในเบราว์เซอร์เครื่องนี้ ไม่มีการส่งอีเมลกู้รหัสผ่าน</p>
    <div v-if="currentUser" class="profile-box">
      <div class="avatar-circle">👤</div>
      <h3 class="user-name">{{ currentUser.name }}</h3>
      <p class="user-email">{{ currentUser.email }}</p>
      <button class="btn btn-logout" @click="emit('logout')">ออกจากระบบ (Logout)</button>
    </div>
    <div v-else>
      <div class="auth-tabs" aria-label="เมนูบัญชี">
        <button v-for="item in [{key:'login',label:'เข้าสู่ระบบ'}, {key:'register',label:'สมัครสมาชิก'}, {key:'forgot',label:'ลืมรหัสผ่าน'}]"
          :key="item.key" class="tab-btn" :class="{active: currentMode === item.key}" :disabled="busy"
          @click="switchMode(item.key)">{{ item.label }}</button>
      </div>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <div v-if="success" class="alert alert-success" role="status">{{ success }}</div>
      <div v-if="recoveryCode" class="recovery-box">
        <strong>รหัสกู้คืนบัญชี — เก็บไว้ใช้เมื่อลืมรหัสผ่าน</strong>
        <code data-testid="recovery-code">{{ recoveryCode }}</code>
        <p>ใช้รหัสนี้คู่กับอีเมลในการตั้งรหัสผ่านใหม่</p>
        <button v-if="pendingLogin" class="btn btn-primary btn-block" :disabled="busy" @click="continueLogin">เก็บรหัสแล้ว เข้าใช้งาน</button>
        <button v-else class="btn btn-primary btn-block" @click="switchMode('login')">เก็บรหัสแล้ว ไปหน้าเข้าสู่ระบบ</button>
      </div>
      <div v-else-if="currentMode === 'login'" class="form-container">
        <h2 class="form-title">เข้าสู่ระบบ (Login)</h2>
        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group"><label for="login-email">อีเมล</label><input id="login-email" v-model="loginForm.email" type="email" autocomplete="username" required /></div>
          <div class="form-group"><label for="login-password">รหัสผ่าน</label>
            <div class="password-input-wrapper"><input id="login-password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
              <button class="btn-toggle-pw" type="button" :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'" @click="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</button></div>
          </div>
          <label class="remember-me"><input v-model="loginForm.rememberMe" type="checkbox" /><span>จดจำการเข้าสู่ระบบ</span></label>
          <button class="btn btn-primary btn-block" :disabled="busy" type="submit">{{ busy ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ (Login)' }}</button>
          <button class="btn btn-demo btn-block" :disabled="busy" type="button" @click="fillDemoAccount">ใช้บัญชีทดสอบ student@example.com</button>
        </form>
        <p class="demo-note">บัญชีทดสอบ: password123 · รหัสกู้คืนเริ่มต้น: {{ DEMO_RECOVERY_CODE }}</p>
      </div>
      <div v-else-if="currentMode === 'register'" class="form-container">
        <h2 class="form-title">สมัครสมาชิก (Register)</h2>
        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group"><label for="register-name">ชื่อ-นามสกุล</label><input id="register-name" v-model="registerForm.name" autocomplete="name" required /></div>
          <div class="form-group"><label for="register-email">อีเมล</label><input id="register-email" v-model="registerForm.email" type="email" autocomplete="email" required /></div>
          <div class="form-group"><label for="register-password">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label><input id="register-password" v-model="registerForm.password" type="password" autocomplete="new-password" minlength="6" required /></div>
          <div class="form-group"><label for="register-confirm">ยืนยันรหัสผ่าน</label><input id="register-confirm" v-model="registerForm.confirmPassword" type="password" autocomplete="new-password" required /></div>
          <button class="btn btn-primary btn-block" :disabled="busy" type="submit">{{ busy ? 'กำลังบันทึก...' : 'ยืนยันสมัครสมาชิก (Register)' }}</button>
        </form>
      </div>
      <div v-else class="form-container">
        <h2 class="form-title">ลืมรหัสผ่าน (Forgot Password)</h2>
        <form v-if="forgotStep === 1" class="auth-form" @submit.prevent="handleForgotRequest">
          <div class="form-group"><label for="forgot-email">อีเมลที่ลงทะเบียน</label><input id="forgot-email" v-model="forgotForm.email" type="email" required /></div>
          <div class="form-group"><label for="forgot-code">รหัสกู้คืนที่ได้รับตอนสมัครสมาชิก</label><input id="forgot-code" v-model="forgotForm.code" autocomplete="off" required /></div>
          <button class="btn btn-primary btn-block" :disabled="busy" type="submit">ตรวจสอบรหัสกู้คืน</button>
        </form>
        <form v-else class="auth-form" @submit.prevent="handleResetPassword">
          <div class="form-group"><label for="reset-password">รหัสผ่านใหม่</label><input id="reset-password" v-model="forgotForm.newPassword" type="password" autocomplete="new-password" minlength="6" required /></div>
          <div class="form-group"><label for="reset-confirm">ยืนยันรหัสผ่านใหม่</label><input id="reset-confirm" v-model="forgotForm.confirmNewPassword" type="password" autocomplete="new-password" required /></div>
          <button class="btn btn-primary btn-block" :disabled="busy" type="submit">บันทึกรหัสผ่านใหม่</button>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.demo-note { color: #64748b; background: #f8fafc; padding: 12px; margin-bottom: 16px; border-radius: 8px; font-size: 12px; line-height: 1.7; overflow-wrap: anywhere; }
.recovery-box { padding: 16px; border: 1px solid #bfdbfe; border-radius: 12px; background: #eff6ff; line-height: 1.8; }
.recovery-box code { display: block; margin: 12px 0; font-size: 16px; user-select: all; overflow-wrap: anywhere; }
button:disabled { opacity: .6; cursor: wait; }

.auth-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.student-badge {
  display: inline-block;
  background-color: #fef3c7;
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

/* Profile Box */
.profile-box {
  text-align: center;
  padding: 20px 10px;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  background-color: #e0e7ff;
  border-radius: 50%;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.user-name {
  margin: 0 0 4px 0;
  color: #1e293b;
  font-size: 18px;
}

.user-email {
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 14px;
}

.login-status-badge {
  display: inline-block;
  background-color: #dcfce7;
  color: #166534;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 9999px;
  margin-bottom: 20px;
}

/* Tabs */
.auth-tabs {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 8px 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #1e293b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.form-desc {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 16px 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.form-group input {
  padding: 10px 14px;
  font-size: 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: var(--primary-color, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  width: 100%;
  box-sizing: border-box;
}

.btn-toggle-pw {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  cursor: pointer;
}

.link-forgot {
  color: var(--primary-color, #2563eb);
  text-decoration: none;
  font-weight: 500;
}

.link-forgot:hover {
  text-decoration: underline;
}

.btn {
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background-color: var(--primary-color, #2563eb);
  color: var(--primary-contrast, #ffffff);
}

.btn-primary:hover {
  filter: brightness(0.92);
}

.btn-demo {
  background-color: #f8fafc;
  color: #475569;
  border: 1px dashed #cbd5e1;
}

.btn-demo:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.btn-logout {
  background-color: #fee2e2;
  color: #dc2626;
  width: 100%;
}

.btn-logout:hover {
  background-color: #fecaca;
}

.alert {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: left;
}

.alert-danger {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.alert-success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.switch-prompt {
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

.switch-prompt a {
  color: var(--primary-color, #2563eb);
  text-decoration: none;
  font-weight: 600;
}

.switch-prompt a:hover {
  text-decoration: underline;
}
</style>