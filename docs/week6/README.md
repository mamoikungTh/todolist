# Week 6 — Todo List → Study Planner

ชุดทำ Lab 6-1 ถึง 6-4 ตาม `Agile Management - Nov 2568 (1).pdf` หน้า 153–175 สำหรับทีม 4 คน ใช้ภาษาอธิบายแบบนักศึกษา พร้อมเอกสาร กราฟ ต้นแบบ และแนวทางอัดวิดีโอ

## เปิดอ่านตามลำดับ

| Lab | งานที่เตรียมให้ | ไฟล์ |
|---|---|---|
| 6-1 | Sprint Backlog, กราฟ 5 วัน, วิเคราะห์ 8 บรรทัด, Blocker | [LAB6-1.md](LAB6-1.md) |
| 6-2 | Sprint Goal, สถานะงาน, Demo, ตัวอย่าง Feedback → Backlog, Reflection | [LAB6-2.md](LAB6-2.md) |
| 6-3 | Retro Board 3 ช่อง, Action Items พร้อมผู้รับผิดชอบและเกณฑ์วัด | [LAB6-3.md](LAB6-3.md) |
| 6-4 | Study Planner, Backlog 8 เรื่อง, Sprint Plan, Daily 2 ครั้ง, Review/Retro | [LAB6-4.md](LAB6-4.md) |
| วิดีโอ | แบ่งบทสมาชิก 4 คน ตามเวลาของทุก Lab | [VIDEO-SCRIPTS.md](VIDEO-SCRIPTS.md) |
| บันทึกจริง | สมาชิก, Daily, Feedback, ผลตรวจ และรายการส่ง | [TEAM-EVIDENCE.md](TEAM-EVIDENCE.md) |
| ผลทดสอบ | ผลอัตโนมัติและ Manual Test สำหรับทีม | [VALIDATION.md](VALIDATION.md) |

## ข้อมูลส่วนไหนใช้ได้เลย / ส่วนไหนต้องเติม

**มีผลงานจริง:** โค้ด Todo List, โค้ด Study Planner, unit tests, build, browser automation และภาพหน้าจอจากการรันต้นแบบ ส่วนภาพหน้าจอใช้ข้อมูลสาธิต

**เป็นตัวอย่างเพื่อฝึก:** จำนวน Story Point, Owner S1–S4, ลำดับวัน D0–D5, กราฟ Actual จำลอง, Feedback ตัวอย่าง, บท Daily และข้อสรุปทีมที่ยังไม่ได้ประชุม ไม่ใช่หลักฐานว่านักศึกษาได้ทำกิจกรรมแล้ว

**ยังต้องทำจริง:** ให้สมาชิกตกลงประมาณคะแนน, เก็บสถานะรายวัน, Manual Test, Peer Review, ขอ Feedback จากเพื่อน/อาจารย์อย่างน้อย 3 ข้อ, Daily อย่างน้อย 2 ครั้ง, Retro ที่ทุกคนพูด และอัดวิดีโอ หากอาจารย์ต้องการข้อมูลจริง ห้ามส่งกราฟจำลองแทน

Codex เขียนโค้ดตามลำดับใน branch เดียว ไม่ได้อ้างว่าสมาชิกทั้ง 4 คนพัฒนาเอง ไม่ได้ทำการประชุมหรือส่ง Discord แทนทีม

## เปิดต้นแบบ

```bash
git clone --branch lab6 https://github.com/mamoikungTh/todolist.git todolist-week6
cd todolist-week6
npm ci
npm test
npm run dev
```

เปิด URL จาก Terminal แล้วเติม `/study-planner/` เช่น `http://localhost:5173/study-planner/` ส่วน `/` ยังเป็น Todo List ของ Lab 5-3 หาก PowerShell บล็อก `npm.ps1` ใช้ `npm.cmd` แทน `npm`

ลิงก์ GitHub คือหน้าโค้ด ไม่ใช่เว็บที่เปิดใช้งานได้ทันที ต้องรันโปรเจกต์ตามขั้นตอนข้างบน

## ไฟล์ภาพและข้อมูล

- [กราฟ Todo — ข้อมูลจำลอง](assets/todo-burndown.svg)
- [กราฟ Study Planner — ข้อมูลจำลอง](assets/study-burndown.svg)
- [ภาพ Sprint Backlog — ตัวอย่าง](assets/todo-backlog.png)
- [ภาพ Retro Board — ประเด็นตั้งต้นให้ทีมตรวจ](assets/retro-board.png)
- [ภาพต้นแบบ Desktop](assets/study-planner-desktop.png) / [Mobile](assets/study-planner-mobile.png)
- [แบบบันทึก Burndown จริง Todo](data/todo-actual-template.csv) / [Study Planner](data/study-actual-template.csv)

ดู [TEAM-EVIDENCE.md](TEAM-EVIDENCE.md) ก่อนส่งงาน ทุกช่องที่ยังว่างต้องเก็บจริง ไม่เปลี่ยนเป็น “ผ่าน” โดยอาศัยผลทดสอบของ AI อย่างเดียว

## ใช้ภาพประกอบและตรวจโค้ด

เปิด `docs/week6/boards.html` ใน browser เพื่อดูบอร์ดทั้งสองภาพ และใช้ไฟล์ PNG ใน `assets/` ประกอบวิดีโอได้ ป้ายจำลองบนภาพต้องคงไว้หากยังไม่ได้แทนด้วยข้อมูลจริง

กราฟมีทั้ง SVG และ PNG แก้ชุดข้อมูลจำลองได้ใน `generate_figures.py` แล้วรันด้วย Python ที่ติดตั้ง matplotlib; สคริปต์จะไม่เขียนทับ CSV สำหรับข้อมูลจริงที่มีอยู่ หากใช้ Excel/Google Sheets กับ CSV จริง ให้ทีมยืนยันคะแนนเริ่มต้นและคำนวณ `Ideal = คะแนนเริ่มต้น × (1 − วัน/5)` แล้วใช้ Actual ที่บันทึกจาก Board

branch `lab6` ต่อจาก `feature4.1` จึงมี Todo List เดิมครบ Draft PR ของ Week 6 ใช้ `feature4.1` เป็นฐานเพื่อให้เห็นเฉพาะงานใหม่ หลัง PR #3 ของ Lab 5-3 ผ่านการตรวจและ merge เข้า `dev` แล้ว ให้เปลี่ยนฐาน PR Week 6 เป็น `dev` ก่อนรวมงาน ไม่ต้องลบ branch หลักฐาน
