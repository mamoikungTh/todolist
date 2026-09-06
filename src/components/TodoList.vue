<script setup>
import TodoItem from './TodoItem.vue'

defineProps({
  todos: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['toggle', 'update', 'remove'])
</script>

<template>
  <div class="todo-list-container">
    <ul v-if="todos.length" class="todo-list">
      <TodoItem
        v-for="(todo, index) in todos"
        :key="todo.id"
        :todo="todo"
        :index="index"
        @toggle="emit('toggle', $event)"
        @update="emit('update', $event)"
        @remove="emit('remove', $event)"
      />
    </ul>

    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>ยังไม่มีรายการงานใน Todo List</h3>
      <p>พิมพ์ชื่องานด้านบนแล้วกดปุ่ม "เพิ่มงาน" เพื่อเริ่มต้นใช้งานได้เลย</p>
    </div>
  </div>
</template>

<style scoped>
.todo-list-container {
  margin-top: 10px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
  margin-top: 15px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin: 0 0 6px 0;
  color: #334155;
  font-size: 17px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>