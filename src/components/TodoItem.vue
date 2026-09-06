<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['toggle', 'update', 'remove'])

const isEditing = ref(false)
const draft = ref('')
const editInput = ref(null)
const editError = ref('')

function startEdit() {
  draft.value = props.todo.text
  editError.value = ''
  isEditing.value = true
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

function saveEdit() {
  const clean = draft.value.trim()
  if (!clean) {
    editError.value = 'ข้อความต้องไม่เว้นว่าง'
    return
  }
  emit('update', {
    id: props.todo.id,
    text: clean
  })
  isEditing.value = false
  editError.value = ''
}

function cancelEdit() {
  draft.value = props.todo.text
  isEditing.value = false
  editError.value = ''
}
</script>

<template>
  <li class="todo-item" :class="{ completed: todo.done, editing: isEditing }">
    <!-- โหมดแสดงผลปกติ (View Mode) -->
    <div v-if="!isEditing" class="view-mode">
      <div class="left-section">
        <label class="checkbox-container">
          <input
            type="checkbox"
            :checked="todo.done"
            @change="emit('toggle', todo.id)"
          />
          <span class="checkmark"></span>
        </label>
        <span class="todo-text" :class="{ 'text-done': todo.done }">
          <span class="todo-index">{{ index + 1 }}.</span>
          {{ todo.text }}
        </span>
      </div>

      <div class="action-buttons">
        <button
          class="btn btn-edit"
          title="แก้ไขงาน"
          @click="startEdit"
        >
          ✏️ แก้ไข
        </button>
        <button
          class="btn btn-delete"
          title="ลบงานนี้"
          @click="emit('remove', todo.id)"
        >
          🗑️ ลบ
        </button>
      </div>
    </div>

    <!-- โหมดแก้ไข (Edit Mode) -->
    <div v-else class="edit-mode">
      <div class="edit-input-wrapper">
        <input
          ref="editInput"
          v-model="draft"
          type="text"
          class="edit-input"
          :class="{ 'has-error': editError }"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          @input="editError = ''"
        />
        <p v-if="editError" class="edit-error">{{ editError }}</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-save" @click="saveEdit">
          💾 บันทึก
        </button>
        <button class="btn btn-cancel" @click="cancelEdit">
          ✖ ยกเลิก
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.todo-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

.todo-item.completed {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.todo-item.editing {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.view-mode,
.edit-mode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #10b981;
}

.todo-text {
  font-size: 15px;
  color: #1e293b;
  word-break: break-word;
  line-height: 1.4;
}

.todo-index {
  color: #64748b;
  font-weight: 600;
  margin-right: 4px;
}

.todo-text.text-done {
  text-decoration: line-through;
  color: #94a3b8;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-edit {
  background-color: #f1f5f9;
  color: #334155;
}

.btn-edit:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.btn-delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover {
  background-color: #fecaca;
  color: #b91c1c;
}

.btn-save {
  background-color: #10b981;
  color: #ffffff;
}

.btn-save:hover {
  background-color: #059669;
}

.btn-cancel {
  background-color: #e2e8f0;
  color: #475569;
}

.btn-cancel:hover {
  background-color: #cbd5e1;
}

.edit-input-wrapper {
  flex: 1;
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 15px;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.edit-input.has-error {
  border-color: #ef4444;
}

.edit-error {
  margin: 4px 0 0 2px;
  font-size: 12px;
  color: #ef4444;
}
</style>