'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const GET=gql`query PerformanceStudio {myEvents(page:1,limit:50){nodes{id title isPublished startsAt}}}`;
const CREATE_EVENT=gql`mutation NewEvent($input:CreateEventInput!){createEvent(input:$input){id title isPublished}}`;
const PUBLISH_EVENT=gql`mutation PublishEvent($id:ID!){publishEvent(id:$id){id isPublished}}`;

export default function PerformanceStudio(){
 const {data,refetch,error}=useQuery(GET,{errorPolicy:'all'});
 const [createEvent,{loading:eventSaving}]=useMutation(CREATE_EVENT); const [publishEvent]=useMutation(PUBLISH_EVENT);
 const [event,setEvent]=useState({title:'',description:'',type:'WORKSHOP',format:'IN_PERSON',startsAt:'',city:'',price:'0'});
 async function addEvent(e:React.FormEvent){e.preventDefault();
  // event.startsAt is a `datetime-local` value with no timezone of its own —
  // the browser's Date parser reads it as wall-clock time in the browser's
  // own zone, so the timezone we report to the API must be that same zone
  // (not a hardcoded one) or the stored UTC instant and its label disagree.
  const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  await createEvent({variables:{input:{title:event.title,description:event.description,type:event.type,format:event.format,startsAt:new Date(event.startsAt).toISOString(),timezone,city:event.city||undefined,instruments:[],musicStyles:[],skillLevels:[],price:Number(event.price),currency:'CHF'}}});setEvent({...event,title:'',description:'',startsAt:''});await refetch();}
 return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl="/dashboard/teacher/content/performance"><main className="mx-auto max-w-3xl px-6 py-10">
  <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
  <p className="mt-4 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Performance pillar</p>
  <h1 className="mt-3 font-serif text-3xl font-bold">Performance studio</h1><p className="mt-2 text-gray-600">Publish concerts, masterclasses, and workshops directly on mymusic.coach.</p>
  {error&&<p className="mt-4 text-sm text-amber-700">Some studio data is still initializing: {error.message}</p>}
  <section className="card mt-8 p-6"><h2 className="text-xl font-semibold">New event</h2><form onSubmit={addEvent} className="mt-4 space-y-3">
   <input required className="input w-full" placeholder="Event title" value={event.title} onChange={e=>setEvent({...event,title:e.target.value})}/><textarea className="input w-full" placeholder="Description" value={event.description} onChange={e=>setEvent({...event,description:e.target.value})}/>
   <div className="grid grid-cols-2 gap-3"><select className="input" value={event.type} onChange={e=>setEvent({...event,type:e.target.value})}><option>WORKSHOP</option><option>MASTERCLASS</option><option>CONCERT</option><option>COMPETITION</option><option>OPEN_MIC</option><option>LECTURE</option><option>OTHER</option></select><select className="input" value={event.format} onChange={e=>setEvent({...event,format:e.target.value})}><option>IN_PERSON</option><option>ONLINE</option><option>HYBRID</option></select></div>
   <input required type="datetime-local" className="input w-full" value={event.startsAt} onChange={e=>setEvent({...event,startsAt:e.target.value})}/><div className="grid grid-cols-2 gap-3"><input className="input" placeholder="City" value={event.city} onChange={e=>setEvent({...event,city:e.target.value})}/><input type="number" min="0" step="0.01" className="input" value={event.price} onChange={e=>setEvent({...event,price:e.target.value})}/></div><button className="btn-primary rounded-lg px-4 py-2" disabled={eventSaving}>Create draft</button>
  </form><ul className="mt-6 space-y-2">{data?.myEvents?.nodes?.map((v:any)=><li key={v.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{v.title} · {v.isPublished?'Published':'Draft'}</span>{!v.isPublished&&<button className="text-primary-700" onClick={async()=>{await publishEvent({variables:{id:v.id}});await refetch();}}>Publish</button>}</li>)}
  {data?.myEvents?.nodes?.length===0&&<li className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">No events yet — create your first draft above.</li>}</ul></section>
  <div className="mt-6"><Link href="/dashboard/teacher/content" className="text-sm text-primary-700">← Go to Theory studio</Link></div>
 </main></RoleGate>;
}
