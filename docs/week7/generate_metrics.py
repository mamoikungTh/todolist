"""Illustrative metrics aligned with Week 6; never invent measured team dates.
Run with Python + matplotlib. Actual input template is never overwritten.
"""
from pathlib import Path
import csv, json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
for name in ['data', 'assets']:
    (ROOT/name).mkdir(exist_ok=True)
raw = [
    ('Todo','TD-01','Todo CRUD และ Complete',3,'S1',0,0,1,'ไม่มีในตัวอย่าง'),
    ('Todo','TD-02','บันทึกและแยกข้อมูลบัญชี',3,'S1',0,1,3,'สมมติ: รอเชื่อม storage กับบัญชี'),
    ('Todo','TD-03','สมัคร/เข้า/ออกระบบจำลอง',5,'S2',0,1,3,'สมมติ: รอทดสอบร่วมกับ Todo'),
    ('Todo','TD-04','กู้รหัสผ่านและ session',5,'S2',0,2,4,'ไม่มีในตัวอย่าง'),
    ('Todo','TD-05','ธีม/ฟอนต์/ขนาด/รีเซ็ต',3,'S3',1,3,4,'สมมติ: รอเริ่มตามลำดับงาน'),
    ('Todo','TD-06','ค้นหาและกรองสถานะ',3,'S4',0,3,5,'สมมติ: รอข้อมูลทดสอบหลายสถานะ'),
    ('Todo','TD-07','เรียงลำดับและล้างงานจบ',2,'S4',1,4,5,'สมมติ: เริ่มช่วงท้าย Sprint'),
    ('Study','SP-01','วิชาและวันสอบ',3,'S1',0,0,1,'ไม่มีในตัวอย่าง'),
    ('Study','SP-02','CRUD รอบอ่านหนังสือ',5,'S2',0,1,3,'สมมติ: ตรวจวันที่สัมพันธ์กับวิชา'),
    ('Study','SP-03','อ่านจบและสรุปเวลา',2,'S3',0,2,4,'ไม่มีในตัวอย่าง'),
    ('Study','SP-04','ค้นหา/กรอง/เรียงวันที่',2,'S3',1,3,4,'สมมติ: รอเริ่มหลังสรุปข้อมูล'),
    ('Study','SP-05','บันทึกข้อมูลใน browser',3,'S4',0,2,5,'สมมติ: ตรวจ storage เสีย/ถูกบล็อก'),
]
rows = [dict(sprint=s,id=i,item=t,points=p,owner=o,request=r,start=a,done=d,sprint_end=5,status='Done',blocker=b,data_type='SIMULATED',lead=d-r,cycle=d-a,wait=a-r) for s,i,t,p,o,r,a,d,b in raw]
for s in ['Todo','Study']:
    group=[r for r in rows if r['sprint']==s]
    old=list(csv.DictReader((ROOT.parent/'week6/data'/('todo' if s=='Todo' else 'study')).with_name(('todo' if s=='Todo' else 'study')+'-simulation.csv').open(encoding='utf-8-sig')))
    total=sum(r['points'] for r in group)
    assert [total-sum(r['points'] for r in group if r['done']<=d) for d in range(6)] == [int(x['Actual_simulated']) for x in old]
(ROOT/'data/metrics-simulated.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
with (ROOT/'data/metrics-simulated.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
actual=ROOT/'data/metrics-actual-template.csv'
if not actual.exists():
    fields=['sprint','id','item','points','status','request_date','start_date','done_date','sprint_end_date','owner','blocker','evidence','data_type']
    with actual.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
        for r in rows:w.writerow(dict(sprint=r['sprint'],id=r['id'],item=r['item'],status='Unknown',data_type='ACTUAL_INPUT_PENDING'))
summary=[]
for s in ['Todo','Study']:
    group=[r for r in rows if r['sprint']==s]
    summary.append(dict(sprint=s,items=len(group),velocity=sum(r['points'] for r in group),not_done_points=0,lead=sum(r['lead'] for r in group)/len(group),cycle=sum(r['cycle'] for r in group)/len(group),wait=sum(r['wait'] for r in group)/len(group)))
(ROOT/'data/summary-simulated.json').write_text(json.dumps(summary,indent=2))
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11})
def chart(name,title,draw):
    fig,ax=plt.subplots(figsize=(10.2,5.5),facecolor='#f7f8f2');ax.set_facecolor('#f7f8f2')
    draw(ax)
    ax.spines[['top','right']].set_visible(False)
    ax.spines[['bottom','left']].set_color('#bdcbbd')
    ax.grid(axis='y',alpha=.15);ax.set_axisbelow(True)
    fig.suptitle(title,x=.11,ha='left',fontsize=19,weight='bold',color='#173d37')
    fig.text(.11,.89,'SIMULATED EXAMPLE — not measured team performance',color='#946325')
    fig.text(.11,.035,'Source: Week 6 illustrative backlog; request/start days are additional illustrative assumptions.',fontsize=9,color='#566c60')
    fig.subplots_adjust(top=.80,left=.11,right=.96,bottom=.14)
    fig.savefig(ROOT/'assets'/f'{name}.svg');fig.savefig(ROOT/'assets'/f'{name}.png',dpi=135);plt.close(fig)
def velocity(ax):
    bars=ax.bar(['Todo sprint','Study Planner sprint'],[x['velocity'] for x in summary],width=.45,color='#286450')
    ax.set_ylabel('Done story points');ax.set_ylim(0,30)
    ax.bar_label(bars,padding=7,fontsize=16,weight='bold')
chart('velocity','Velocity / different scopes, no speed conclusion',velocity)
def flow(ax):
    labels=[r['id'] for r in rows];pos=list(range(len(rows)))
    ax.bar(pos,[r['wait'] for r in rows],label='Wait before start',color='#c5b385')
    ax.bar(pos,[r['cycle'] for r in rows],bottom=[r['wait'] for r in rows],label='Cycle (includes pauses)',color='#286450')
    ax.set_xticks(pos,labels,rotation=35,ha='right');ax.set_ylabel('Elapsed days (Lead = Wait + Cycle)');ax.set_ylim(0,6.5)
    ax.legend(frameon=False,loc='upper left',ncol=2)
chart('flow-times','Where did the elapsed time go?',flow)
print(json.dumps(summary))
