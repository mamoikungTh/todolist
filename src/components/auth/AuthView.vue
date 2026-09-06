<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['login-success', 'logout'])

// โหมดปัจจุบัน: 'login' | 'register' | 'forgot'
const currentMode = ref('login')

// ฟอร์มเข้าสู่ระบบ (Login)
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})
const loginError = ref('')
const loginSuccess = ref('')

// ฟอร์มสมัครสมาชิก (Register)
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const registerError = ref('')
const registerSuccess = ref('')

// ฟอร์มลืมรหัสผ่าน (Forgot Password)
const forgotForm = reactive({
  email: '',
  newPassword: '',
  confirmNewPassword: ''
})
const forgotStep = ref(1) // 1: กรอกอีเมล, 2: กรอกรหัสใหม่
const forgotError = ref('')
const forgotSuccess = ref('')

// รหัสผ่านเปิด/ปิดตา (Show/Hide Password)
const showPassword = ref(false)

// รายชื่อผู้ใช้จำลอง (โหลดจาก localStorage ถ้ามี)
function getRegisteredUsers() {
  try {
    const saved = localStorage.getItem('registered_users')
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return [
    { name: 'นักศึกษา สมชาย', email: 'student@example.com', password: 'password123' },
    { name: 'อาจารย์ผู้สอน', email: 'teacher@example.com', password: 'password123' }
  ]
}

function saveRegisteredUsers(users) {
  localStorage.setItem('registered_users', JSON.stringify(users))
}

// 1. จัดการ Login
function handleLogin() {
  loginError.value = ''
  loginSuccess.value = ''

  if (!loginForm.email || !loginForm.password) {
    loginError.value = 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน'
    return
  }

  const users = getRegisteredUsers()
  const user = users.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase())

  if (!user || user.password !== loginForm.password) {
    loginError.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
    return
  }

  loginSuccess.value = `ยินดีต้อนรับคุณ ${user.name} เข้าสู่ระบบสำเร็จ!`
  setTimeout(() => {
    emit('login-success', { name: user.name, email: user.email })
    loginSuccess.value = ''
  }, 600)
}

// กรอกข้อมูลทดสอบด่วน (Demo)
function fillDemoAccount() {
  loginForm.email = 'student@example.com'
  loginForm.password = 'password123'
  loginError.value = ''
}

// 2. จัดการ Register
function handleRegister() {
  registerError.value = ''
  registerSuccess.value = ''

  if (!registerForm.name.trim()) {
    registerError.value = 'กรุณากรอกชื่อ-นามสกุล'
    return
  }
  if (!registerForm.email.trim() || !registerForm.email.includes('@')) {
    registerError.value = 'กรุณากรอกอีเมลให้ถูกต้อง'
    return
  }
  if (registerForm.password.length < 6) {
    registerError.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'
    return
  }

  const users = getRegisteredUsers()
  if (users.some(u => u.email.toLowerCase() === registerForm.email.toLowerCase())) {
    registerError.value = 'อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมลอื่น'
    return
  }

  const newUser = {
    name: registerForm.name.trim(),
    email: registerForm.email.trim(),
    password: registerForm.password
  }

  users.push(newUser)
  saveRegisteredUsers(users)

  registerSuccess.value = 'สมัครสมาชิกสำเร็จเรียบร้อยแล้ว! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...'
  setTimeout(() => {
    loginForm.email = newUser.email
    loginForm.password = newUser.password
    currentMode.value = 'login'
    registerSuccess.value = ''
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
  }, 1200)
}

// 3. จัดการ Forgot Password
function handleForgotRequest() {
  forgotError.value = ''
  forgotSuccess.value = ''

  if (!forgotForm.email.trim() || !forgotForm.email.includes('@')) {
    forgotError.value = 'กรุณากรอกอีเมลให้ถูกต้อง'
    return
  }

  const users = getRegisteredUsers()
  const user = users.find(u => u.email.toLowerCase() === forgotForm.email.toLowerCase())

  if (!user) {
    forgotError.value = 'ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบความถูกต้อง'
    return
  }

  forgotStep.value = 2
  forgotSuccess.value = `ยืนยันอีเมล ${user.email} ถูกต้อง กรุณาตั้งรหัสผ่านใหม่ด้านล่าง`
}

function handleResetPassword() {
  forgotError.value = ''

  if (forgotForm.newPassword.length < 6) {
    forgotError.value = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    return
  }
  if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
    forgotError.value = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน'
    return
  }

  const users = getRegisteredUsers()
  const user = users.find(u => u.email.toLowerCase() === forgotForm.email.toLowerCase())
  if (user) {
    user.password = forgotForm.newPassword
    saveRegisteredUsers(users)
  }

  forgotSuccess.value = 'รีเซ็ตรหัสผ่านสำเร็จเรียบร้อย! สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้เลย'
  setTimeout(() => {
    loginForm.email = forgotForm.email
    loginForm.password = forgotForm.newPassword
    currentMode.value = 'login'
    forgotStep.value = 1
    forgotForm.email = ''
    forgotForm.newPassword = ''
    forgotForm.confirmNewPassword = ''
    forgotSuccess.value = ''
  }, 1400)
}

function switchMode(mode) {
  currentMode.value = mode
  loginError.value = ''
  registerError.value = ''
  forgotError.value = ''
  forgotStep.value = 1
}
</script>

