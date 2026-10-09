import { computed, ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export function isTodoList(value) {
  if (!Array.isArray(value)) return false
  const ids = new Set()
  return value.every(todo => {
    if (!todo || !['string', 'number'].includes(typeof todo.id) || ids.has(todo.id)) return false
    ids.add(todo.id)
    return typeof todo.text === 'string' && todo.text.trim().length > 0 && typeof todo.done === 'boolean'
  })
}

export function useTodos(storageKey = 'student1-todo-list') {
  const storageError = ref('')
  const todos = useLocalStorage(storageKey, [], {
    validate: isTodoList,
    onError: message => { storageError.value = message }
  })
  const totalCount = computed(() => todos.value.length)
  const completedCount = computed(() => todos.value.filter(todo => todo.done).length)
  const pendingCount = computed(() => totalCount.value - completedCount.value)

  function addTodo(text) {
    const clean = typeof text === 'string' ? text.trim() : ''
    if (!clean) return false
    const now = new Date().toISOString()
    todos.value.unshift({
      id: globalThis.crypto?.randomUUID?.() ?? `todo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: clean, done: false, createdAt: now, updatedAt: now
    })
    return true
  }
  function toggleTodo(id) {
    const todo = todos.value.find(item => item.id === id)
    if (!todo) return
    todo.done = !todo.done
    todo.updatedAt = new Date().toISOString()
  }
  function updateTodo({ id, text }) {
    const todo = todos.value.find(item => item.id === id)
    const clean = typeof text === 'string' ? text.trim() : ''
    if (!todo || !clean) return false
    todo.text = clean
    todo.updatedAt = new Date().toISOString()
    return true
  }
  function removeTodo(id) {
    todos.value = todos.value.filter(todo => todo.id !== id)
  }
  function clearCompleted() {
    todos.value = todos.value.filter(todo => !todo.done)
  }
  return { todos, storageError, totalCount, completedCount, pendingCount, addTodo, toggleTodo, updateTodo, removeTodo, clearCompleted }
}
