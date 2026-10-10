<script setup>
defineProps({
  query: { type: String, default: '' },
  status: { type: String, default: 'all' },
  sort: { type: String, default: 'newest' },
  visibleCount: { type: Number, required: true },
  totalCount: { type: Number, required: true }
})
const emit = defineEmits(['update:query', 'update:status', 'update:sort', 'reset'])
</script>

<template>
  <section class="todo-tools" aria-label="ค้นหาและกรองงาน">
    <div class="tools-title"><strong>ค้นหาและจัดการงาน</strong><span>Student 4</span></div>
    <label class="search-label" for="todo-search">ค้นหาชื่องาน</label>
    <input id="todo-search" type="search" :value="query" placeholder="พิมพ์คำที่ต้องการค้นหา..." @input="emit('update:query', $event.target.value)" />
    <div class="tools-row">
      <label for="todo-status">สถานะ
        <select id="todo-status" :value="status" @change="emit('update:status', $event.target.value)">
          <option value="all">ทั้งหมด</option><option value="pending">ยังไม่เสร็จ</option><option value="done">เสร็จแล้ว</option>
        </select>
      </label>
      <label for="todo-sort">เรียงตาม
        <select id="todo-sort" :value="sort" @change="emit('update:sort', $event.target.value)">
          <option value="newest">เพิ่มล่าสุดก่อน</option><option value="oldest">เพิ่มเก่าสุดก่อน</option><option value="name">ชื่องาน</option>
        </select>
      </label>
    </div>
    <div class="tools-summary">
      <span role="status" aria-live="polite">แสดง {{ visibleCount }} จากทั้งหมด {{ totalCount }} งาน</span>
      <button v-if="query || status !== 'all' || sort !== 'newest'" type="button" @click="emit('reset')">ล้างตัวกรอง</button>
    </div>
  </section>
</template>

<style scoped>
.todo-tools { padding: 16px; margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
.tools-title, .tools-summary { display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.tools-title { margin-bottom: 12px; font-size: 14px; }
.tools-title span { color: #0369a1; background: #e0f2fe; padding: 3px 8px; border-radius: 20px; font-size: 11px; }
label { display: block; font-size: 12px; color: #475569; }
input, select { width: 100%; min-width: 0; margin-top: 4px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e293b; background: white; font-size: 14px; }
.tools-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
.tools-summary { font-size: 12px; color: #64748b; }
button { border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; background: white; color: #334155; cursor: pointer; }
@media(max-width: 380px) { .tools-row { grid-template-columns: 1fr; } }
</style>
