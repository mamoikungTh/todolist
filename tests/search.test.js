import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { filterTodos } from '../src/utils/filterTodos'
import App from '../src/App.vue'
import AuthView from '../src/components/auth/AuthView.vue'

const sample = [
  { id: 'a', text: 'Vue homework', done: false, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'b', text: 'VUE review', done: true, createdAt: '2026-01-03T00:00:00Z' },
  { id: 'c', text: 'ส่งงานอาจารย์', done: false, createdAt: '2026-01-02T00:00:00Z' }
]
function openApp() {
  localStorage.setItem('student1-todo-list', JSON.stringify(sample))
  return mount(App)
}

describe('Student 4: search, filter and sort', () => {
  it('combines trimmed, case-insensitive search with completion status', () => {
    expect(filterTodos(sample, '  vuE  ', 'done').map(item => item.id)).toEqual(['b'])
    expect(filterTodos(sample, 'vue', 'pending').map(item => item.id)).toEqual(['a'])
    expect(filterTodos(sample, 'อาจารย์').map(item => item.id)).toEqual(['c'])
    expect(filterTodos(sample, 'not found')).toEqual([])
    expect(filterTodos(sample, '   ')).toHaveLength(3)
  })
  it('sorts without mutating the source list or any task', () => {
    const original = JSON.stringify(sample)
    expect(filterTodos(sample).map(item => item.id)).toEqual(['b', 'c', 'a'])
    expect(filterTodos(sample, '', 'all', 'oldest').map(item => item.id)).toEqual(['a', 'c', 'b'])
    expect(filterTodos([{ id: 1, text: 'Zebra', done: false }, { id: 2, text: 'Apple', done: false }], '', 'all', 'name').map(item => item.text)).toEqual(['Apple', 'Zebra'])
    expect(JSON.stringify(sample)).toBe(original)
  })
  it('filters the visible list while keeping global counts correct', async () => {
    const app = openApp()
    await app.get('#todo-search').setValue('vue')
    await app.get('#todo-status').setValue('done')
    expect(app.findAll('.todo-item')).toHaveLength(1)
    expect(app.get('.todo-text').text()).toContain('VUE review')
    expect(app.get('.stat-num.total').text()).toBe('3')
    expect(app.get('.tools-summary').text()).toContain('แสดง 1 จากทั้งหมด 3 งาน')
  })
  it('distinguishes an empty search and resets filters', async () => {
    const app = openApp()
    await app.get('#todo-search').setValue('no match')
    expect(app.get('.empty-state').text()).toContain('ไม่พบงาน')
    await app.get('.tools-summary button').trigger('click')
    expect(app.findAll('.todo-item')).toHaveLength(3)
    expect(app.get('#todo-search').element.value).toBe('')
  })
  it('updates a filtered task by ID and does not modify the wrong task', async () => {
    const app = openApp()
    await app.get('#todo-search').setValue('Vue homework')
    await app.get('.btn-edit').trigger('click')
    await app.get('.edit-input').setValue('Updated homework')
    await app.get('.btn-save').trigger('click')
    expect(app.findAll('.todo-item')).toHaveLength(0)
    const saved = JSON.parse(localStorage.getItem('student1-todo-list'))
    expect(saved.find(item => item.id === 'a').text).toBe('Updated homework')
    expect(saved.find(item => item.id === 'b').text).toBe('VUE review')
  })
  it('respects cancellation and clears all completed tasks even with an active search', async () => {
    const app = openApp()
    await app.get('#todo-search').setValue('ส่งงาน')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await app.get('.btn-clear').trigger('click')
    expect(JSON.parse(localStorage.getItem('student1-todo-list'))).toHaveLength(3)
    confirm.mockReturnValue(true)
    await app.get('.btn-clear').trigger('click')
    expect(JSON.parse(localStorage.getItem('student1-todo-list')).map(item => item.id)).toEqual(['a', 'c'])
    expect(app.get('.todo-text').text()).toContain('ส่งงาน')
  })
  it('keeps guest and member tasks separate and resets filters when switching accounts', async () => {
    const app = openApp()
    await app.get('#todo-search').setValue('vue')
    await app.findAll('.nav-tab-btn')[1].trigger('click')
    app.findComponent(AuthView).vm.$emit('login-success', { name: 'Member', email: 'member@example.com' })
    await nextTick()
    expect(app.findAll('.todo-item')).toHaveLength(0)
    expect(app.get('#todo-search').element.value).toBe('')
    await app.get('[aria-label="ชื่องานใหม่"]').setValue('Member only')
    await app.get('.todo-form').trigger('submit')
    await app.get('.btn-logout-small').trigger('click')
    expect(app.findAll('.todo-item')).toHaveLength(3)
    expect(app.text()).not.toContain('Member only')
    expect(JSON.parse(localStorage.getItem('student1-todo-list:member%40example.com'))[0].text).toBe('Member only')
  })
  it('changes theme without changing task data', async () => {
    const app = openApp()
    const before = localStorage.getItem('student1-todo-list')
    await app.get('[aria-label="ม่วง (Purple)"]').trigger('click')
    expect(localStorage.getItem('student1-todo-list')).toBe(before)
    expect(app.findAll('.todo-item')).toHaveLength(3)
  })
})
