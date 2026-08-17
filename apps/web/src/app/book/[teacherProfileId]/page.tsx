'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Video } from 'lucide-react';

const GET=gql`query BookTeacher($id:ID!){teacher(id:$id){id headline teachingBio hourlyRate currency instruments teachingFormats user{email displayName} availability{id dayOfWeek startTime endTime}}}`;
const BOOK=gql`mutation Book($input:BookSessionInput!){bookSession(input:$input){id status startsAt endsAt}}`;

type Slot={iso:string;label:string;day:string};

function availableHours(availability:any[]):Slot[]{
 const slots:Slot[]=[];
 const now=new Date();
 for(let offset=1;offset<=21;offset++){
  const day=new Date(now); day.setDate(now.getDate()+offset); day.setHours(0,0,0,0);
  for(const window of availability.filter((item:any)=>item.dayOfWeek===day.getDay())){
   const [sh,sm]=window.startTime.split(':').map(Number);
   const [eh,em]=window.endTime.split(':').map(Number);
   for(let minute=sh*60+sm;minute+60<=eh*60+em;minute+=60){
    const start=new Date(day); start.setHours(Math.floor(minute/60),minute%60,0,0);
    slots.push({
     iso:start.toISOString(),
     day:start.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'}),
     label:start.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}),
    });
   }
  }
 }
 return slots;
}

export default function BookTeacherPage(){
 const {teacherProfileId}=useParams<{teacherProfileId:string}>(); const router=useRouter();
 const {data:session}=useSession();
 const {data,loading}=useQuery(GET,{variables:{id:teacherProfileId}});
 const [startsAt,setStartsAt]=useState(''); const [format,setFormat]=useState('ONLINE');
 const [book,{loading:saving,error}]=useMutation(BOOK);
 const teacher=data?.teacher;
 const slots=useMemo(()=>availableHours(teacher?.availability??[]),[teacher?.availability]);
 const isOwnProfile=Boolean(session?.user?.email&&session.user.email===teacher?.user?.email);
 async function submit(e:React.FormEvent){e.preventDefault();if(!startsAt)return;await book({variables:{input:{teacherProfileId,startsAt,durationMin:60,format,instrument:teacher?.instruments?.[0]}}});router.push('/profile');}
 return <main className="mx-auto max-w-3xl px-6 py-10"><Link href={`/teachers/${teacherProfileId}`} className="text-sm text-primary-700">← Teacher profile</Link>
  {loading?<p className="mt-8">Loading…</p>:!teacher?<p className="mt-8">Teacher not found.</p>:isOwnProfile?<section className="card mt-8 p-8 text-center"><h1 className="font-serif text-2xl font-bold">This is your teacher profile</h1><p className="mt-2 text-gray-600">You cannot book yourself. Manage your availability from the teacher workspace.</p><Link href="/dashboard/teacher/availability" className="btn-primary mt-5 inline-block rounded-lg px-5 py-2.5">Manage availability</Link></section>:<>
   <h1 className="mt-4 font-serif text-3xl font-bold">Book {teacher.user?.displayName}</h1>
   <p className="mt-2 text-gray-600">{teacher.headline??teacher.teachingBio}</p>
   <form onSubmit={submit} className="mt-8 space-y-6">
    <section className="card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="h-5 w-5"/>Choose an offered one-hour slot</h2>
     {slots.length?<div className="mt-4 space-y-4">{Array.from(new Set(slots.map(slot=>slot.day))).map(day=><div key={day}><p className="mb-2 text-sm font-medium text-gray-700">{day}</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.filter(slot=>slot.day===day).map(slot=><button type="button" key={slot.iso} onClick={()=>setStartsAt(slot.iso)} className={`rounded-lg border px-3 py-2 text-sm ${startsAt===slot.iso?'border-primary-600 bg-primary-50 font-semibold text-primary-700':'border-gray-200 hover:border-primary-300'}`}>{slot.label}</button>)}</div></div>)}</div>:<p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">This teacher has not published any bookable hours yet.</p>}
    </section>
    <section className="card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5"/>Lesson details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
     <div className="rounded-xl border border-gray-200 p-4"><p className="text-xs uppercase text-gray-500">Duration</p><p className="mt-1 font-semibold">60 minutes</p></div>
     <label className="rounded-xl border border-gray-200 p-4 text-sm"><span className="flex items-center gap-2 font-medium">{format==='ONLINE'?<Video className="h-4 w-4"/>:<MapPin className="h-4 w-4"/>}Format</span><select className="input mt-2 w-full" value={format} onChange={e=>setFormat(e.target.value)}><option value="ONLINE">Online</option><option value="IN_PERSON">In person</option><option value="HYBRID">Hybrid</option></select></label>
    </div>
    {teacher.hourlyRate&&<p className="mt-4 text-sm text-gray-600">Price: {teacher.currency} {Number(teacher.hourlyRate).toFixed(2)} for one hour.</p>}
    {error&&<p className="mt-4 text-sm text-red-600">{error.message}</p>}
    <button disabled={saving||!startsAt} className="btn-primary mt-5 rounded-lg px-5 py-2.5 disabled:opacity-50">{saving?'Booking…':'Request this lesson'}</button></section>
   </form>
  </>}
 </main>;
}
