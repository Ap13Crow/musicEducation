'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const GET = gql`query TeacherSchedule { me { teacherProfile { id availability { id dayOfWeek startTime endTime } } } }`;
const PROVISION = gql`mutation ProvisionTeacher { applyAsTeacher { id } }`;
const SAVE = gql`mutation SaveTeacherSlots($slots:[AvailabilitySlotInput!]!){ setAvailability(slots:$slots){ id dayOfWeek startTime endTime } }`;

type Slot={dayOfWeek:number;startTime:string;endTime:string;timezone:string};

export default function TeacherAvailabilityPage(){
  const {data,loading,refetch}=useQuery(GET);
  const [slots,setSlots]=useState<Slot[]|null>(null);
  const [provision,{loading:provisioning}]=useMutation(PROVISION);
  const [save,{loading:saving,error}]=useMutation(SAVE);
  const current=slots ?? (data?.me?.teacherProfile?.availability ?? []).map((s:any)=>({...s,timezone:'Europe/Zurich'}));

  async function ensureProfile(){await provision();await refetch();}
  function add(){setSlots([...current,{dayOfWeek:1,startTime:'09:00',endTime:'12:00',timezone:'Europe/Zurich'}]);}
  function change(i:number,key:keyof Slot,value:string|number){setSlots(current.map((s:Slot,n:number)=>n===i?{...s,[key]:value}:s));}
  async function persist(){await save({variables:{slots:current}});setSlots(null);await refetch();}

  return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl="/dashboard/teacher/availability">
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">Lesson availability</h1>
      <p className="mt-2 text-sm text-gray-600">Publish recurring weekly windows. Bookings are stored natively; calendar sync can be connected later.</p>
      {loading ? <p className="mt-8">Loading…</p> : !data?.me?.teacherProfile ? (
        <button className="btn-primary mt-8 rounded-lg px-4 py-2" disabled={provisioning} onClick={()=>void ensureProfile()}>
          {provisioning?'Preparing…':'Initialize teacher workspace'}
        </button>
      ) : <>
        <div className="mt-8 space-y-3">
          {current.map((s:Slot,i:number)=><div key={i} className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <select className="input" value={s.dayOfWeek} onChange={e=>change(i,'dayOfWeek',Number(e.target.value))}>{DAYS.map((d,n)=><option key={d} value={n}>{d}</option>)}</select>
            <input className="input" type="time" value={s.startTime} onChange={e=>change(i,'startTime',e.target.value)}/>
            <input className="input" type="time" value={s.endTime} onChange={e=>change(i,'endTime',e.target.value)}/>
            <button className="text-sm text-red-600" onClick={()=>setSlots(current.filter((_:Slot,n:number)=>n!==i))}>Remove</button>
          </div>)}
          {current.length===0&&<p className="rounded-xl border border-dashed p-6 text-sm text-gray-500">No bookable windows yet.</p>}
        </div>
        {error&&<p className="mt-4 text-sm text-red-600">{error.message}</p>}
        <div className="mt-5 flex gap-3"><button className="btn-secondary rounded-lg px-4 py-2" onClick={add}>Add window</button><button className="btn-primary rounded-lg px-4 py-2" disabled={saving} onClick={()=>void persist()}>{saving?'Saving…':'Publish availability'}</button></div>
      </>}
    </main>
  </RoleGate>;
}
