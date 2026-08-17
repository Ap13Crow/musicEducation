'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const GET=gql`query Studio {myCourses(page:1,limit:50){nodes{id title status}} myEvents(page:1,limit:50){nodes{id title isPublished startsAt}}}`;
const PROVISION=gql`mutation Provision {applyAsTeacher{id}}`;
const CREATE_COURSE=gql`mutation NewCourse($input:CreateCourseInput!){createCourse(input:$input){id title status}}`;
const PUBLISH_COURSE=gql`mutation PublishCourse($id:ID!){publishCourse(id:$id){id status}}`;
const CREATE_EVENT=gql`mutation NewEvent($input:CreateEventInput!){createEvent(input:$input){id title isPublished}}`;
const PUBLISH_EVENT=gql`mutation PublishEvent($id:ID!){publishEvent(id:$id){id isPublished}}`;

export default function ContentStudio(){
 const {data,refetch,error}=useQuery(GET,{errorPolicy:'all'});
 const [provision]=useMutation(PROVISION); const [createCourse,{loading:courseSaving}]=useMutation(CREATE_COURSE);
 const [publishCourse]=useMutation(PUBLISH_COURSE); const [createEvent,{loading:eventSaving}]=useMutation(CREATE_EVENT); const [publishEvent]=useMutation(PUBLISH_EVENT);
 const [course,setCourse]=useState({title:'',description:'',level:'BEGINNER',instrument:'Piano',price:'0'});
 const [event,setEvent]=useState({title:'',description:'',type:'WORKSHOP',format:'IN_PERSON',startsAt:'',city:'',price:'0'});
 async function addCourse(e:React.FormEvent){e.preventDefault();await provision();await createCourse({variables:{input:{title:course.title,description:course.description,level:course.level,instruments:[course.instrument],musicStyles:[],price:Number(course.price),currency:'CHF',isFreeTier:Number(course.price)===0,language:'en'}}});setCourse({...course,title:'',description:''});await refetch();}
 async function addEvent(e:React.FormEvent){e.preventDefault();await createEvent({variables:{input:{title:event.title,description:event.description,type:event.type,format:event.format,startsAt:new Date(event.startsAt).toISOString(),timezone:'Europe/Zurich',city:event.city||undefined,instruments:[],musicStyles:[],skillLevels:[],price:Number(event.price),currency:'CHF'}}});setEvent({...event,title:'',description:'',startsAt:''});await refetch();}
 return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl="/dashboard/teacher/content"><main className="mx-auto max-w-6xl px-6 py-10">
  <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link><h1 className="mt-4 font-serif text-3xl font-bold">Pillar studio</h1><p className="mt-2 text-gray-600">Build and publish learning and performance content directly in mymusic.coach.</p>
  {error&&<p className="mt-4 text-sm text-amber-700">Some studio data is still initializing: {error.message}</p>}
  <div className="mt-8 grid gap-8 lg:grid-cols-2">
   <section className="card p-6"><h2 className="text-xl font-semibold">Theory course</h2><form onSubmit={addCourse} className="mt-4 space-y-3">
    <input required className="input w-full" placeholder="Course title" value={course.title} onChange={e=>setCourse({...course,title:e.target.value})}/><textarea className="input w-full" placeholder="Description" value={course.description} onChange={e=>setCourse({...course,description:e.target.value})}/>
    <div className="grid grid-cols-2 gap-3"><select className="input" value={course.level} onChange={e=>setCourse({...course,level:e.target.value})}><option>BEGINNER</option><option>ELEMENTARY</option><option>INTERMEDIATE</option><option>ADVANCED</option><option>PROFESSIONAL</option></select><input className="input" value={course.instrument} onChange={e=>setCourse({...course,instrument:e.target.value})}/></div>
    <input type="number" min="0" step="0.01" className="input w-full" value={course.price} onChange={e=>setCourse({...course,price:e.target.value})}/><button className="btn-primary rounded-lg px-4 py-2" disabled={courseSaving}>Create draft</button>
   </form><ul className="mt-6 space-y-2">{data?.myCourses?.nodes?.map((c:any)=><li key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{c.title} · {c.status}</span>{c.status==='DRAFT'&&<button className="text-primary-700" onClick={async()=>{await publishCourse({variables:{id:c.id}});await refetch();}}>Publish</button>}</li>)}</ul></section>
   <section id="performance" className="card p-6"><h2 className="text-xl font-semibold">Performance event</h2><form onSubmit={addEvent} className="mt-4 space-y-3">
    <input required className="input w-full" placeholder="Event title" value={event.title} onChange={e=>setEvent({...event,title:e.target.value})}/><textarea className="input w-full" placeholder="Description" value={event.description} onChange={e=>setEvent({...event,description:e.target.value})}/>
    <div className="grid grid-cols-2 gap-3"><select className="input" value={event.type} onChange={e=>setEvent({...event,type:e.target.value})}><option>WORKSHOP</option><option>MASTERCLASS</option><option>CONCERT</option><option>COMPETITION</option><option>OPEN_MIC</option><option>LECTURE</option><option>OTHER</option></select><select className="input" value={event.format} onChange={e=>setEvent({...event,format:e.target.value})}><option>IN_PERSON</option><option>ONLINE</option><option>HYBRID</option></select></div>
    <input required type="datetime-local" className="input w-full" value={event.startsAt} onChange={e=>setEvent({...event,startsAt:e.target.value})}/><div className="grid grid-cols-2 gap-3"><input className="input" placeholder="City" value={event.city} onChange={e=>setEvent({...event,city:e.target.value})}/><input type="number" min="0" step="0.01" className="input" value={event.price} onChange={e=>setEvent({...event,price:e.target.value})}/></div><button className="btn-primary rounded-lg px-4 py-2" disabled={eventSaving}>Create draft</button>
   </form><ul className="mt-6 space-y-2">{data?.myEvents?.nodes?.map((v:any)=><li key={v.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{v.title} · {v.isPublished?'Published':'Draft'}</span>{!v.isPublished&&<button className="text-primary-700" onClick={async()=>{await publishEvent({variables:{id:v.id}});await refetch();}}>Publish</button>}</li>)}</ul></section>
  </div></main></RoleGate>;
}
