'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const GET=gql`query TheoryStudio {myCourses(page:1,limit:50){nodes{id title status}}}`;
const PROVISION=gql`mutation Provision {applyAsTeacher{id}}`;
const CREATE_COURSE=gql`mutation NewCourse($input:CreateCourseInput!){createCourse(input:$input){id title status}}`;
const PUBLISH_COURSE=gql`mutation PublishCourse($id:ID!){publishCourse(id:$id){id status}}`;

export default function TheoryStudio(){
 const {data,refetch,error}=useQuery(GET,{errorPolicy:'all'});
 const [provision]=useMutation(PROVISION); const [createCourse,{loading:courseSaving}]=useMutation(CREATE_COURSE);
 const [publishCourse]=useMutation(PUBLISH_COURSE);
 const [course,setCourse]=useState({title:'',description:'',level:'BEGINNER',instrument:'Piano',price:'0'});
 async function addCourse(e:React.FormEvent){e.preventDefault();await provision();await createCourse({variables:{input:{title:course.title,description:course.description,level:course.level,instruments:[course.instrument],musicStyles:[],price:Number(course.price),currency:'CHF',isFreeTier:Number(course.price)===0,language:'en'}}});setCourse({...course,title:'',description:''});await refetch();}
 return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl="/dashboard/teacher/content"><main className="mx-auto max-w-3xl px-6 py-10">
  <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
  <p className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Learning pillar</p>
  <h1 className="mt-3 font-serif text-3xl font-bold">Theory studio</h1><p className="mt-2 text-gray-600">Author and publish native courses — theory, technique, and practice curricula.</p>
  {error&&<p className="mt-4 text-sm text-amber-700">Some studio data is still initializing: {error.message}</p>}
  <section className="card mt-8 p-6"><h2 className="text-xl font-semibold">New course</h2><form onSubmit={addCourse} className="mt-4 space-y-3">
   <input required className="input w-full" placeholder="Course title" value={course.title} onChange={e=>setCourse({...course,title:e.target.value})}/><textarea className="input w-full" placeholder="Description" value={course.description} onChange={e=>setCourse({...course,description:e.target.value})}/>
   <div className="grid grid-cols-2 gap-3"><select className="input" value={course.level} onChange={e=>setCourse({...course,level:e.target.value})}><option>BEGINNER</option><option>ELEMENTARY</option><option>INTERMEDIATE</option><option>ADVANCED</option><option>PROFESSIONAL</option></select><input className="input" value={course.instrument} onChange={e=>setCourse({...course,instrument:e.target.value})}/></div>
   <input type="number" min="0" step="0.01" className="input w-full" value={course.price} onChange={e=>setCourse({...course,price:e.target.value})}/><button className="btn-primary rounded-lg px-4 py-2" disabled={courseSaving}>Create draft</button>
  </form><ul className="mt-6 space-y-2">{data?.myCourses?.nodes?.map((c:any)=><li key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{c.title} · {c.status}</span><span className="flex items-center gap-3"><Link className="text-primary-700" href={`/dashboard/teacher/courses/${c.id}`}>Edit</Link>{c.status==='DRAFT'&&<button className="text-primary-700" onClick={async()=>{await publishCourse({variables:{id:c.id}});await refetch();}}>Publish</button>}</span></li>)}
  {data?.myCourses?.nodes?.length===0&&<li className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">No courses yet — create your first draft above.</li>}</ul></section>
  <div className="mt-6"><Link href="/dashboard/teacher/content/performance" className="text-sm text-primary-700">Go to Performance studio →</Link></div>
 </main></RoleGate>;
}
