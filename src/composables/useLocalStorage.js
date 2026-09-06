import { ref, watch } from 'vue'

export function useLocalStorage(key, fallback) {
  const state = ref(fallback)
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      state.value = JSON.parse(saved)
    }
  } catch (err) {
    console.warn('Failed to parse localStorage data for key:', key, err)
    localStorage.removeItem(key)
  }

  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (err) {
        console.error('Failed to save to localStorage:', err)
      }
    },
    { deep: true }
  )

  return state
}