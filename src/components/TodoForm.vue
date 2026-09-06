<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])

const text = ref('')
const error = ref('')

function submit() {
  const clean = text.value.trim()
  if (!clean) {
    error.value = 'กรุณากรอกชื่องานก่อนกดเพิ่ม'
    return
  }
  emit('add', clean)
  text.value = ''
  error.value = ''
}

function handleInput() {
  if (error.value) {
    error.value = ''
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="todo-form" novalidate>
    <div class="input-group">
      <input
        v-model="text"
        type="text"
        placeholder="เพิ่มงานใหม่ที่ต้องทำ... (กด Enter เพื่อเพิ่ม)"
        :class="{ 'has-error': error }"
        @input="handleInput"
      />
      <button type="submit" class="btn btn-add">
        + เพิ่มงาน
      </button>
    </div>
    <p v-if="error" class="error-msg" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.todo-form {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
}

input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fff;
  color: #1a202c;
}

input[type="text"]:focus {
  border-color: var(--primary-color, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

input[type="text"].has-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.btn {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-add {
  background-color: var(--primary-color, #2563eb);
  color: #ffffff;
}

.btn-add:hover {
  filter: brightness(0.92);
}

.btn-add:active {
  transform: scale(0.98);
}

.error-msg {
  margin: 6px 0 0 2px;
  font-size: 13px;
  color: #ef4444;
  font-weight: 500;
}
</style>