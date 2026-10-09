# นำโปรเจกต์ที่แก้แล้วขึ้น GitHub เดิม

ยังไม่ได้ push หรือสร้าง PR เพราะ GitHub integration ปฏิเสธการเขียนด้วย 403 งานทั้งหมดอยู่ใน ZIP และ Git Bundle ไม่ได้แก้ `main` ของทีมบน GitHub

## วิธีที่ 1: เปิดเว็บทดสอบก่อน

1. แตก ZIP
2. เปิดโฟลเดอร์ `todolist-source` ด้วย VS Code
3. เปิด Terminal แล้วพิมพ์:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

เปิด URL ใน Terminal เช่น `http://localhost:5173/` โฟลเดอร์นี้มี source code และเอกสาร แต่ไม่มีประวัติ Git ถ้าต้องการ branch พร้อมประวัติ ให้ใช้วิธีที่ 2

## วิธีที่ 2: นำ Git Bundle มาใช้เพื่อเก็บ Branch/Commit ครบ

เปิด Terminal ในโฟลเดอร์ที่แตก ZIP ซึ่งมีไฟล์ `todolist-lab5-3.bundle` แล้วรัน:

```powershell
git clone --branch feature4.1 ./todolist-lab5-3.bundle todolist-with-git
cd todolist-with-git
git branch dev origin/dev
git branch feature1.1 origin/feature1.1
git branch feature2.1 origin/feature2.1
git branch feature3.1 origin/feature3.1
git branch main origin/main
git remote set-url origin https://github.com/mamoikungTh/todolist.git
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

ใช้โฟลเดอร์ใหม่ `todolist-with-git` เพื่อไม่เขียนทับโฟลเดอร์งานเดิม หากชื่อนี้มีอยู่แล้วให้เลือกชื่อใหม่ก่อน clone

Git Bundle มีโค้ดทุกเวอร์ชันตั้งแต่ฐานเดิมจนถึงงานที่แก้แล้ว ไม่มี `node_modules`; ติดตั้งด้วย `npm.cmd ci` จะได้รุ่นตาม package-lock.json

## ส่ง branch ขึ้น GitHub

หลังตรวจโค้ด เปิด Terminal อีกอันใน `todolist-with-git` หรือกด Ctrl+C เพื่อหยุด dev server แล้วรัน:

```powershell
git status
git branch
git push -u origin dev feature1.1 feature2.1 feature3.1 feature4.1
```

Git อาจเปิดหน้าต่างให้เข้าสู่บัญชี GitHub ให้ใช้บัญชีที่มีสิทธิ์เขียน repository นี้ คำสั่งนี้ไม่ push `main` และไม่ force push ถ้า Git ปฏิเสธเพราะ branch บน GitHub มีงานใหม่ ให้ตรวจ/รวมงานใหม่ก่อน อย่าใช้ `--force`

## เปิด PR และทำให้ครบ Lab

1. หลัง push สำเร็จ เปิด https://github.com/mamoikungTh/todolist/compare/dev...feature4.1
2. ตรวจว่า base คือ `dev` และ compare คือ `feature4.1`
3. สร้าง **Draft PR** ชื่อ `Complete Lab 5-3 Todo List for four students`
4. ใส่สรุป: ครบ Todo, สมาชิกจำลอง, Theme และ Search/Filter; Unit Tests 46 กรณี; Build ผ่าน; Manual Test และ Peer Review รอผู้เรียน
5. ผู้เรียนทำ `docs/MANUAL-TEST.md` บน commit ล่าสุดและให้เพื่อนตรวจ
6. เมื่อผ่านจึงเปลี่ยน PR เป็น Ready และ merge เข้า `dev` เก็บ Feature Branches ไว้ตามโจทย์
7. อัปเดต Trello และส่ง https://github.com/mamoikungTh/todolist ใน Discord ด้วยตัวเอง

Branch รอบนี้พัฒนาต่อกันเป็นลำดับโดย Codex ไม่ใช่หลักฐานว่าสมาชิก 4 คนทำงานพร้อมกัน ทีมควรอ่านและอธิบายโค้ดส่วนของตนได้
