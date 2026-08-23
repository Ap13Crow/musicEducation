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
function toMinutes(t:string){const [h,m]=t.split(':').map(Number);return h*60+m;}
// Every valid endTime for a given block - at least 60 minutes after start,
// not just after it, since the booking page slices each block into
// one-hour lessons: a shorter block (e.g. 11:30-12:00) would publish
// successfully but produce zero actual bookable slots, silently confusing
// both the teacher and any student who finds the day blank. Filters TIMES
// down for the "Ends" select so that state can't be chosen in the first
// place (Copilot review finding on PR #54).
function endTimeOptions(start:string){return TIMES.filter(t=>toMinutes(t)>=toMinutes(start)+60);}

const UNAVAILABILITY_LABELS:{value:string;label:string}[]=[
 {value:'UNAVAILABLE',label:'Unavailable'},
 {value:'PRIVATE_APPOINTMENT',label:'Private appointment'},
 {value:'HOLIDAY',label:'Holiday'},
 {value:'VACATION',label:'Vacation'},
 {value:'OTHER_UNAVAILABLE',label:'Other'},
];
const NINETY_DAYS_MS=90*24*60*60*1000;
const GET_UNAVAILABILITY=gql`query TeacherUnavailabilityBlocks($teacherProfileId:ID!,$from:DateTime!,$to:DateTime!){teacherUnavailability(teacherProfileId:$teacherProfileId,from:$from,to:$to){id startsAt endsAt label note}}`;
const CREATE_UNAVAILABILITY=gql`mutation CreateUnavailabilityBlock($startsAt:DateTime!,$endsAt:DateTime!,$label:UnavailabilityLabel!,$note:String){createUnavailability(startsAt:$startsAt,endsAt:$endsAt,label:$label,note:$note){id}}`;
const DELETE_UNAVAILABILITY=gql`mutation DeleteUnavailabilityBlock($id:ID!){deleteUnavailability(id:$id)}`;

function UnavailabilitySection({teacherProfileId}:{teacherProfileId:string}){
 const from=new Date().toISOString();const to=new Date(Date.now()+NINETY_DAYS_MS).toISOString();
 const {data,loading,refetch}=useQuery(GET_UNAVAILABILITY,{variables:{teacherProfileId,from,to},fetchPolicy:'cache-and-network'});
 const [create,{loading:creating,error}]=useMutation(CREATE_UNAVAILABILITY);
 const [remove]=useMutation(DELETE_UNAVAILABILITY);
 const [draft,setDraft]=useState({date:'',startTime:'09:00',endTime:'17:00',label:'UNAVAILABLE',note:''});
 const blocks=data?.teacherUnavailability??[];
 async function addBlock(e:React.FormEvent){
  e.preventDefault();if(!draft.date)return;
  const startsAt=new Date(`${draft.date}T${draft.startTime}:00`).toISOString();
  const endsAt=new Date(`${draft.date}T${draft.endTime}:00`).toISOString();
  await create({variables:{startsAt,endsAt,label:draft.label,note:draft.note.trim()||null}});
  setDraft({...draft,note:''});await refetch();
 }
 async function removeBlock(id:string){await remove({variables:{id}});await refetch();}
 return <section className="card mt-8 p-6">
  <h2 className="text-xl font-semibold">Unavailability</h2>
  <p className="mt-2 text-sm text-gray-600">Block hours or full days you&rsquo;re not available - this immediately removes those times from bookable discovery. Students only ever see the label you choose below, never your private note.</p>
  {loading?<p className="mt-4 text-sm text-gray-500">Loading…</p>:<div className="mt-4 space-y-2">
   {blocks.length===0&&<p className="text-sm text-gray-500">No blocks in the next 90 days.</p>}
   {blocks.map((b:any)=><div key={b.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
    <span>{new Date(b.startsAt).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})} – {new Date(b.endsAt).toLocaleString(undefined,{timeStyle:'short'})} · {UNAVAILABILITY_LABELS.find(l=>l.value===b.label)?.label??b.label}{b.note?` · ${b.note}`:''}</span>
    <button className="text-red-600" onClick={()=>void removeBlock(b.id)}>Remove</button>
   </div>)}
  </div>}
  <form onSubmit={addBlock} className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-5">
   <label className="text-sm font-medium sm:col-span-1">Date<input type="date" required className="input mt-1 w-full" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label>
   <label className="text-sm font-medium">From<input type="time" className="input mt-1 w-full" value={draft.startTime} onChange={e=>setDraft({...draft,startTime:e.target.value})}/></label>
   <label className="text-sm font-medium">To<input type="time" className="input mt-1 w-full" value={draft.endTime} onChange={e=>setDraft({...draft,endTime:e.target.value})}/></label>
   <label className="text-sm font-medium">Label<select className="input mt-1 w-full" value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})}>{UNAVAILABILITY_LABELS.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}</select></label>
   <label className="text-sm font-medium">Private note (optional)<input className="input mt-1 w-full" value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})} placeholder="Only you and admins see this"/></label>
   <div className="sm:col-span-5">{error&&<p className="mb-2 text-sm text-red-600">{error.message}</p>}<button disabled={creating} className="btn-secondary rounded-lg px-4 py-2 text-sm">{creating?'Adding…':'Add block'}</button></div>
  </form>
 </section>;
}

