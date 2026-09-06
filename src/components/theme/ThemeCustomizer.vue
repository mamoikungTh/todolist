<script setup>
import { ref, onMounted, watch } from 'vue'

// ค่าเริ่มต้น
const defaultColor = '#2563eb'
const defaultFont = "'Sarabun', sans-serif"

// สเตตของสีและฟอนต์ที่เลือก
const currentColor = ref(defaultColor)
const currentFont = ref(defaultFont)
const fontSize = ref(28) // ขนาดตัวอักษรของ Hello World

// รายการสีสำเร็จรูป (Color Presets)
const colorPresets = [
  { name: 'น้ำเงิน (Blue)', value: '#2563eb' },
  { name: 'เขียว (Emerald)', value: '#059669' },
  { name: 'ม่วง (Purple)', value: '#7c3aed' },
  { name: 'ส้ม (Orange)', value: '#ea580c' },
  { name: 'แดง (Rose)', value: '#e11d48' },
  { name: 'ดาร์ก (Dark)', value: '#1e293b' }
]

// รายการฟอนต์สำเร็จรูป (Font Presets)
const fontPresets = [
  { name: 'Sarabun (ทางการ)', value: "'Sarabun', sans-serif" },
  { name: 'Prompt (โมเดิร์น)', value: "'Prompt', sans-serif" },
  { name: 'Kanit (ยอดนิยม)', value: "'Kanit', sans-serif" },
  { name: 'Chakra Petch (ดิจิทัล)', value: "'Chakra Petch', sans-serif" },
  { name: 'Monospace (โปรแกรมเมอร์)', value: "'Courier New', monospace" }
]

// ฟังก์ชันปรับใช้สีและฟอนต์กับทั้งระบบ
function applyTheme(color, font) {
  currentColor.value = color
  currentFont.value = font

  // ตั้งค่า CSS Variables ให้ทั้งหน้าเว็บ Todo List เปลี่ยนสีและฟอนต์ตาม
  document.documentElement.style.setProperty('--primary-color', color)
  document.documentElement.style.setProperty('--app-font', font)

  // บันทึกลง localStorage
  localStorage.setItem('student3_theme_color', color)
  localStorage.setItem('student3_theme_font', font)
}

function selectColor(color) {
  applyTheme(color, currentFont.value)
}

function selectFont(font) {
  applyTheme(currentColor.value, font)
}

function resetDefault() {
  applyTheme(defaultColor, defaultFont)
  fontSize.value = 28
}

onMounted(() => {
  const savedColor = localStorage.getItem('student3_theme_color') || defaultColor
  const savedFont = localStorage.getItem('student3_theme_font') || defaultFont
  applyTheme(savedColor, savedFont)
})
</script>

<template>
  <aside class="theme-customizer-card">
    <header class="card-header">
      <span class="badge-student">Student 3 Assignment</span>
      <h2 class="title">ระบบเปลี่ยนสี & ฟอนต์</h2>
      <p class="subtitle">ปรับแต่งสีและรูปแบบตัวอักษรของ Todo List</p>
    </header>

    <!-- กล่องแสดงตัวอย่าง Hello World -->
    <div class="hello-world-wrapper">
      <div
        class="hello-world-box"
        :style="{
          color: currentColor,
          fontFamily: currentFont,
          fontSize: fontSize + 'px'
        }"
      >
        Hello World! 👋
      </div>
      <div class="hello-caption">
        สีปัจจุบัน: <span class="color-tag" :style="{ backgroundColor: currentColor }"></span> {{ currentColor }}
      </div>
    </div>

    <!-- 1. ปุ่มกดเปลี่ยนสี (Change Color) -->
    <section class="section">
      <label class="section-title">🎨 ปุ่มกดเปลี่ยนสี (Color Theme)</label>
      <div class="color-buttons-grid">
        <button
          v-for="color in colorPresets"
          :key="color.value"
          class="color-btn"
          :class="{ active: currentColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
          @click="selectColor(color.value)"
        >
          <span v-if="currentColor === color.value" class="check-icon">✓</span>
        </button>
      </div>

      <!-- ตัวเลือกกำหนดสีเอง (Custom Color Picker) -->
      <div class="custom-color-row">
        <span class="custom-label">หรือเลือกสีเอง:</span>
        <input
          type="color"
          :value="currentColor"
          @input="selectColor($event.target.value)"
          class="color-picker-input"
        />
      </div>
    </section>

    <!-- 2. ปุ่มกดเปลี่ยน Font (Change Font) -->
    <section class="section">
      <label class="section-title">🔤 ปุ่มกดเปลี่ยนฟอนต์ (Font Family)</label>
      <div class="font-buttons-list">
        <button
          v-for="font in fontPresets"
          :key="font.value"
          class="font-btn"
          :class="{ active: currentFont === font.value }"
          :style="{ fontFamily: font.value }"
          @click="selectFont(font.value)"
        >
          <span class="font-name">{{ font.name }}</span>
          <span v-if="currentFont === font.value" class="font-badge">เลือกอยู่</span>
        </button>
      </div>
    </section>

    <!-- ปรับขนาดตัวอักษร Hello World -->
    <section class="section">
      <div class="size-row">
        <label class="section-title">🔍 ปรับขนาดตัวอักษร</label>
        <span class="size-val">{{ fontSize }}px</span>
      </div>
      <input
        type="range"
        min="18"
        max="42"
        v-model="fontSize"
        class="size-slider"
      />
    </section>

    <footer class="card-footer">
      <button class="btn-reset" @click="resetDefault">
        🔄 รีเซ็ตเป็นค่าเริ่มต้น
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.theme-customizer-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  margin-bottom: 16px;
}

.badge-student {
  display: inline-block;
  background-color: #f3e8ff;
  color: #7e22ce;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

/* Hello World Box */
.hello-world-wrapper {
  margin: 16px 0 20px;
}

.hello-world-box {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  font-weight: 700;
  transition: all 0.3s ease;
  word-break: break-word;
  line-height: 1.2;
}

.hello-caption {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.color-tag {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
}

/* Sections */
.section {
  margin-bottom: 18px;
  text-align: left;
}

.section-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

/* Color Buttons Grid */
.color-buttons-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.color-btn {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 14px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.color-btn:hover {
  transform: scale(1.08);
}

.color-btn.active {
  border-color: #0f172a;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.custom-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-label {
  font-size: 12px;
  color: #64748b;
}

.color-picker-input {
  width: 36px;
  height: 28px;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

/* Font Buttons List */
.font-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.font-btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  font-size: 14px;
  transition: all 0.2s;
  color: #1e293b;
}

.font-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.font-btn.active {
  border-color: var(--primary-color, #2563eb);
  background-color: #eff6ff;
  color: var(--primary-color, #2563eb);
  font-weight: 600;
}

.font-badge {
  font-size: 11px;
  background-color: var(--primary-color, #2563eb);
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 9999px;
}

.size-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.size-val {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.size-slider {
  width: 100%;
  accent-color: var(--primary-color, #2563eb);
  cursor: pointer;
}

.card-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.btn-reset {
  background: none;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}
</style>