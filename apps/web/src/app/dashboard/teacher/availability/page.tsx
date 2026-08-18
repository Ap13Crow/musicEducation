'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TIMES=Array.from({length:24*4-4},(_,index)=>{const minutes=6*60+index*15;return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;});
const GET=gql`query TeacherSchedule {me{teacherProfile{id availability{id dayOfWeek startTime endTime}}}}`;
const PROVISION=gql`mutation ProvisionTeacher {applyAsTeacher{id}}`;
const SAVE=gql`mutation SaveTeacherSlots($slots:[AvailabilitySlotInput!]!){setAvailability(slots:$slots){id dayOfWeek startTime endTime}}`;
type Slot={dayOfWeek:number;startTime:string;endTime:string;timezone:string};
function oneHourAfter(start:string){const [h,m]=start.split(':').map(Number);const total=h*60+m+60;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}

export default function TeacherAvailabilityPage(){
 const {data,loading,refetch}=useQuery(GET);const [slots,setSlots]=useState<Slot[]|null>(null);
 const [provision,{loading:provisioning}]=useMutation(PROVISION);const [save,{loading:saving,error}]=useMutation(SAVE);
 const current=slots??(data?.me?.teacherProfile?.availability??[]).map((s:any)=>({dayOfWeek:s.dayOfWeek,startTime:s.startTime,endTime:s.endTime,timezone:'Europe/Zurich'}));
 async function ensureProfile(){await provision();await refetch();}
 function add(){setSlots([...current,{dayOfWeek:1,startTime:'09:00',endTime:'10:00',timezone:'Europe/Zurich'}]);}
 function change(i:number,key:'dayOfWeek'|'startTime',value:string|number){setSlots(current.map((slot:Slot,n:number)=>n===i?{...slot,[key]:value,...(key==='startTime'?{endTime:oneHourAfter(String(value))}:{})}:slot));}
 async function persist(){await save({variables:{slots:current.map((slot:Slot)=>({dayOfWeek:slot.dayOfWeek,startTime:slot.startTime,endTime:oneHourAfter(slot.startTime),timezone:slot.timezone}))}});setSlots(null);await refetch();}
 return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl="/dashboard/teacher/availability"><main className="mx-auto max-w-4xl px-6 py-10">
  <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link><h1 className="mt-4 font-serif text-3xl font-bold">Lesson availability</h1>
  <p className="mt-2 text-sm text-gray-600">Publish the exact recurring one-hour lessons students may request. Start times use clear 15-minute increments.</p>
  {loading?<p className="mt-8">Loading…</p>:!data?.me?.teacherProfile?<button className="btn-primary mt-8 rounded-lg px-4 py-2" disabled={provisioning} onClick={()=>void ensureProfile()}>{provisioning?'Preparing…':'Initialize teacher workspace'}</button>:<>
   <div className="mt-8 space-y-3">{current.map((slot:Slot,index:number)=><div key={index} className="card grid items-end gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
    <label className="text-sm font-medium">Day<select className="input mt-1 w-full" value={slot.dayOfWeek} onChange={e=>change(index,'dayOfWeek',Number(e.target.value))}>{DAYS.map((day,n)=><option key={day} value={n}>{day}</option>)}</select></label>
    <label className="text-sm font-medium">Starts<select className="input mt-1 w-full" value={slot.startTime} onChange={e=>change(index,'startTime',e.target.value)}>{TIMES.map(time=><option key={time}>{time}</option>)}</select></label>
    <div className="rounded-lg bg-gray-50 px-3 py-2"><p className="text-xs text-gray-500">Ends</p><p className="font-medium">{oneHourAfter(slot.startTime)}</p></div>
    <button className="pb-2 text-sm text-red-600" onClick={()=>setSlots(current.filter((_:Slot,n:number)=>n!==index))}>Remove</button>
   </div>)}{current.length===0&&<p className="rounded-xl border border-dashed p-6 text-sm text-gray-500">No bookable lessons yet.</p>}</div>
   {error&&<p className="mt-4 text-sm text-red-600">{error.message}</p>}<div className="mt-5 flex gap-3"><button className="btn-secondary rounded-lg px-4 py-2" onClick={add}>Add one-hour lesson</button><button className="btn-primary rounded-lg px-4 py-2" disabled={saving} onClick={()=>void persist()}>{saving?'Saving…':'Publish availability'}</button></div>
  </>}
 </main></RoleGate>;
}