export default function TeacherAvailabilityPage(){
 const {data,loading,refetch}=useQuery(GET);const [slots,setSlots]=useState<Slot[]|null>(null);
 const [provision,{loading:provisioning}]=useMutation(PROVISION);const [save,{loading:saving,error}]=useMutation(SAVE);
 const current=slots??(data?.me?.teacherProfile?.availability??[]).map((s:any)=>({dayOfWeek:s.dayOfWeek,startTime:s.startTime,endTime:s.endTime,timezone:'Europe/Zurich'}));
 async function ensureProfile(){await provision();await refetch();}
 function add(){setSlots([...current,{dayOfWeek:1,startTime:'09:00',endTime:'10:00',timezone:'Europe/Zurich'}]);}
 // dayOfWeek/startTime/endTime are each independently editable now - a
 // block no longer has to be exactly one hour (Copilot/user feedback: "not
 // add every hour individually... create availability areas for... several
 // hours"). Changing startTime so the block drops below 60 minutes (not
 // just below zero) pushes endTime out to exactly one hour after the new
 // start - matching endTimeOptions()'s own +60min floor, so a shorter,
 // unbookable block (e.g. 11:30-12:00) never lands on screen even
 // transiently (Copilot review finding on PR #54: the previous
 // start>=end-only check let that slip through).
 function change(i:number,key:'dayOfWeek'|'startTime'|'endTime',value:string|number){
  setSlots(current.map((slot:Slot,n:number)=>{
   if(n!==i)return slot;
   const updated={...slot,[key]:value};
   if(key==='startTime'&&toMinutes(String(value))+60>toMinutes(slot.endTime)){updated.endTime=oneHourAfter(String(value));}
   return updated;
  }));
 }
 async function persist(){await save({variables:{slots:current.map((slot:Slot)=>({dayOfWeek:slot.dayOfWeek,startTime:slot.startTime,endTime:slot.endTime,timezone:slot.timezone}))}});setSlots(null);await refetch();}
 return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl="/dashboard/teacher/availability"><main className="mx-auto max-w-4xl px-6 py-10">
  <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link><h1 className="mt-4 font-serif text-3xl font-bold">Lesson availability</h1>
  <p className="mt-2 text-sm text-gray-600">Publish the blocks of time students may book from, week after week - a block can span several hours (e.g. 9:00–13:00), not just one. Each is sliced into one-hour bookable lessons automatically. Start/end times use clear 15-minute increments.</p>
  {loading?<p className="mt-8">Loading…</p>:!data?.me?.teacherProfile?<button className="btn-primary mt-8 rounded-lg px-4 py-2" disabled={provisioning} onClick={()=>void ensureProfile()}>{provisioning?'Preparing…':'Initialize teacher workspace'}</button>:<>
   <div className="mt-8 space-y-3">{current.map((slot:Slot,index:number)=><div key={index} className="card grid items-end gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
    <label className="text-sm font-medium">Day<select className="input mt-1 w-full" value={slot.dayOfWeek} onChange={e=>change(index,'dayOfWeek',Number(e.target.value))}>{DAYS.map((day,n)=><option key={day} value={n}>{day}</option>)}</select></label>
    <label className="text-sm font-medium">Starts<select className="input mt-1 w-full" value={slot.startTime} onChange={e=>change(index,'startTime',e.target.value)}>{TIMES.map(time=><option key={time}>{time}</option>)}</select></label>
    <label className="text-sm font-medium">Ends<select className="input mt-1 w-full" value={slot.endTime} onChange={e=>change(index,'endTime',e.target.value)}>{endTimeOptions(slot.startTime).map(time=><option key={time}>{time}</option>)}</select></label>
    <button className="pb-2 text-sm text-red-600" onClick={()=>setSlots(current.filter((_:Slot,n:number)=>n!==index))}>Remove</button>
   </div>)}{current.length===0&&<p className="rounded-xl border border-dashed p-6 text-sm text-gray-500">No bookable lessons yet.</p>}</div>
   {error&&<p className="mt-4 text-sm text-red-600">{error.message}</p>}<div className="mt-5 flex gap-3"><button className="btn-secondary rounded-lg px-4 py-2" onClick={add}>Add availability block</button><button className="btn-primary rounded-lg px-4 py-2" disabled={saving} onClick={()=>void persist()}>{saving?'Saving…':'Publish availability'}</button></div>
   <UnavailabilitySection teacherProfileId={data.me.teacherProfile.id}/>
  </>}
 </main></RoleGate>;
}
