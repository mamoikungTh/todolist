// ระบบสมาชิกสำหรับ Lab เท่านั้น: ไม่มี server และไม่มีบริการส่งอีเมล
const USERS_KEY = 'registered_users'
const SESSION_KEY = 'current_auth_user'
const ITERATIONS = 600000
export const DEMO_RECOVERY_CODE = 'STUDENT-DEMO-RECOVERY'
const normalizeEmail = value => String(value ?? '').trim().toLowerCase()
const normalizeCode = value => String(value ?? '').trim().toLowerCase()
const publicUser = user => ({ name: user.name, email: user.email })
const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
const fromHex = value => Uint8Array.from(value.match(/.{2}/g), pair => parseInt(pair, 16))

function validatePassword(password, confirmation) {
  if (typeof password !== 'string' || password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  if (password !== confirmation) throw new Error('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
}

async function derive(secret, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('กรุณาเปิดเว็บผ่าน localhost หรือ HTTPS เพื่อใช้ระบบสมาชิก')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(salt), iterations: ITERATIONS, hash: 'SHA-256' }, key, 256)
  return hex(new Uint8Array(bits))
}
async function makeCredential(secret) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
  return { salt, hash: await derive(secret, salt) }
}
async function verifyCredential(secret, credential) {
  if (!credential || !/^[a-f0-9]{32}$/.test(credential.salt) || !/^[a-f0-9]{64}$/.test(credential.hash)) return false
  return (await derive(secret, credential.salt)) === credential.hash
}
function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }
  catch { throw new Error('บันทึกบัญชีไม่ได้ กรุณาอนุญาตการจัดเก็บข้อมูลในเบราว์เซอร์แล้วลองอีกครั้ง') }
}
async function loadUsers() {
  let raw
  try { raw = localStorage.getItem(USERS_KEY) }
  catch { throw new Error('อ่านบัญชีไม่ได้ กรุณาตรวจสอบการจัดเก็บข้อมูลของเบราว์เซอร์') }
  if (raw !== null) {
    let users
    try { users = JSON.parse(raw) } catch { throw new Error('ข้อมูลบัญชีที่บันทึกไว้เสียหาย กรุณาสำรองข้อมูลก่อนแก้ไข') }
    if (!Array.isArray(users) || users.some(user => !user || typeof user.name !== 'string' || typeof user.email !== 'string')) {
      throw new Error('รูปแบบข้อมูลบัญชีไม่ถูกต้อง กรุณาสำรองข้อมูลก่อนแก้ไข')
    }
    return users
  }
  const users = []
  for (const [name, email] of [['นักศึกษา สมชาย', 'student@example.com'], ['อาจารย์ผู้สอน', 'teacher@example.com']]) {
    users.push({ name, email, passwordCredential: await makeCredential('password123'), recoveryCredential: await makeCredential(normalizeCode(DEMO_RECOVERY_CODE)) })
  }
  saveUsers(users)
  return users
}

export async function registerAccount({ name, email, password, confirmPassword }) {
  const cleanName = String(name ?? '').trim()
  const cleanEmail = normalizeEmail(email)
  if (!cleanName) throw new Error('กรุณากรอกชื่อ-นามสกุล')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('กรุณากรอกอีเมลให้ถูกต้อง')
  validatePassword(password, confirmPassword)
  const users = await loadUsers()
  if (users.some(user => normalizeEmail(user.email) === cleanEmail)) throw new Error('อีเมลนี้ถูกใช้งานไปแล้ว')
  const recoveryCode = crypto.randomUUID()
  const user = { name: cleanName, email: cleanEmail, passwordCredential: await makeCredential(password), recoveryCredential: await makeCredential(normalizeCode(recoveryCode)) }
  users.push(user)
  saveUsers(users)
  return { user: publicUser(user), recoveryCode }
}

export async function loginAccount(email, password) {
  if (!normalizeEmail(email) || !password) throw new Error('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน')
  const users = await loadUsers()
  const user = users.find(item => normalizeEmail(item.email) === normalizeEmail(email))
  const valid = user && (user.passwordCredential
    ? await verifyCredential(password, user.passwordCredential)
    : typeof user.password === 'string' && user.password === password)
  if (!valid) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  let recoveryCode = null
  let changed = false
  // ย้ายบัญชีเดิมจากรหัสผ่านข้อความเป็น hash หลังตรวจรหัสผ่านสำเร็จ
  if (!user.passwordCredential) {
    user.passwordCredential = await makeCredential(password)
    delete user.password
    changed = true
  }
  if (!user.recoveryCredential) {
    recoveryCode = crypto.randomUUID()
    user.recoveryCredential = await makeCredential(normalizeCode(recoveryCode))
    changed = true
  }
  user.email = normalizeEmail(user.email)
  if (changed) saveUsers(users)
  return { user: publicUser(user), recoveryCode }
}

export async function verifyRecovery(email, code) {
  const users = await loadUsers()
  const user = users.find(item => normalizeEmail(item.email) === normalizeEmail(email))
  if (!user || !await verifyCredential(normalizeCode(code), user.recoveryCredential)) {
    throw new Error('อีเมลหรือรหัสกู้คืนไม่ถูกต้อง บัญชีเก่าต้องเข้าสู่ระบบครั้งแรกเพื่อรับรหัสกู้คืน')
  }
  return user
}

export async function resetPassword(email, code, password, confirmation) {
  validatePassword(password, confirmation)
  // ตรวจรหัสกู้คืนอีกครั้งตอนบันทึก แม้ว่าหน้าฟอร์มผ่านขั้นแรกมาแล้ว
  await verifyRecovery(email, code)
  const users = await loadUsers()
  const user = users.find(item => normalizeEmail(item.email) === normalizeEmail(email))
  const recoveryCode = crypto.randomUUID()
  user.passwordCredential = await makeCredential(password)
  user.recoveryCredential = await makeCredential(normalizeCode(recoveryCode))
  delete user.password
  saveUsers(users)
  clearSession()
  return { recoveryCode }
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    const user = JSON.parse(raw)
    return user && typeof user.name === 'string' && typeof user.email === 'string' ? publicUser(user) : null
  } catch { return null }
}
export function saveSession(user, remember) {
  try {
    const destination = remember ? localStorage : sessionStorage
    destination.setItem(SESSION_KEY, JSON.stringify(publicUser(user)))
    ;(remember ? sessionStorage : localStorage).removeItem(SESSION_KEY)
  } catch { throw new Error('บันทึกการเข้าสู่ระบบไม่ได้ กรุณาอนุญาตการจัดเก็บข้อมูลของเบราว์เซอร์') }
}
export function clearSession() {
  let failed = false
  for (const storage of [localStorage, sessionStorage]) {
    try { storage.removeItem(SESSION_KEY) } catch { failed = true }
  }
  if (failed) throw new Error('ลบการเข้าสู่ระบบที่บันทึกไว้ไม่ได้ กรุณาตรวจสอบการจัดเก็บข้อมูลของเบราว์เซอร์')
}
