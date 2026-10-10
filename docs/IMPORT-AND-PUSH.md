# ดาวน์โหลดและทำงานต่อจาก GitHub

ส่งโค้ดขึ้น repository เดิมเรียบร้อยแล้ว: https://github.com/mamoikungTh/todolist

- ชุดรวมล่าสุด: `feature4.1`
- Branch รายส่วน: `feature1.1`, `feature2.1`, `feature3.1`, `feature4.1`
- `dev` รอการรวมงานหลังผ่าน Manual Test และ Peer Review
- `main` ยังอยู่ที่โค้ดเดิมของทีม

## เปิดโปรเจกต์ล่าสุด

เปิด Terminal ในโฟลเดอร์ที่ใช้เก็บงาน แล้วรัน:

```powershell
git clone --branch feature4.1 https://github.com/mamoikungTh/todolist.git todolist-lab5-3
cd todolist-lab5-3
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

เลือกชื่อโฟลเดอร์ใหม่ถ้า `todolist-lab5-3` มีอยู่แล้ว ไม่เขียนทับโฟลเดอร์งานเดิม เปิด URL ที่ Terminal แสดง เช่น `http://localhost:5173/`

Windows PowerShell ใช้ `npm.cmd` เพื่อหลีกเลี่ยงปัญหา npm.ps1 ถูกบล็อก macOS/Linux ใช้ `npm` ตามปกติ

## หากมี repository ที่ clone จาก GitHub อยู่แล้ว

```powershell
git status
git fetch origin
git switch feature4.1
git pull --ff-only
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

บันทึกงานของตนเองก่อนสลับ branch หาก Git แจ้งว่ามีงานใหม่หรือประวัติแยกกัน ให้ตรวจและรวมงานก่อน อย่าใช้ `--force`

## หากเคยเปิดจาก ZIP / Git Bundle ที่ส่งก่อนหน้า

ZIP นั้นยังมี source และประวัติการทำงานเดิม แต่ commit ID ใน Bundle แตกต่างจาก commit ที่สร้างผ่าน GitHub API ในรอบเผยแพร่นี้ ให้ clone จาก GitHub ตามขั้นตอนแรกสำหรับทำงานร่วมกับทีม ส่วนงานแก้ไขที่ทำเพิ่มเองใน ZIP ให้เก็บไว้และนำมาเปรียบเทียบก่อนย้าย

## ก่อน merge และส่ง Lab

1. เปิดแท็บ Pull Requests ของ repository และเลือก Draft PR จาก `feature4.1` ไป `dev`
2. ตรวจว่า base คือ `dev` และ head คือ `feature4.1`
3. ทำ `docs/MANUAL-TEST.md` บน commit ล่าสุด และให้เพื่อนตรวจโค้ด
4. เมื่อผ่านจึงเปลี่ยน PR เป็น Ready แล้ว merge เข้า `dev`
5. เก็บ Feature Branches ไว้ตามโจทย์ อัปเดต Trello และส่งลิงก์ GitHub ใน Discord ด้วยตัวเอง

Branch ในรอบนี้พัฒนาต่อกันเป็นลำดับโดย Codex ไม่ใช่หลักฐานว่าสมาชิก 4 คนทำงานพร้อมกัน สมาชิกควรอ่านและอธิบายโค้ดส่วนของตนได้
