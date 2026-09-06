<script setup>
import { ref, computed, onMounted } from 'vue'
import TodoForm from './components/TodoForm.vue'
import TodoList from './components/TodoList.vue'
import AuthView from './components/auth/AuthView.vue'
import ThemeCustomizer from './components/theme/ThemeCustomizer.vue'
import { useLocalStorage } from './composables/useLocalStorage'

// แท็บที่กำลังแสดง: 'todo' (Student 1) หรือ 'auth' (Student 2)
const activeTab = ref('todo')

// ผู้ใช้ที่เข้าสู่ระบบอยู่ในปัจจุบัน (Student 2)
const currentUser = ref(null)

onMounted(() => {
  try {
    const savedUser = localStorage.getItem('current_auth_user')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  } catch {
    // fallback
  }
})

function handleLoginSuccess(user) {
  currentUser.value = user
  localStorage.setItem('current_auth_user', JSON.stringify(user))
  // แจ้งเตือนสั้นๆ แล้วสลับกลับมาหน้า Todo List
  activeTab.value = 'todo'
}

function handleLogout() {
  currentUser.value = null
  localStorage.removeItem('current_auth_user')
}

// ----------------------------------------------------
// ข้อมูลและฟังก์ชันของ STUDENT 1 - Main Todo List
// ----------------------------------------------------
const defaultTodos = [
  {
    id: 101,
    text: 'Student 1: พัฒนา Add, Edit, Delete, View Todo List',
    done: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 102,
    text: 'Student 2: พัฒนาระบบ Login, Register, Forget Password',
    done: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 103,
    text: 'Student 3: พัฒนาระบบเปลี่ยนสีและฟอนต์ (Hello World ด้านขวามือ)',
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const todos = useLocalStorage('student1-todo-list', defaultTodos)

// สถิติจำนวนงาน
const totalCount = computed(() => todos.value.length)
const completedCount = computed(() => todos.value.filter(t => t.done).length)
const pendingCount = computed(() => todos.value.filter(t => !t.done).length)

// 1. CREATE: เพิ่มงาน
function addTodo(text) {
  const now = new Date().toISOString()
  todos.value.unshift({
    id: Date.now(),
    text: text.trim(),
    done: false,
    createdAt: now,
    updatedAt: now
  })
}

// 2. UPDATE: สลับสถานะ Done
function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.done = !todo.done
    todo.updatedAt = new Date().toISOString()
  }
}

// 3. UPDATE: แก้ไขข้อความ
function updateTodo({ id, text }) {
  const todo = todos.value.find(t => t.id === id)
  const cleanText = text.trim()
  if (!todo || !cleanText) return
  todo.text = cleanText
  todo.updatedAt = new Date().toISOString()
}

// 4. DELETE: ลบงาน
function removeTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

// ล้างงานที่เสร็จแล้วทั้งหมด
function clearCompleted() {
  if (confirm('คุณต้องการล้างรายการที่เสร็จแล้วทั้งหมดใช่หรือไม่?')) {
    todos.value = todos.value.filter(t => !t.done)
  }
}
</script>

