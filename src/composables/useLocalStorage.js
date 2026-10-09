import { ref, unref, watch } from 'vue'

// key รับทั้ง string และ computed เพื่อแยกข้อมูลเมื่อสลับบัญชี
export function useLocalStorage(key, fallback, { validate = () => true, onError = () => {} } = {}) {
  const copyFallback = () => JSON.parse(JSON.stringify(fallback))
  const state = ref(copyFallback())
  let loading = false

  watch(() => unref(key), (storageKey) => {
    loading = true
    try {
      const saved = localStorage.getItem(storageKey)
      const value = saved === null ? copyFallback() : JSON.parse(saved)
      if (!validate(value)) throw new Error('Invalid stored data')
      state.value = value
    } catch {
      // เก็บข้อมูลต้นฉบับไว้ ไม่ลบทิ้งทันทีเมื่ออ่านไม่ได้
      state.value = copyFallback()
      onError('อ่านข้อมูลที่บันทึกไว้ไม่ได้ จึงแสดงค่าเริ่มต้น กรุณาตรวจสอบก่อนบันทึกใหม่')
    } finally {
      loading = false
    }
  }, { immediate: true, flush: 'sync' })

  watch(state, (value) => {
    if (loading) return
    try {
      localStorage.setItem(unref(key), JSON.stringify(value))
    } catch {
      onError('บันทึกข้อมูลไม่ได้ ข้อมูลที่เปลี่ยนในรอบนี้อาจหายเมื่อปิดหรือรีเฟรชหน้าเว็บ')
    }
  }, { deep: true, flush: 'sync' })
  return state
}