<template>
  <div class="auth-card">
    <div class="student-badge">Student 2 Assignment</div>

    <!-- กรณีผู้ใช้เข้าสู่ระบบแล้ว (Logged In Profile) -->
    <div v-if="currentUser" class="profile-box">
      <div class="avatar-circle">👤</div>
      <h3 class="user-name">{{ currentUser.name }}</h3>
      <p class="user-email">{{ currentUser.email }}</p>
      <div class="login-status-badge">🟢 เข้าสู่ระบบแล้ว</div>

      <button class="btn btn-logout" @click="emit('logout')">
        🚪 ออกจากระบบ (Logout)
      </button>
    </div>

    <!-- กรณียังไม่เข้าสู่ระบบ (Tabs & Forms) -->
    <div v-else>
      <!-- Navigation Tabs -->
      <div class="auth-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentMode === 'login' }"
          @click="switchMode('login')"
        >
          🔐 เข้าสู่ระบบ (Login)
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentMode === 'register' }"
          @click="switchMode('register')"
        >
          📝 สมัครสมาชิก (Register)
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentMode === 'forgot' }"
          @click="switchMode('forgot')"
        >
          🔑 ลืมรหัสผ่าน (Forgot)
        </button>
      </div>

      <!-- 1. หน้า LOGIN -->
      <div v-if="currentMode === 'login'" class="form-container">
        <h2 class="form-title">เข้าสู่ระบบ (Login)</h2>
        <p class="form-desc">กรอกข้อมูลบัญชีเพื่อเข้าใช้งานระบบ</p>

        <div v-if="loginError" class="alert alert-danger">{{ loginError }}</div>
        <div v-if="loginSuccess" class="alert alert-success">{{ loginSuccess }}</div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>อีเมล (Email)</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="เช่น student@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label>รหัสผ่าน (Password)</label>
            <div class="password-input-wrapper">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่านของคุณ"
                required
              />
              <button
                type="button"
                class="btn-toggle-pw"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>
            <a href="#" class="link-forgot" @click.prevent="switchMode('forgot')">
              ลืมรหัสผ่าน?
            </a>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            เข้าสู่ระบบ (Login)
          </button>

          <button
            type="button"
            class="btn btn-demo btn-block"
            @click="fillDemoAccount"
          >
            ⚡ บัญชีทดสอบ (Demo: student@example.com)
          </button>
        </form>

        <p class="switch-prompt">
          ยังไม่มีบัญชีใช่หรือไม่?
          <a href="#" @click.prevent="switchMode('register')">สมัครสมาชิกที่นี่</a>
        </p>
      </div>

      <!-- 2. หน้า REGISTER -->
      <div v-else-if="currentMode === 'register'" class="form-container">
        <h2 class="form-title">สมัครสมาชิก (Register)</h2>
        <p class="form-desc">สร้างบัญชีผู้ใช้งานใหม่เพื่อเข้าสู่ระบบ</p>

        <div v-if="registerError" class="alert alert-danger">{{ registerError }}</div>
        <div v-if="registerSuccess" class="alert alert-success">{{ registerSuccess }}</div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label>ชื่อ-นามสกุล (Full Name)</label>
            <input
              v-model="registerForm.name"
              type="text"
              placeholder="เช่น นายสมชาย ใจดี"
              required
            />
          </div>

          <div class="form-group">
            <label>อีเมล (Email)</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="เช่น somchai@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label>รหัสผ่าน (Password, ขั้นต่ำ 6 ตัวอักษร)</label>
            <input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="กำหนดรหัสผ่าน"
              required
            />
          </div>

          <div class="form-group">
            <label>ยืนยันรหัสผ่าน (Confirm Password)</label>
            <input
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            ยืนยันสมัครสมาชิก (Register)
          </button>
        </form>

        <p class="switch-prompt">
          มีบัญชีอยู่แล้ว?
          <a href="#" @click.prevent="switchMode('login')">เข้าสู่ระบบที่นี่</a>
        </p>
      </div>

      <!-- 3. หน้า FORGOT PASSWORD -->
      <div v-else-if="currentMode === 'forgot'" class="form-container">
        <h2 class="form-title">ลืมรหัสผ่าน (Forgot Password)</h2>
        <p class="form-desc">ระบุอีเมลที่ลงทะเบียนไว้เพื่อตั้งรหัสผ่านใหม่</p>

        <div v-if="forgotError" class="alert alert-danger">{{ forgotError }}</div>
        <div v-if="forgotSuccess" class="alert alert-success">{{ forgotSuccess }}</div>

        <!-- ขั้นที่ 1: ตรวจสอบอีเมล -->
        <form v-if="forgotStep === 1" @submit.prevent="handleForgotRequest" class="auth-form">
          <div class="form-group">
            <label>อีเมลที่ลงทะเบียน (Registered Email)</label>
            <input
              v-model="forgotForm.email"
              type="email"
              placeholder="เช่น student@example.com"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            ตรวจสอบอีเมลเพื่อรีเซ็ต
          </button>
        </form>

        <!-- ขั้นที่ 2: ตั้งรหัสผ่านใหม่ -->
        <form v-else-if="forgotStep === 2" @submit.prevent="handleResetPassword" class="auth-form">
          <div class="form-group">
            <label>รหัสผ่านใหม่ (New Password)</label>
            <input
              v-model="forgotForm.newPassword"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่"
              required
            />
          </div>

          <div class="form-group">
            <label>ยืนยันรหัสผ่านใหม่ (Confirm New Password)</label>
            <input
              v-model="forgotForm.confirmNewPassword"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            💾 บันทึกรหัสผ่านใหม่
          </button>
        </form>

        <p class="switch-prompt">
          <a href="#" @click.prevent="switchMode('login')">← กลับไปยังหน้าเข้าสู่ระบบ</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  color: #ffffff;
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