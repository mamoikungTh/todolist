import { loadState, persistState, saveSubject, deleteSubject, saveSession, deleteSession, toggleSession, visibleSessions, summary } from './model.js'
const $ = id => document.getElementById(id)
// Storage access itself may be blocked, so keep it inside the model's try/catch.
const storage = { getItem: k => localStorage.getItem(k), setItem: (k, v) => localStorage.setItem(k, v) }
const loaded = loadState(storage)
let state = loaded.state
let corrupt = Boolean(loaded.error)
let subjectEdit = null
let sessionEdit = null
const formatDate = s => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${s}T12:00:00`))
function message(text, error = false) { $('message').textContent = text; $('message').className = error ? 'error' : 'success'; $('message').setAttribute('role', error ? 'alert' : 'status') }
function warning(text) { $('storage-warning').textContent = text; $('storage-warning').hidden = !text }
function mutate(update, success) {
  try {
    const next = update()
    if (corrupt && !confirm('ข้อมูลเดิมอ่านไม่ได้ ต้องการเริ่มข้อมูลชุดใหม่และเขียนทับข้อมูลเดิมหรือไม่?')) return false
    state = next
    const error = persistState(storage, state)
    if (!error) corrupt = false
    warning(error); message(success); render(); return true
  } catch (error) { message(error.message, true); return false }
}
function option(text, value) { const el = document.createElement('option'); el.textContent = text; el.value = value; return el }
function button(text, action, label = text) { const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', label); el.addEventListener('click', action); return el }
function textEl(tag, text, className = '') { const el = document.createElement(tag); el.textContent = text; el.className = className; return el }
function resetSubject() { subjectEdit = null; $('subject-form').reset(); $('subject-submit').textContent = 'เพิ่มวิชา'; $('subject-cancel').hidden = true }
function resetSession() { sessionEdit = null; $('session-form').reset(); $('session-submit').textContent = 'เพิ่มรอบอ่าน'; $('session-cancel').hidden = true; updateMax() }
function updateMax() { const s = state.subjects.find(s => s.id === $('session-subject').value); $('session-date').max = s?.examDate ?? '' }
function render() {
  const selected = $('session-subject').value
  const filtered = $('filter-subject').value
  $('session-subject').replaceChildren(option('เลือกวิชา', ''), ...state.subjects.map(s => option(s.name, s.id)))
  $('filter-subject').replaceChildren(option('ทุกวิชา', ''), ...state.subjects.map(s => option(s.name, s.id)))
  $('session-subject').value = state.subjects.some(s => s.id === selected) ? selected : ''
  $('filter-subject').value = state.subjects.some(s => s.id === filtered) ? filtered : ''
  $('session-submit').disabled = !state.subjects.length
  $('session-hint').textContent = state.subjects.length ? 'เลือกวันที่อ่านไม่เกินวันสอบ · รอบละ 5–480 นาที' : 'เริ่มจากเพิ่มวิชาทางซ้าย'
  updateMax()
  const totals = summary(state)
  $('subject-count').textContent = state.subjects.length
  $('done-count').textContent = `${totals.done} / ${totals.total}`
  $('planned-time').textContent = `${totals.planned} นาที`
  $('completed-time').textContent = `${totals.completed} นาที`
  $('subject-list').replaceChildren(...[...state.subjects].sort((a,b) => a.examDate.localeCompare(b.examDate)).map(s => {
    const li = document.createElement('li')
    li.append(textEl('strong', s.name), textEl('span', `สอบ ${formatDate(s.examDate)}`, 'muted'))
    const controls = textEl('div', '', 'row-actions')
    controls.append(button('แก้ไข', () => { subjectEdit = s.id; $('subject-name').value = s.name; $('exam-date').value = s.examDate; $('subject-submit').textContent = 'บันทึกวิชา'; $('subject-cancel').hidden = false; $('subject-name').focus() }, `แก้ไขวิชา ${s.name}`), button('ลบ', () => {
      if (confirm(`ลบวิชา “${s.name}”? วิชาที่มีรอบอ่านต้องลบรอบอ่านก่อน`)) {
        if (mutate(() => deleteSubject(state, s.id), 'ลบวิชาแล้ว') && subjectEdit === s.id) resetSubject()
      }
    }, `ลบวิชา ${s.name}`)); li.append(controls); return li
  }))
  const visible = visibleSessions(state, { subjectId: $('filter-subject').value, status: $('filter-status').value, search: $('filter-search').value })
  $('visible-count').textContent = `${visible.length} / ${totals.total} รอบ`
  $('session-list').replaceChildren(...visible.map(s => {
    const li = document.createElement('li'); li.className = `session ${s.done ? 'done' : ''}`
    const label = document.createElement('label'); label.className = 'check-label'
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = s.done; check.setAttribute('aria-label', `อ่านจบ ${s.topic}`)
    check.addEventListener('change', () => { if (!mutate(() => toggleSession(state, s.id), s.done ? 'เปลี่ยนเป็นยังไม่อ่านจบ' : 'บันทึกว่าอ่านจบแล้ว')) check.checked = s.done })
    label.append(check)
    const body = textEl('div', '', 'session-body'); body.append(textEl('span', state.subjects.find(x => x.id === s.subjectId).name, 'subject-chip'), textEl('strong', s.topic, 'topic'), textEl('span', `${formatDate(s.date)} · ${s.minutes} นาที · ${s.done ? 'อ่านจบแล้ว' : 'ยังไม่อ่านจบ'}`, 'muted'))
    label.append(body); li.append(label)
    const controls = textEl('div', '', 'row-actions')
    controls.append(button('แก้ไข', () => { sessionEdit = s.id; for (const key of ['subjectId','topic','date','minutes']) $('session-form').elements[key].value = s[key]; $('session-submit').textContent = 'บันทึกรอบอ่าน'; $('session-cancel').hidden = false; updateMax(); $('session-topic').focus() }, `แก้ไขรอบอ่าน ${s.topic}`), button('ลบ', () => {
      if (confirm(`ลบรอบอ่าน “${s.topic}”?`)) {
        if (mutate(() => deleteSession(state, s.id), 'ลบรอบอ่านแล้ว') && sessionEdit === s.id) resetSession()
      }
    }, `ลบรอบอ่าน ${s.topic}`)); li.append(controls); return li
  }))
  $('empty').hidden = visible.length > 0
  $('empty').querySelector('h3').textContent = totals.total ? 'ไม่พบรอบอ่านที่ตรงกัน' : 'เริ่มต้นด้วยรอบอ่านแรก'
  $('empty').querySelector('p').textContent = totals.total ? 'ลองล้างตัวกรองหรือใช้คำค้นอื่น' : 'เพิ่มวิชา แล้วเลือกหัวข้อที่อยากอ่านวันนี้'
}
$('subject-form').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); if (mutate(() => saveSubject(state, data, subjectEdit ?? undefined), subjectEdit ? 'แก้ไขวิชาแล้ว' : 'เพิ่มวิชาแล้ว')) resetSubject() })
$('session-form').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); if (mutate(() => saveSession(state, data, sessionEdit ?? undefined), sessionEdit ? 'แก้ไขรอบอ่านแล้ว' : 'เพิ่มรอบอ่านแล้ว')) resetSession() })
$('subject-cancel').addEventListener('click', resetSubject)
$('session-cancel').addEventListener('click', resetSession)
$('session-subject').addEventListener('change', updateMax)
for (const id of ['filter-search', 'filter-subject', 'filter-status']) $(id).addEventListener(id === 'filter-search' ? 'input' : 'change', render)
$('clear-filters').addEventListener('click', () => { $('filter-search').value = ''; $('filter-subject').value = ''; $('filter-status').value = 'all'; render() })
warning(loaded.error); render()
