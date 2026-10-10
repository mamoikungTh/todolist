# Week 7 — Agile Metrics & Backlog Refinement

ชุด Lab 7-1 ถึง 7-4 ตาม `Week7_Agile_Metrics_Backlog_Refinement_Thai.pptx (1).pdf` หน้า 19–30 ต่อจาก Backlog ของ Todo List และ Study Planner ใน Week 6

## เปิดงาน

| Lab | สิ่งที่เตรียมให้ | เอกสาร |
|---|---|---|
| 7-1 | ข้อมูล 12 Backlog Items, แหล่งที่มา และช่องกรอกข้อมูลจริง | [LAB7-1.md](LAB7-1.md) |
| 7-2 | สูตร Velocity, กราฟ และบทวิเคราะห์ 10 บรรทัด | [LAB7-2.md](LAB7-2.md) |
| 7-3 | Lead/Cycle/Wait ของ 12 รายการ, ค่าเฉลี่ย, Bottleneck และข้อปรับปรุง | [LAB7-3.md](LAB7-3.md) |
| 7-4 | เลือก Story เดิม 5 เรื่อง, Before/After, แตก Story 2 เรื่อง, AC, Given/When/Then และ DoR | [LAB7-4.md](LAB7-4.md) |
| รวม | บทวิดีโอทีม 4 คน 5–8 นาที และข้อความส่ง Discord | [SUBMISSION.md](SUBMISSION.md) |

**[ดาวน์โหลดไฟล์ Excel คำนวณ Metrics](outputs/week7/Agile-Metrics.xlsx)** — บน GitHub ให้เลือก Download raw file

## สถานะข้อมูล

ยังไม่มีวันที่ Request/Start/Done จริงของทีม และยังไม่มีผล Manual Test/Peer Review ที่ยืนยัน DoD ในชุดงานก่อนหน้า จึง **ยังคำนวณ Velocity และ Lead/Cycle จริงของกลุ่มไม่ได้** การมีโค้ดและ tests ผ่านไม่ได้บอกว่านักศึกษาเริ่มทำหรือส่งมอบวันใด

ชุดนี้มีตัวอย่างคำนวณครบ โดยใช้คะแนน/วัน Done จำลองจาก Week 6 และเพิ่ม Request/Start สมมติอย่างเปิดเผย ส่วนไฟล์ `Actual` เว้นวัน คะแนน ผู้รับผิดชอบและหลักฐานไว้ให้กรอกจริง ไม่เปลี่ยนข้อมูลที่ไม่ทราบเป็นศูนย์ ถ้าอาจารย์ต้องการข้อมูลจริง ต้องเติมหลักฐานก่อนส่ง ตัวเลขตัวอย่างไม่ใช่ผลการทำงานจริงของทีม

## ใช้ Excel อย่างไร

1. `Summary` แสดงผลตัวอย่างด้านบนและผลจริงด้านล่าง มีกราฟ Velocity ที่แก้ไขได้
2. `Example` มี 12 รายการจำลอง; D0–D5 เป็นเลขวันของแต่ละ Sprint ไม่ใช่วันที่จริง สอง Sprint ใช้แกนวันคนละชุด
3. `Actual` กรอกช่องสีเหลือง: Points, Status ณ วันจบ Sprint, Request, Start, Done, Sprint end, Owner, Blocker และ Evidence ใช้วันที่จริงชนิด Date ของ Excel ไม่พิมพ์ข้อความ D1 ในชีตนี้
4. `Status` เลือก Unknown / Done / Not Done โดย Done ต้องมีหลักฐานว่าผ่าน DoD ถ้า Story เสร็จหลัง Sprint end ให้เป็น Not Done สำหรับ Sprint นั้น
5. คอลัมน์ M–P เป็นสูตร Velocity SP / Lead / Cycle / Wait ไม่ต้องกรอกเอง ข้อมูลที่ไม่ครบหรือวันที่ย้อนลำดับแสดง `n.a.`
6. สูตรสรุป Velocity จะรอข้อมูลสถานะ/คะแนน/หลักฐานครบทุก Story ใน Sprint; ค่าเฉลี่ยเวลาจะรอวันที่ครบในทุก Story ที่ Done แสดงจำนวนแถวที่คำนวณได้ใน Flow items

ชีตใช้หัวตารางภาษาอังกฤษเพื่อให้อ่านสูตรได้ตรงกัน: Request = วันรับงาน, Start = วันเริ่มทำ, Done = วันผ่าน DoD, Sprint end = วันสิ้นสุด Sprint, Evidence = ลิงก์หรือเลขอ้างอิงหลักฐาน ตารางเตรียมไว้ 12 รายการ หากเพิ่มแถว ต้องขยายสูตรและช่วง Summary พร้อมกัน หรือใช้ CSV และตารางในเอกสารเป็นฐาน

## ไฟล์ประกอบ

- [ข้อมูลจำลอง CSV](data/metrics-simulated.csv) / [JSON](data/metrics-simulated.json)
- [แบบกรอกข้อมูลจริง CSV](data/metrics-actual-template.csv)
- [กราฟ Velocity](assets/velocity.png) / [กราฟ Wait + Cycle](assets/flow-times.png)
- [Refined Backlog CSV](data/refined-backlog.csv)
- [ผลตรวจสูตรและข้อจำกัด](VALIDATION.md)

ไม่มีการเปลี่ยนฟีเจอร์ของ Todo List หรือ Study Planner ใน Week 7 รอบนี้ เพราะโจทย์เป็นการวิเคราะห์และเตรียม Backlog ไม่ได้สั่งให้ทำทุกฟีเจอร์ต่อยอดทันที

branch `lab7` ต่อจาก `lab6` เพื่อเก็บชุดงานครบ Draft PR ใช้ `lab6` เป็นฐาน เมื่องานก่อนหน้ารวมเข้า `dev` แล้ว ให้เปลี่ยนฐาน PR Week 7 เป็น `dev` และให้ทีมตรวจเอกสารก่อน merge