<template>
  <div class="main-layout">
    <!-- Navbar แถบด้านบน -->
    <header class="top-navbar">
      <div class="nav-brand">
        <span class="brand-icon">📋</span>
        <div class="brand-text">
          <span class="brand-title">Todo List Project</span>
          <span class="brand-subtitle">Student 1, Student 2, Student 3</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <button
          class="nav-tab-btn"
          :class="{ active: activeTab === 'todo' }"
          @click="activeTab = 'todo'"
        >
          📝 Student 1: Todo List
        </button>
        <button
          class="nav-tab-btn"
          :class="{ active: activeTab === 'auth' }"
          @click="activeTab = 'auth'"
        >
          🔐 Student 2: ระบบ Login
        </button>
      </nav>

      <!-- ส่วนแสดงสถานะผู้ใช้ (User Status) -->
      <div class="user-action-area">
        <div v-if="currentUser" class="user-chip">
          <span class="user-icon">👤</span>
          <span class="user-display-name">{{ currentUser.name }}</span>
          <button class="btn-logout-small" title="ออกจากระบบ" @click="handleLogout">
            ออก
          </button>
        </div>
        <button
          v-else
          class="btn-login-nav"
          @click="activeTab = 'auth'"
        >
          🔑 เข้าสู่ระบบ (Student 2)
        </button>
      </div>
    </header>

    <!-- พื้นที่เนื้อหาหลัก 2 คอลัมน์ (ซ้าย: Todo/Auth, ขวา: Theme Customizer Hello World) -->
    <main class="content-container">
      <!-- คอลัมน์ซ้าย / กลาง (Student 1 หรือ Student 2) -->
      <section class="left-column">
        <!-- 1. แสดง STUDENT 1: Main Todo List -->
        <div v-if="activeTab === 'todo'" class="card main-card">
          <div class="card-top-header">
            <span class="badge-role badge-s1">Student 1 Assignment</span>
            <h1 class="card-title">Main Todo List</h1>
            <p class="card-subtitle">
              ระบบจัดการรายการงาน (Add, Edit, Delete, View Todo List)
            </p>
          </div>

          <!-- สถิติจำนวนงาน -->
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-lbl">งานทั้งหมด</span>
              <span class="stat-num total">{{ totalCount }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">กำลังทำ</span>
              <span class="stat-num pending">{{ pendingCount }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">เสร็จแล้ว</span>
              <span class="stat-num done">{{ completedCount }}</span>
            </div>
          </div>

          <!-- ฟอร์มเพิ่มงาน (Create / Add) -->
          <TodoForm @add="addTodo" />

          <!-- รายการ Todo (Read / View, Update, Delete) -->
          <TodoList
            :todos="todos"
            @toggle="toggleTodo"
            @update="updateTodo"
            @remove="removeTodo"
          />

          <!-- ปุ่มล้างงานที่เสร็จแล้ว -->
          <div v-if="completedCount > 0" class="card-bottom-actions">
            <button class="btn-clear" @click="clearCompleted">
              🧹 ล้างงานที่เสร็จแล้ว ({{ completedCount }})
            </button>
          </div>
        </div>

        <!-- 2. แสดง STUDENT 2: ระบบ Login (Login, Register, Forget Password) -->
        <div v-else-if="activeTab === 'auth'">
          <AuthView
            :current-user="currentUser"
            @login-success="handleLoginSuccess"
            @logout="handleLogout"
          />
        </div>
      </section>

      <!-- คอลัมน์ขวามือ (Student 3 - Hello World + เปลี่ยนสี & ฟอนต์) -->
      <section class="right-column">
        <ThemeCustomizer />
      </section>
    </main>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Navbar */
.top-navbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-wrap: wrap;
  gap: 12px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 26px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.brand-subtitle {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.nav-tabs {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.nav-tab-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tab-btn.active {
  background-color: #ffffff;
  color: var(--primary-color, #2563eb);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-action-area {
  display: flex;
  align-items: center;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 13px;
}

.user-display-name {
  font-weight: 600;
  color: #334155;
}

.btn-logout-small {
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 600;
}

.btn-logout-small:hover {
  background-color: #fecaca;
}

.btn-login-nav {
  background-color: var(--primary-color, #2563eb);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-login-nav:hover {
  filter: brightness(0.92);
}

/* Content Container */
.content-container {
  display: grid;
  grid-template-columns: 1fr 370px;
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 28px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.left-column {
  min-width: 0;
}

.right-column {
  min-width: 0;
}

/* Main Card */
.main-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 30px;
}

.card-top-header {
  text-align: center;
  margin-bottom: 22px;
}

.badge-role {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 9999px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.badge-s1 {
  background-color: #dbeafe;
  color: #1e40af;
}

.card-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.card-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  text-align: center;
}

.stat-lbl {
  display: block;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 2px;
}

.stat-num {
  font-size: 20px;
  font-weight: 800;
}

.stat-num.total {
  color: var(--primary-color, #2563eb);
}

.stat-num.pending {
  color: #f59e0b;
}

.stat-num.done {
  color: #10b981;
}

.card-bottom-actions {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.btn-clear {
  background: transparent;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 960px) {
  .content-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .top-navbar {
    flex-direction: column;
    align-items: stretch;
  }
  .nav-tabs {
    justify-content: center;
  }
  .user-action-area {
    justify-content: center;
  }
  .main-card {
    padding: 18px;
  }
}
</style>