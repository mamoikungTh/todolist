import { describe, it, expect } from 'vitest'
import { emptyState, validDate, saveSubject, saveSession, deleteSubject, deleteSession, toggleSession, visibleSessions, summary, loadState, persistState, STORAGE_KEY } from '../public/study-planner/model.js'

const subject = (state = emptyState(), name = 'Testing', id = 's1') => saveSubject(state, { name, examDate: '2026-10-20' }, id)
const session = (state = subject(), extra = {}, id = 'r1') => saveSession(state, { subjectId: 's1', topic: 'BVA', date: '2026-10-15', minutes: 30, ...extra }, id)
describe('Study Planner rules', () => {
  it('accepts leap dates and rejects impossible days', () => {
    expect(validDate('2024-02-29')).toBe(true)
    for (const date of ['2026-02-29','2026-04-31','2026-13-01','2026-1-01','',null]) expect(validDate(date)).toBe(false)
  })
  it('trims subject and rejects blank names', () => {
    expect(subject(emptyState(), ' Testing ').subjects[0].name).toBe('Testing')
    expect(() => subject(emptyState(), '   ')).toThrow()
  })
  it('rejects duplicate subjects without case sensitivity', () => {
    expect(() => subject(subject(), 'testing', 's2')).toThrow('มีชื่อวิชานี้แล้ว')
  })
  it('can rename a subject and move its exam after existing sessions', () => {
    const updated = saveSubject(session(), { name: 'QA', examDate: '2026-10-25' }, 's1')
    expect(updated.subjects).toHaveLength(1)
    expect(updated.subjects[0].name).toBe('QA')
    expect(updated.sessions).toHaveLength(1)
  })
  it('prevents exam from moving before an existing session', () => {
    expect(() => saveSubject(session(), { name: 'QA', examDate: '2026-10-14' }, 's1')).toThrow('วันสอบใหม่')
  })
  it('prevents accidental cascading deletion of subjects', () => {
    expect(() => deleteSubject(session(), 's1')).toThrow('ลบรอบอ่าน')
    expect(deleteSubject(deleteSession(session(), 'r1'), 's1').subjects).toHaveLength(0)
  })
  it('accepts the exam day but rejects a session after the exam', () => {
    expect(session(subject(), { date: '2026-10-20' }).sessions).toHaveLength(1)
    expect(() => session(subject(), { date: '2026-10-21' })).toThrow('ไม่เกินวันสอบ')
  })
  it('rejects unknown subject and whitespace topic', () => {
    expect(() => session(subject(), { subjectId: 'unknown' })).toThrow('เลือกวิชา')
    expect(() => session(subject(), { topic: '  ' })).toThrow('หัวข้ออ่าน')
  })
  it('enforces duration limits including fractional values', () => {
    for (const minutes of [5,480]) expect(session(subject(), {minutes}).sessions[0].minutes).toBe(minutes)
    for (const minutes of [0,4,481,30.5,'abc','']) expect(() => session(subject(), {minutes})).toThrow('จำนวนเต็ม')
  })
  it('edits a session while preserving its completion status', () => {
    const changed = session(toggleSession(session(), 'r1'), {topic:'Branch coverage',minutes:45})
    expect(changed.sessions).toHaveLength(1)
    expect(changed.sessions[0]).toMatchObject({topic:'Branch coverage',done:true,minutes:45})
  })
  it('toggles both ways without mutating the original state', () => {
    const original = session()
    expect(toggleSession(original, 'r1').sessions[0].done).toBe(true)
    expect(original.sessions[0].done).toBe(false)
    expect(toggleSession(toggleSession(original, 'r1'), 'r1').sessions[0].done).toBe(false)
  })
  it('combines subject, status, and case-insensitive search then sorts dates', () => {
    let data = session(subject(subject(), 'Agile', 's2'))
    data = session(data, {subjectId:'s2',topic:'Sprint',date:'2026-10-12'}, 'r2')
    data = session(data, {topic:'Test planning',date:'2026-10-13'}, 'r3')
    data = toggleSession(data,'r1')
    expect(visibleSessions(data).map(x=>x.id)).toEqual(['r2','r3','r1'])
    expect(visibleSessions(data,{subjectId:'s1',status:'done',search:' bVa '}).map(x=>x.id)).toEqual(['r1'])
    expect(visibleSessions(data,{subjectId:'s2',search:'Testing'})).toEqual([])
    expect(visibleSessions(data,{status:'pending',search:'testing'}).map(x=>x.id)).toEqual(['r3'])
  })
  it('summarizes full data independently of filters and subtracts deleted items', () => {
    const data = toggleSession(session(session(), {minutes:45},'r2'),'r1')
    expect(summary(data)).toEqual({total:2,done:1,planned:75,completed:30})
    expect(summary(deleteSession(data,'r1'))).toEqual({total:1,done:0,planned:45,completed:0})
  })
  it('loads an empty first visit and roundtrips data', () => {
    const map = new Map()
    const storage = { getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v) }
    expect(loadState(storage).state).toEqual(emptyState())
    const data = toggleSession(session(),'r1')
    expect(persistState(storage,data)).toBe('')
    expect(loadState(storage)).toEqual({state:data,error:''})
    expect(map.has(STORAGE_KEY)).toBe(true)
  })
  it('preserves malformed raw storage instead of writing on load', () => {
    let writes = 0
    const storage = { getItem:()=>'{broken',setItem:()=>writes++ }
    expect(loadState(storage).error).toBeTruthy()
    expect(writes).toBe(0)
  })
  it('rejects unsupported schemas, duplicate IDs and orphan sessions', () => {
    const good = session()
    const samples = [null,{version:2,subjects:[],sessions:[]},{...good,subjects:[...good.subjects,...good.subjects]}, {...good,sessions:[{...good.sessions[0],subjectId:'unknown'}]}, {...good,sessions:[{...good.sessions[0],done:'true'}]}]
    for (const data of samples) expect(loadState({getItem:()=>JSON.stringify(data)}).error).toBeTruthy()
  })
  it('survives storage denial and reports failed writes', () => {
    const blocked = {getItem:()=>{throw new Error('blocked')},setItem:()=>{throw new Error('quota')}}
    expect(loadState(blocked).error).toBeTruthy()
    expect(persistState(blocked,session())).toContain('บันทึกใน browser ไม่สำเร็จ')
  })
})
