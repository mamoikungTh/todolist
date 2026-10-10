import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginAccount, registerAccount, verifyRecovery, resetPassword, readSession, saveSession, clearSession, DEMO_RECOVERY_CODE } from '../src/services/demoAuth'

const details = { name: '  Student  ', email: ' User@Example.com ', password: 'secret123', confirmPassword: 'secret123' }
beforeEach(() => localStorage.setItem('registered_users', '[]'))

describe('Student 2: demo accounts', () => {
  it('registers, normalizes email and stores neither password nor recovery code as plain text', async () => {
    const result = await registerAccount(details)
    expect(result.user).toEqual({ name: 'Student', email: 'user@example.com' })
    expect(result.recoveryCode).toBeTruthy()
    const raw = localStorage.getItem('registered_users')
    expect(raw).not.toContain('secret123')
    expect(raw).not.toContain(result.recoveryCode)
    expect((await loginAccount(' USER@EXAMPLE.COM ', 'secret123')).user).toEqual(result.user)
  })
  it.each([
    [{ name: ' ' }, 'ชื่อ'],
    [{ email: 'not-an-email' }, 'อีเมล'],
    [{ password: 'short', confirmPassword: 'short' }, '6'],
    [{ confirmPassword: 'different' }, 'ไม่ตรงกัน']
  ])('rejects invalid registration: %o', async (change, message) => {
    await expect(registerAccount({ ...details, ...change })).rejects.toThrow(message)
    expect(JSON.parse(localStorage.getItem('registered_users'))).toEqual([])
  })
  it('rejects duplicate emails irrespective of spaces or letter case', async () => {
    await registerAccount(details)
    await expect(registerAccount({ ...details, email: 'user@example.COM' })).rejects.toThrow('ถูกใช้งาน')
    expect(JSON.parse(localStorage.getItem('registered_users'))).toHaveLength(1)
  })
  it('rejects missing fields and wrong credentials', async () => {
    await registerAccount(details)
    await expect(loginAccount('', '')).rejects.toThrow('ครบถ้วน')
    await expect(loginAccount('user@example.com', 'wrong')).rejects.toThrow('ไม่ถูกต้อง')
    await expect(loginAccount('missing@example.com', 'secret123')).rejects.toThrow('ไม่ถูกต้อง')
    expect(readSession()).toBeNull()
  })
  it('requires a recovery code and rotates it after a successful reset', async () => {
    const result = await registerAccount(details)
    await expect(resetPassword(result.user.email, '', 'changed123', 'changed123')).rejects.toThrow('รหัสกู้คืน')
    await expect(resetPassword(result.user.email, 'wrong', 'changed123', 'changed123')).rejects.toThrow('รหัสกู้คืน')
    const changed = await resetPassword(result.user.email, result.recoveryCode, 'changed123', 'changed123')
    await expect(loginAccount(result.user.email, 'secret123')).rejects.toThrow('ไม่ถูกต้อง')
    expect((await loginAccount(result.user.email, 'changed123')).user.email).toBe(result.user.email)
    await expect(verifyRecovery(result.user.email, result.recoveryCode)).rejects.toThrow('รหัสกู้คืน')
    await expect(verifyRecovery(result.user.email, changed.recoveryCode)).resolves.toBeTruthy()
  }, 10000)
  it('rejects short or mismatched reset passwords without changing credentials', async () => {
    const result = await registerAccount(details)
    await expect(resetPassword(result.user.email, result.recoveryCode, 'x', 'x')).rejects.toThrow('6')
    await expect(resetPassword(result.user.email, result.recoveryCode, 'changed123', 'wrong')).rejects.toThrow('ไม่ตรงกัน')
    await expect(loginAccount(result.user.email, 'secret123')).resolves.toBeTruthy()
  })
  it('migrates existing plaintext accounts only after valid login', async () => {
    const old = [{ name: 'Original', email: 'old@example.com', password: 'oldpass' }]
    localStorage.setItem('registered_users', JSON.stringify(old))
    await expect(loginAccount('old@example.com', 'wrong')).rejects.toThrow()
    expect(JSON.parse(localStorage.getItem('registered_users'))[0].password).toBe('oldpass')
    const result = await loginAccount('old@example.com', 'oldpass')
    expect(result.recoveryCode).toBeTruthy()
    expect(localStorage.getItem('registered_users')).not.toContain('oldpass')
    await expect(verifyRecovery('old@example.com', result.recoveryCode)).resolves.toBeTruthy()
  })
  it('supports the existing demo account', async () => {
    localStorage.removeItem('registered_users')
    expect((await loginAccount('student@example.com', 'password123')).user.email).toBe('student@example.com')
    await expect(verifyRecovery('student@example.com', DEMO_RECOVERY_CODE)).resolves.toBeTruthy()
  }, 10000)
  it.each(['{bad', 'null', '{}', '[null]'])('reports corrupt account data without overwriting it: %s', async raw => {
    localStorage.setItem('registered_users', raw)
    await expect(loginAccount('user@example.com', 'secret123')).rejects.toThrow('ข้อมูล')
    expect(localStorage.getItem('registered_users')).toBe(raw)
  })
  it('reports a failed account save', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    await expect(registerAccount(details)).rejects.toThrow('บันทึกบัญชีไม่ได้')
  })
})

describe('Remember me and logout', () => {
  const user = { name: 'Student', email: 'user@example.com' }
  it('keeps a normal login in sessionStorage and a remembered login in localStorage', () => {
    saveSession(user, false)
    expect(localStorage.getItem('current_auth_user')).toBeNull()
    expect(readSession()).toEqual(user)
    saveSession(user, true)
    expect(sessionStorage.getItem('current_auth_user')).toBeNull()
    expect(JSON.parse(localStorage.getItem('current_auth_user'))).toEqual(user)
    saveSession(user, false)
    expect(localStorage.getItem('current_auth_user')).toBeNull()
  })
  it('clears both session types on logout', () => {
    saveSession(user, true)
    sessionStorage.setItem('current_auth_user', JSON.stringify(user))
    clearSession()
    expect(readSession()).toBeNull()
    expect(sessionStorage.getItem('current_auth_user')).toBeNull()
  })
  it('ignores a malformed saved session', () => {
    localStorage.setItem('current_auth_user', '{bad')
    expect(readSession()).toBeNull()
  })
})
