# Todo List (ทีม 4 คน)

พัฒนาต่อจากโปรเจกต์เดิมด้วย Vue 3 + Vite ใช้สำหรับฝึก Feature Branch, AI Plan, Unit Test และ Manual Test

## เปิดงานที่พัฒนาเสร็จสำหรับตรวจ

ชุดรวมสำหรับทดสอบอยู่ที่ **[`feature4.1`](https://github.com/mamoikungTh/todolist/tree/feature4.1)** บน GitHub แล้ว รวมงานของทั้ง 4 ส่วน พร้อม tests และเอกสาร ส่วน `dev` เป็นฐานสำหรับรับงานหลังผ่าน Manual Test และ Peer Review ตาม Lab 5-3

หากมี repository เดิมอยู่ ให้เปิด Terminal ในโฟลเดอร์นั้น:

```bash
git status
git fetch origin
git switch feature4.1
npm ci
npm test
npm run dev
```

ถ้า `git status` แสดงงานที่ยังไม่บันทึก ให้ commit งานของตัวเองก่อนสลับ branch อย่าใช้คำสั่งลบทิ้งหรือ force checkout

Windows PowerShell ที่แจ้งว่า `npm.ps1` ถูกบล็อก ให้ใช้ `npm.cmd` แทน:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

สำหรับเครื่องใหม่ หรือเคยใช้ Git Bundle ชุดก่อนหน้า ให้ clone จาก GitHub ในโฟลเดอร์ใหม่:

```bash
git clone --branch feature4.1 https://github.com/mamoikungTh/todolist.git
cd todolist
npm ci
npm test
npm run dev
```

เปิด URL ที่ Terminal แสดง เช่น `http://localhost:5173/` ใช้ Node ตาม `engines` ใน package.json; รอบนี้ทดสอบด้วย Node 24.19.0

## งานทั้ง 4 ส่วน

| ส่วน | ฟีเจอร์ | Branch |
|---|---|---|
| Student 1 | เพิ่ม ดู แก้ไข ลบ ติ๊กเสร็จ และบันทึก Todo | `feature1.1` |
| Student 2 | สมัครสมาชิก เข้าสู่ระบบ ออกจากระบบ จำการเข้าสู่ระบบ และกู้รหัสผ่านด้วยรหัสกู้คืน | `feature2.1` |
| Student 3 | เปลี่ยนสี ฟอนต์ ขนาด Hello World และรีเซ็ตค่าเริ่มต้น | `feature3.1` |
| Student 4 | ค้นหา กรองสถานะ เรียงลำดับ และล้างงานที่เสร็จแล้ว | `feature4.1` |

Codex ช่วยทำแต่ละส่วนตามลำดับ ดังนั้น branch หลังจะมีงานของ branch ก่อนหน้าอยู่ด้วย ดู [แผนก่อนเขียนโค้ด](docs/LAB5-3-PLAN.md) งานเดิมใน `main` และ branch เก่ายังอยู่

## ทดลองใช้

- โหมดผู้เยี่ยมชมใช้ข้อมูล Todo เดิมที่เก็บด้วย key `student1-todo-list`
- เมื่อเข้าสู่ระบบจะเห็นงานเฉพาะบัญชีนั้น บัญชีใหม่เริ่มด้วยรายการว่าง ออกจากระบบแล้วจะกลับมาที่งานผู้เยี่ยมชม
- บัญชีตัวอย่าง: `student@example.com` / `password123`
- รหัสกู้คืนเริ่มต้นของบัญชีตัวอย่าง: `STUDENT-DEMO-RECOVERY` เปลี่ยนเป็นรหัสใหม่หลัง reset สำเร็จ
- สมัครบัญชีใหม่แล้วจด **รหัสกู้คืน** ที่แสดงไว้ ใช้ร่วมกับอีเมลเมื่อลืมรหัสผ่าน หลังเปลี่ยนรหัสผ่าน ระบบจะออกรหัสกู้คืนใหม่และยกเลิกรหัสเดิม
- บัญชีเดิมที่เก็บรหัสผ่านเป็นข้อความจะถูกย้ายเป็น hash เมื่อเข้าสู่ระบบสำเร็จครั้งแรก พร้อมแสดงรหัสกู้คืนให้เก็บไว้
- ไม่เลือก “จดจำการเข้าสู่ระบบ”: เก็บ session ในแท็บนั้น เลือก: เก็บต่อเมื่อเปิดเบราว์เซอร์ใหม่
- ฟอนต์ Sarabun, Prompt, Kanit และ Chakra Petch อยู่ในโปรเจกต์ ไม่ต้องโหลดจาก Google Fonts ขณะเปิดเว็บ
- การค้นหาและตัวกรองทำงานร่วมกัน จำนวนงานบนสุดเป็นจำนวนทั้งหมดของบัญชี ปุ่มล้างงานที่เสร็จแล้วล้างทุกงานที่เสร็จในบัญชี แม้มีตัวกรองอยู่

## ขอบเขตระบบสมาชิก

นี่คือ **frontend demo สำหรับ Lab** ไม่มี backend และไม่มีบริการส่งอีเมล บัญชี งาน และธีมอยู่ในเบราว์เซอร์/เครื่องนั้น ไม่ sync ข้ามอุปกรณ์ การแยกบัญชีบนหน้าเว็บไม่ใช่การควบคุมสิทธิ์บน server ผู้ที่เข้าถึง storage ของเบราว์เซอร์สามารถแก้ข้อมูลได้ จึงไม่ควรใช้รหัสผ่านหรือข้อมูลจริงกับงานตัวอย่างนี้

รหัสผ่านของบัญชีใหม่เก็บเป็น salted PBKDF2 hash; รหัสกู้คืนก็เก็บเป็น hash ส่วน session มีเพียงชื่อและอีเมล หากล้างข้อมูลเบราว์เซอร์ บัญชีและงานที่เก็บในเครื่องจะหาย

## คำสั่งตรวจงาน

```bash
npm test           # Unit และ component/integration tests แบบรันครั้งเดียว
npm run test:watch # รันใหม่เมื่อแก้ไฟล์
npm run build     # ตรวจ production build
npm run preview   # เปิด build เพื่อทดสอบ
```

## ก่อนส่งงาน

1. อ่าน [ผลทดสอบอัตโนมัติ](docs/TEST-RESULTS.md)
2. ทำ [Manual Test Checklist](docs/MANUAL-TEST.md) และบันทึกผลจริง พร้อมภาพตามที่อาจารย์ต้องการ
3. ให้เพื่อนอย่างน้อย 1 คนตรวจโค้ดและบันทึกผู้ตรวจ
4. เปิด Pull Requests ของ repository ตรวจว่า base เป็น `dev` และ head เป็น `feature4.1`; เมื่อทดสอบผ่านแล้ว เปลี่ยน Draft PR เป็น Ready for review และ merge เข้า `dev` โดยเก็บ Feature Branches ไว้เป็นหลักฐาน
5. อัปเดต Trello ตามผลจริง แล้วส่งลิงก์ repository ใน Discord ด้วยตัวเอง

อย่าย้ายการ์ดเป็น Done หรือบันทึกว่า Manual Test/Peer Review ผ่าน เพียงเพราะ Unit Test ผ่าน
