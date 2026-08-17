'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';

const GET=gql`query BookTeacher($id:ID!){teacher(id:$id){id headline teachingBio hourlyRate currency instruments user{displayName} availability{id dayOfWeek startTime endTime}}}`;
const BOOK=gql`mutation Book($input:BookSessionInput!){bookSession(input:$input){id status startsAt endsAt}}`;

export default function BookTeacherPage(){
 const {teacherProfileId}=useParams<{teacherProfileId:string}>(); const router=useRouter();
 const {data,loading}=useQuery(GET,{variables:{id:teacherProfileId}});
 const [startsAt,setStartsAt]=useState(''); const [durationMin,setDuration]=useState(60); const [format,setFormat]=useState('ONLINE');
 const [book,{loading:saving,error}]=useMutation(BOOK);
 const teacher=data?.teacher;
 async function submit(e:React.FormEvent){e.preventDefault();await book({variables:{input:{teacherProfileId,startsAt:new Date(startsAt).toISOString(),durationMin,format,instrument:teacher?.instruments?.[0]}}});router.push('/profile');}
 return <main className="mx-auto max-w-2xl px-6 py-10"><Link href="/teachers" className="text-sm text-primary-700">← Teachers</Link>
  {loading?<p className="mt-8">Loading…</p>:!teacher?<p className="mt-8">Teacher not found.</p>:<>
   <h1 className="mt-4 font-serif text-3xl font-bold">Book {teacher.user?.displayName}</h1>
   <p className="mt-2 text-gray-600">{teacher.headline??teacher.teachingBio}</p>
   <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
    <label className="block text-sm font-medium">Start time<input required type="datetime-local" className="input mt-1 w-full" value={startsAt} onChange={e=>setStartsAt(e.target.value)}/></label>
    <label className="block text-sm font-medium">Duration<select className="input mt-1 w-full" value={durationMin} onChange={e=>setDuration(Number(e.target.value))}><option value={30}>30 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option></select></label>
    <label className="block text-sm font-medium">Format<select className="input mt-1 w-full" value={format} onChange={e=>setFormat(e.target.value)}><option value="ONLINE">Online</option><option value="IN_PERSON">In person</option><option value="HYBRID">Hybrid</option></select></label>
    {teacher.hourlyRate&&<p className="text-sm text-gray-600">Indicative rate: {teacher.currency} {Number(teacher.hourlyRate).toFixed(2)}/hour. Payment activation follows separately.</p>}
    {error&&<p className="text-sm text-red-600">{error.message}</p>}
    <button disabled={saving} className="btn-primary rounded-lg px-5 py-2.5">{saving?'Booking…':'Request lesson'}</button>
   </form>
  </>}
 </main>;
}
