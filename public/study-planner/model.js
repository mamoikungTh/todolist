export const STORAGE_KEY = 'lab6-study-planner-v1'
export const emptyState = () => ({ version: 1, subjects: [], sessions: [] })
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}
function cleanText(value, label, max) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || text.length > max) throw new Error(`${label}ต้องมี 1–${max} ตัวอักษร`)
  return text
}
export function saveSubject(state, input, id = crypto.randomUUID()) {
  const name = cleanText(input.name, 'ชื่อวิชา', 60)
  if (!validDate(input.examDate)) throw new Error('กรุณาเลือกวันสอบที่ถูกต้อง')
  if (state.subjects.some(s => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) throw new Error('มีชื่อวิชานี้แล้ว')
  if (state.sessions.some(s => s.subjectId === id && s.date > input.examDate)) throw new Error('วันสอบใหม่อยู่ก่อนรอบอ่านที่มีอยู่ กรุณาแก้รอบอ่านก่อน')
  const subject = { id, name, examDate: input.examDate }
  return { ...state, subjects: state.subjects.some(s => s.id === id) ? state.subjects.map(s => s.id === id ? subject : s) : [...state.subjects, subject] }
}
export function deleteSubject(state, id) {
  if (state.sessions.some(s => s.subjectId === id)) throw new Error('ลบรอบอ่านของวิชานี้ก่อน จึงจะลบวิชาได้')
  return { ...state, subjects: state.subjects.filter(s => s.id !== id) }
}
export function saveSession(state, input, id = crypto.randomUUID()) {
  const subject = state.subjects.find(s => s.id === input.subjectId)
  if (!subject) throw new Error('กรุณาเลือกวิชาที่มีอยู่')
  const topic = cleanText(input.topic, 'หัวข้ออ่าน', 120)
  if (!validDate(input.date)) throw new Error('กรุณาเลือกวันที่อ่านที่ถูกต้อง')
  if (input.date > subject.examDate) throw new Error('วันที่อ่านต้องไม่เกินวันสอบ')
  const minutes = Number(input.minutes)
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) throw new Error('เวลาอ่านต้องเป็นจำนวนเต็ม 5–480 นาที')
  const old = state.sessions.find(s => s.id === id)
  const session = { id, subjectId: subject.id, topic, date: input.date, minutes, done: old?.done ?? false }
  return { ...state, sessions: old ? state.sessions.map(s => s.id === id ? session : s) : [...state.sessions, session] }
}
export function toggleSession(state, id) {
  return { ...state, sessions: state.sessions.map(s => s.id === id ? { ...s, done: !s.done } : s) }
}
export function deleteSession(state, id) {
  return { ...state, sessions: state.sessions.filter(s => s.id !== id) }
}
export function visibleSessions(state, { subjectId = '', status = 'all', search = '' } = {}) {
  const query = search.trim().toLowerCase()
  return state.sessions.filter(s => (!subjectId || s.subjectId === subjectId) &&
    (status === 'all' || (status === 'done' ? s.done : !s.done)) &&
    `${s.topic} ${state.subjects.find(x => x.id === s.subjectId)?.name ?? ''}`.toLowerCase().includes(query))
    .sort((a, b) => a.date.localeCompare(b.date) || a.topic.localeCompare(b.topic, 'th'))
}
export function summary(state) {
  return { total: state.sessions.length, done: state.sessions.filter(s => s.done).length,
    planned: state.sessions.reduce((n, s) => n + s.minutes, 0),
    completed: state.sessions.filter(s => s.done).reduce((n, s) => n + s.minutes, 0) }
}
export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return { state: emptyState(), error: '' }
    const data = JSON.parse(raw)
    if (data?.version !== 1 || !Array.isArray(data.subjects) || !Array.isArray(data.sessions)) throw new Error()
    const ids = new Set()
    let checked = emptyState()
    for (const s of data.subjects) {
      if (!s || typeof s.id !== 'string' || !s.id || ids.has(s.id)) throw new Error()
      ids.add(s.id)
      checked = saveSubject(checked, s, s.id)
    }
    for (const s of data.sessions) {
      if (!s || typeof s.id !== 'string' || !s.id || ids.has(s.id) || typeof s.done !== 'boolean') throw new Error()
      ids.add(s.id)
      checked = saveSession(checked, s, s.id)
      if (s.done) checked = toggleSession(checked, s.id)
    }
    return { state: checked, error: '' }
  } catch {
    return { state: emptyState(), error: 'อ่านข้อมูลเดิมไม่ได้ ระบบยังไม่เขียนทับข้อมูล กรุณาสำรองข้อมูลใน browser ก่อนเริ่มบันทึกใหม่' }
  }
}
export function persistState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return '' }
  catch { return 'บันทึกใน browser ไม่สำเร็จ ข้อมูลรอบนี้อยู่ชั่วคราวและอาจหายเมื่อปิดหน้าเว็บ' }
}
