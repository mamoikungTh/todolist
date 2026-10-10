import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useTodos } from '../src/composables/useTodos'
import TodoForm from '../src/components/TodoForm.vue'
import TodoItem from '../src/components/TodoItem.vue'

const scopes = []
function setup(key) {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(() => useTodos(key))
}
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))

describe('Student 1: Todo CRUD and persistence', () => {
  it('rejects blank tasks, trims text, and creates unique IDs for rapid additions', () => {
    const app = setup()
    expect(app.addTodo('   ')).toBe(false)
    app.addTodo('  ส่งงาน  ')
    app.addTodo('ส่งงาน')
    expect(app.todos.value).toHaveLength(2)
    expect(app.todos.value[0].text).toBe('ส่งงาน')
    expect(new Set(app.todos.value.map(todo => todo.id)).size).toBe(2)
  })
  it('edits, toggles, counts and deletes the requested task', () => {
    const app = setup()
    app.addTodo('A'); app.addTodo('B')
    const id = app.todos.value[1].id
    expect(app.updateTodo({ id, text: '  Updated  ' })).toBe(true)
    expect(app.updateTodo({ id, text: ' ' })).toBe(false)
    app.toggleTodo(id)
    expect(app.completedCount.value).toBe(1)
    expect(app.pendingCount.value).toBe(1)
    expect(app.todos.value[1].text).toBe('Updated')
    app.removeTodo(id)
    expect(app.todos.value.map(todo => todo.text)).toEqual(['B'])
  })
  it('clears completed tasks while preserving unfinished tasks', () => {
    const app = setup()
    app.addTodo('Keep'); app.addTodo('Done')
    app.toggleTodo(app.todos.value[0].id)
    app.clearCompleted()
    expect(app.todos.value.map(todo => todo.text)).toEqual(['Keep'])
  })
  it('restores edits and completion after reopening', () => {
    const app = setup()
    app.addTodo('Saved')
    const id = app.todos.value[0].id
    app.updateTodo({ id, text: 'Edited' }); app.toggleTodo(id)
    const restored = setup()
    expect(restored.todos.value[0]).toMatchObject({ id, text: 'Edited', done: true })
  })
  it.each(['{broken', 'null', '{}', '[{"id":1,"text":"A","done":"false"}]', '[{"id":1,"text":"A","done":false},{"id":1,"text":"B","done":true}]'])('handles invalid stored data without erasing the original: %s', saved => {
    localStorage.setItem('student1-todo-list', saved)
    const app = setup()
    expect(app.todos.value).toEqual([])
    expect(app.storageError.value).not.toBe('')
    expect(localStorage.getItem('student1-todo-list')).toBe(saved)
  })
  it('keeps the UI usable and reports blocked storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    const app = setup()
    expect(() => app.addTodo('Unsaved')).not.toThrow()
    expect(app.todos.value).toHaveLength(1)
    expect(app.storageError.value).toContain('บันทึกข้อมูลไม่ได้')
  })
  it('switches storage keys without copying one account into another', () => {
    const key = ref('guest')
    const app = setup(key)
    app.addTodo('Guest task')
    key.value = 'member'
    expect(app.todos.value).toEqual([])
    app.addTodo('Member task')
    key.value = 'guest'
    expect(app.todos.value.map(todo => todo.text)).toEqual(['Guest task'])
    expect(JSON.parse(localStorage.getItem('member'))[0].text).toBe('Member task')
  })
})

describe('Todo inputs', () => {
  it('shows a validation error for whitespace and emits a trimmed task', async () => {
    const form = mount(TodoForm)
    await form.get('input').setValue('   ')
    await form.get('form').trigger('submit')
    expect(form.find('[role="alert"]').exists()).toBe(true)
    expect(form.emitted('add')).toBeUndefined()
    await form.get('input').setValue('  ส่งงาน  ')
    await form.get('form').trigger('submit')
    expect(form.emitted('add')[0]).toEqual(['ส่งงาน'])
    expect(form.get('input').element.value).toBe('')
  })
  it('cancels edits with Escape and rejects blank edits', async () => {
    const row = mount(TodoItem, { props: { todo: { id: 'a', text: 'Original', done: false }, index: 0 } })
    await row.get('.btn-edit').trigger('click')
    await row.get('.edit-input').setValue('  ')
    await row.get('.btn-save').trigger('click')
    expect(row.emitted('update')).toBeUndefined()
    expect(row.find('[role="alert"]').exists()).toBe(true)
    await row.get('.edit-input').trigger('keyup', { key: 'Escape' })
    expect(row.text()).toContain('Original')
    expect(row.find('.edit-input').exists()).toBe(false)
  })
})
