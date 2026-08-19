'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import RoleGate from '@/components/auth/RoleGate';
import { BookOpen, HelpCircle, Plus, Save, Trash2 } from 'lucide-react';

const GET=gql`query CourseBuilder($id:ID!){storageConfigured course(id:$id){id slug title description shortSummary level price currency isFreeTier language instruments musicStyles thumbnailUrl status sections{id title order lessons{id title description videoUrl contentType durationMin isFreePreview order xpReward feedbackMode quizQuestions{id text type points order options{id text} correctOptionIds} slides{id order fileUrl title}}}}}`;
const UPDATE=gql`mutation UpdateCourseBuilder($id:ID!,$input:UpdateCourseInput!){updateCourse(id:$id,input:$input){id title description shortSummary level price currency thumbnailUrl status}}`;
const ADD_SECTION=gql`mutation AddSection($input:CreateSectionInput!){createSection(input:$input){id}}`;
const DELETE_SECTION=gql`mutation DeleteSection($id:ID!){deleteSection(id:$id)}`;
const ADD_LESSON=gql`mutation AddLesson($input:CreateLessonInput!){createLesson(input:$input){id}}`;
const UPDATE_LESSON=gql`mutation UpdateLesson($id:ID!,$input:UpdateLessonInput!){updateLesson(id:$id,input:$input){id}}`;
const DELETE_LESSON=gql`mutation DeleteLesson($id:ID!){deleteLesson(id:$id)}`;
const PUBLISH=gql`mutation PublishBuilderCourse($id:ID!){publishCourse(id:$id){id status}}`;
const ADD_QUIZ_QUESTION=gql`mutation AddQuizQuestion($input:CreateQuizQuestionInput!){createQuizQuestion(input:$input){id}}`;
const DELETE_QUIZ_QUESTION=gql`mutation DeleteQuizQuestion($id:ID!){deleteQuizQuestion(id:$id)}`;
const GET_ENROLLMENTS=gql`query CourseEnrollmentsForBuilder($courseId:ID!){courseEnrollments(courseId:$courseId,limit:200){nodes{id progress completedAt user{id profile{displayName}}}}}`;
const GET_XP_BOUNDS=gql`query XpAwardBoundsForBuilder{xpAwardBounds{min max}}`;
const AWARD_XP=gql`mutation AwardCourseXp($enrollmentId:ID!,$amount:Int!,$note:String){awardCourseXp(enrollmentId:$enrollmentId,amount:$amount,note:$note){id amount}}`;
const REQUEST_UPLOAD_URL=gql`mutation RequestSlideUploadUrl($purpose:UploadPurpose!,$filename:String!,$contentType:String!){requestUploadUrl(purpose:$purpose,filename:$filename,contentType:$contentType){uploadUrl fileUrl}}`;
const ADD_LESSON_SLIDE=gql`mutation AddLessonSlideFromBuilder($input:AddLessonSlideInput!){addLessonSlide(input:$input){id order fileUrl title}}`;
const DELETE_LESSON_SLIDE=gql`mutation DeleteLessonSlideFromBuilder($id:ID!){deleteLessonSlide(id:$id)}`;
const REORDER_LESSON_SLIDES=gql`mutation ReorderLessonSlidesFromBuilder($lessonId:ID!,$slideIds:[ID!]!){reorderLessonSlides(lessonId:$lessonId,slideIds:$slideIds){id order}}`;

const CONTENT_TYPES=[{value:'VIDEO',label:'Video'},{value:'YOUTUBE',label:'YouTube'},{value:'AUDIO',label:'Audio'},{value:'SLIDES',label:'Slides'}];
const CONTENT_TYPE_LABELS:Record<string,string>={VIDEO:'Video',YOUTUBE:'YouTube',AUDIO:'Audio',SLIDES:'Slides'};
const URL_PLACEHOLDERS:Record<string,string>={VIDEO:'Video file URL (mp4, etc.)',YOUTUBE:'YouTube video URL or ID',AUDIO:'Audio file URL (mp3, etc.)'};
const QUESTION_TYPES=[{value:'SINGLE_CHOICE',label:'Single choice'},{value:'MULTIPLE_CHOICE',label:'Multiple choice'}];
const EMPTY_QUESTION_DRAFT={text:'',type:'SINGLE_CHOICE',points:'1',optionsText:'',correctIndexes:''};

export default function CourseBuilderPage(){
 const {courseId}=useParams<{courseId:string}>();const {data,loading,error,refetch}=useQuery(GET,{variables:{id:courseId}});
 const [update,{loading:saving}]=useMutation(UPDATE);const [addSection]=useMutation(ADD_SECTION);const [deleteSection]=useMutation(DELETE_SECTION);
 const [addLesson]=useMutation(ADD_LESSON);const [updateLesson]=useMutation(UPDATE_LESSON);const [deleteLesson]=useMutation(DELETE_LESSON);const [publish]=useMutation(PUBLISH);
 const [addQuizQuestion]=useMutation(ADD_QUIZ_QUESTION);const [deleteQuizQuestion]=useMutation(DELETE_QUIZ_QUESTION);
 const [requestUploadUrl]=useMutation(REQUEST_UPLOAD_URL);const [addLessonSlide]=useMutation(ADD_LESSON_SLIDE);const [deleteLessonSlide]=useMutation(DELETE_LESSON_SLIDE);const [reorderLessonSlides]=useMutation(REORDER_LESSON_SLIDES);
 const [slidesLessonId,setSlidesLessonId]=useState<string|null>(null);const [uploadingSlide,setUploadingSlide]=useState(false);const [slideUploadError,setSlideUploadError]=useState<string|null>(null);
 const {data:enrollmentData,refetch:refetchEnrollments}=useQuery(GET_ENROLLMENTS,{variables:{courseId},skip:!courseId});
 const {data:boundsData}=useQuery(GET_XP_BOUNDS);
 const [awardXp,{loading:awarding}]=useMutation(AWARD_XP);
 const [xpDraft,setXpDraft]=useState<Record<string,{amount:string;note:string}>>({});
 const [form,setForm]=useState({title:'',description:'',shortSummary:'',level:'BEGINNER',price:'0',currency:'CHF',language:'en',instruments:'',musicStyles:'',thumbnailUrl:''});
 const [sectionTitle,setSectionTitle]=useState('');const [lessonDraft,setLessonDraft]=useState<Record<string,any>>({});const [editing,setEditing]=useState<any>(null);
 const [quizLessonId,setQuizLessonId]=useState<string|null>(null);const [questionDraft,setQuestionDraft]=useState<any>(EMPTY_QUESTION_DRAFT);
 useEffect(()=>{const course=data?.course;if(course)setForm({title:course.title,description:course.description??'',shortSummary:course.shortSummary??'',level:course.level,price:String(course.price),currency:course.currency,language:course.language,instruments:(course.instruments??[]).join(', '),musicStyles:(course.musicStyles??[]).join(', '),thumbnailUrl:course.thumbnailUrl??''});},[data]);
 const course=data?.course;
 async function saveCourse(e:React.FormEvent){e.preventDefault();await update({variables:{id:courseId,input:{title:form.title.trim(),description:form.description.trim()||null,shortSummary:form.shortSummary.trim()||null,level:form.level,price:Number(form.price),currency:form.currency,language:form.language,instruments:form.instruments.split(',').map(v=>v.trim()).filter(Boolean),musicStyles:form.musicStyles.split(',').map(v=>v.trim()).filter(Boolean),thumbnailUrl:form.thumbnailUrl.trim()||null,isFreeTier:Number(form.price)===0}}});await refetch();}
 async function createSection(e:React.FormEvent){e.preventDefault();if(!sectionTitle.trim())return;await addSection({variables:{input:{courseId,title:sectionTitle.trim(),order:course.sections?.length??0}}});setSectionTitle('');await refetch();}
 async function createLesson(sectionId:string){const draft=lessonDraft[sectionId]??{};if(!draft.title?.trim())return;await addLesson({variables:{input:{sectionId,title:draft.title.trim(),description:draft.description?.trim()||null,videoUrl:draft.videoUrl?.trim()||null,contentType:draft.contentType||'VIDEO',durationMin:Number(draft.durationMin||0),isFreePreview:Boolean(draft.isFreePreview),order:course.sections.find((s:any)=>s.id===sectionId)?.lessons?.length??0,xpReward:10}}});setLessonDraft({...lessonDraft,[sectionId]:{}});await refetch();}
 async function saveLesson(){await updateLesson({variables:{id:editing.id,input:{title:editing.title.trim(),description:editing.description?.trim()||null,videoUrl:editing.videoUrl?.trim()||null,contentType:editing.contentType||'VIDEO',durationMin:Number(editing.durationMin||0),isFreePreview:Boolean(editing.isFreePreview)}}});setEditing(null);await refetch();}
 const quizLesson=course?.sections?.flatMap((s:any)=>s.lessons??[]).find((l:any)=>l.id===quizLessonId);
 async function setFeedbackMode(lessonId:string,feedbackMode:string){await updateLesson({variables:{id:lessonId,input:{feedbackMode}}});await refetch();}
 async function addQuestion(){
  const text=questionDraft.text.trim();if(!text)return;
  const options=questionDraft.optionsText.split('\n').map((t:string)=>t.trim()).filter(Boolean);
  if(options.length<2)return alert('Add at least two options, one per line.');
  const correctSet=new Set(questionDraft.correctIndexes.split(',').map((s:string)=>parseInt(s.trim(),10)-1).filter((i:number)=>!isNaN(i)));
  if(correctSet.size===0)return alert('Mark at least one option as correct (e.g. "1" or "1,3").');
  await addQuizQuestion({variables:{input:{lessonId:quizLessonId,text,type:questionDraft.type,points:Number(questionDraft.points||1),options:options.map((t:string,i:number)=>({text:t,isCorrect:correctSet.has(i)}))}}});
  setQuestionDraft(EMPTY_QUESTION_DRAFT);await refetch();
 }
 async function removeQuestion(id:string){await deleteQuizQuestion({variables:{id}});await refetch();}
 const slidesLesson=course?.sections?.flatMap((s:any)=>s.lessons??[]).find((l:any)=>l.id===slidesLessonId);
 async function uploadSlide(file:File){
  if(!slidesLessonId)return; // modal closed (or never opened) - nothing to attach this slide to
  setSlideUploadError(null);setUploadingSlide(true);
  try{
   const {data}=await requestUploadUrl({variables:{purpose:'COURSE_SLIDE',filename:file.name,contentType:file.type}});
   const {uploadUrl,fileUrl}=data.requestUploadUrl;
   const res=await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':file.type},body:file});
   if(!res.ok)throw new Error(`Upload failed (${res.status}).`);
   await addLessonSlide({variables:{input:{lessonId:slidesLessonId,fileUrl,title:file.name}}});
   await refetch();
  }catch(e:any){setSlideUploadError(e.message??'Upload failed.');}
  setUploadingSlide(false);
 }
 async function removeSlide(id:string){await deleteLessonSlide({variables:{id}});await refetch();}
 async function moveSlide(slideId:string,direction:-1|1){
  if(!slidesLessonId)return;
  const ids=(slidesLesson?.slides??[]).map((s:any)=>s.id);
  const i=ids.indexOf(slideId);const j=i+direction;if(j<0||j>=ids.length)return;
  [ids[i],ids[j]]=[ids[j],ids[i]];
  await reorderLessonSlides({variables:{lessonId:slidesLessonId,slideIds:ids}});await refetch();
 }
 const bounds=boundsData?.xpAwardBounds??{min:5,max:200};
 async function giveXp(enrollmentId:string){
  const draft=xpDraft[enrollmentId]??{amount:'',note:''};
  const amount=parseInt(draft.amount,10);
  if(!Number.isInteger(amount)||amount<bounds.min||amount>bounds.max)return alert(`Amount must be a whole number between ${bounds.min} and ${bounds.max}.`);
  await awardXp({variables:{enrollmentId,amount,note:draft.note.trim()||null}});
  setXpDraft({...xpDraft,[enrollmentId]:{amount:'',note:''}});
  await refetchEnrollments();
 }
 return <RoleGate allow={['TEACHER','ADMIN']} callbackUrl={`/dashboard/teacher/courses/${courseId}`}><main className="mx-auto max-w-6xl px-6 py-10">
  <Link href="/dashboard/teacher/content" className="text-sm text-primary-700">← Theory studio</Link>{loading?<p className="mt-8">Loading…</p>:error||!course?<p className="mt-8 text-red-600">{error?.message??'Course not found.'}</p>:<>
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-serif text-3xl font-bold">Course builder</h1><p className="text-sm text-gray-600">{course.status} · /courses/{course.slug}</p></div>{course.status==='DRAFT'&&<button className="btn-primary rounded-lg px-4 py-2" onClick={async()=>{await publish({variables:{id:courseId}});await refetch();}}>Publish course</button>}</div>
  <form onSubmit={saveCourse} className="card mt-8 space-y-4 p-6"><h2 className="text-xl font-semibold">Course information</h2>
   <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Title<input className="input mt-1 w-full" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label className="text-sm font-medium">Short summary<input className="input mt-1 w-full" value={form.shortSummary} onChange={e=>setForm({...form,shortSummary:e.target.value})}/></label></div>
   <label className="block text-sm font-medium">Description<textarea rows={5} className="input mt-1 w-full" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
   <div className="grid gap-4 sm:grid-cols-4"><label className="text-sm font-medium">Complexity<select className="input mt-1 w-full" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{['BEGINNER','ELEMENTARY','INTERMEDIATE','ADVANCED','PROFESSIONAL'].map(v=><option key={v}>{v}</option>)}</select></label><label className="text-sm font-medium">Price<input type="number" min="0" step=".01" className="input mt-1 w-full" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label className="text-sm font-medium">Currency<input className="input mt-1 w-full" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})}/></label><label className="text-sm font-medium">Language<input className="input mt-1 w-full" value={form.language} onChange={e=>setForm({...form,language:e.target.value})}/></label></div>
   <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Instruments<input className="input mt-1 w-full" value={form.instruments} onChange={e=>setForm({...form,instruments:e.target.value})}/></label><label className="text-sm font-medium">Styles<input className="input mt-1 w-full" value={form.musicStyles} onChange={e=>setForm({...form,musicStyles:e.target.value})}/></label></div>
   <label className="block text-sm font-medium">Cover image URL<input type="url" className="input mt-1 w-full" value={form.thumbnailUrl} onChange={e=>setForm({...form,thumbnailUrl:e.target.value})}/></label>
   <button disabled={saving} className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2"><Save className="h-4 w-4"/>{saving?'Saving…':'Save course'}</button>
  </form>
  <section className="mt-8"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5"/><h2 className="text-2xl font-semibold">Sections and units</h2></div>
   <form onSubmit={createSection} className="mt-4 flex gap-2"><input className="input flex-1" placeholder="New section title" value={sectionTitle} onChange={e=>setSectionTitle(e.target.value)}/><button className="btn-secondary inline-flex items-center gap-2 rounded-lg px-4"><Plus className="h-4 w-4"/>Add section</button></form>
   <div className="mt-5 space-y-5">{course.sections?.map((section:any)=><article key={section.id} className="card p-6"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{section.title}</h3><button className="text-red-600" onClick={async()=>{if(confirm('Delete this section and all its units?')){await deleteSection({variables:{id:section.id}});await refetch();}}}><Trash2 className="h-4 w-4"/></button></div>
    <div className="mt-4 space-y-2">{section.lessons?.map((lesson:any)=><div key={lesson.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{lesson.title}</p><p className="text-xs text-gray-500">{CONTENT_TYPE_LABELS[lesson.contentType as string]??'Video'} · {lesson.durationMin} min{lesson.isFreePreview?' · Free preview':''}{lesson.quizQuestions?.length?` · ${lesson.quizQuestions.length} quiz question${lesson.quizQuestions.length===1?'':'s'}`:''}{lesson.contentType==='SLIDES'?` · ${lesson.slides?.length??0} slide${(lesson.slides?.length??0)===1?'':'s'}`:''}</p></div><div className="flex gap-3">{lesson.contentType==='SLIDES'&&<button className="inline-flex items-center gap-1 text-sm text-primary-700" onClick={()=>{setSlidesLessonId(lesson.id);setSlideUploadError(null);}}><Plus className="h-4 w-4"/>Slides</button>}<button className="inline-flex items-center gap-1 text-sm text-primary-700" onClick={()=>setQuizLessonId(lesson.id)}><HelpCircle className="h-4 w-4"/>Quiz</button><button className="text-sm text-primary-700" onClick={()=>setEditing({...lesson})}>Edit</button><button className="text-red-600" onClick={async()=>{await deleteLesson({variables:{id:lesson.id}});await refetch();}}><Trash2 className="h-4 w-4"/></button></div></div>)}</div>
    <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 sm:grid-cols-2"><input className="input" placeholder="Unit title" value={lessonDraft[section.id]?.title??''} onChange={e=>setLessonDraft({...lessonDraft,[section.id]:{...lessonDraft[section.id],title:e.target.value}})}/><input type="number" min="0" className="input" placeholder="Length in minutes" value={lessonDraft[section.id]?.durationMin??''} onChange={e=>setLessonDraft({...lessonDraft,[section.id]:{...lessonDraft[section.id],durationMin:e.target.value}})}/><textarea className="input" placeholder="Unit description or written material" value={lessonDraft[section.id]?.description??''} onChange={e=>setLessonDraft({...lessonDraft,[section.id]:{...lessonDraft[section.id],description:e.target.value}})}/><select className="input" value={lessonDraft[section.id]?.contentType??'VIDEO'} onChange={e=>setLessonDraft({...lessonDraft,[section.id]:{...lessonDraft[section.id],contentType:e.target.value}})}>{CONTENT_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select>{(lessonDraft[section.id]?.contentType??'VIDEO')!=='SLIDES'&&<input type="url" className="input" placeholder={URL_PLACEHOLDERS[lessonDraft[section.id]?.contentType??'VIDEO']} value={lessonDraft[section.id]?.videoUrl??''} onChange={e=>setLessonDraft({...lessonDraft,[section.id]:{...lessonDraft[section.id],videoUrl:e.target.value}})}/>}<label className="text-sm"><input type="checkbox" checked={Boolean(lessonDraft[section.id]?.isFreePreview)} onChange={e=>setLessonDraft({...lessonDraft,[section.id]:{...lessonDraft[section.id],isFreePreview:e.target.checked}})}/> Free preview</label><button className="btn-secondary rounded-lg px-4 py-2" onClick={()=>void createLesson(section.id)}>Add unit</button></div>
   </article>)}</div>
  </section>
  <section className="mt-8"><h2 className="text-2xl font-semibold">Students</h2>
   <p className="mt-1 text-sm text-gray-500">Award a bonus ({bounds.min}–{bounds.max} XP) for engagement or completion, on top of automatic per-lesson XP.</p>
   <div className="mt-4 space-y-2">
    {(enrollmentData?.courseEnrollments?.nodes??[]).length===0&&<p className="text-sm text-gray-500">No enrollments yet.</p>}
    {enrollmentData?.courseEnrollments?.nodes?.map((e:any)=><div key={e.id} className="card flex flex-wrap items-center gap-3 p-4">
     <div className="flex-1 min-w-[10rem]"><p className="font-medium">{e.user?.profile?.displayName??'Student'}</p><p className="text-xs text-gray-500">{Math.round((e.progress??0)*100)}% complete{e.completedAt?' · Completed':''}</p></div>
     <input type="number" min={bounds.min} max={bounds.max} className="input w-24" placeholder="XP" value={xpDraft[e.id]?.amount??''} onChange={ev=>setXpDraft({...xpDraft,[e.id]:{amount:ev.target.value,note:xpDraft[e.id]?.note??''}})}/>
     <input className="input w-48" placeholder="Note (optional)" value={xpDraft[e.id]?.note??''} onChange={ev=>setXpDraft({...xpDraft,[e.id]:{amount:xpDraft[e.id]?.amount??'',note:ev.target.value}})}/>
     <button disabled={awarding} className="btn-secondary rounded-lg px-3 py-2 text-sm" onClick={()=>void giveXp(e.id)}>Award XP</button>
    </div>)}
   </div>
  </section>
  {editing&&<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"><section className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-6"><h2 className="text-xl font-semibold">Edit unit</h2><input className="input w-full" value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/><textarea className="input w-full" value={editing.description??''} onChange={e=>setEditing({...editing,description:e.target.value})}/><select className="input w-full" value={editing.contentType??'VIDEO'} onChange={e=>setEditing({...editing,contentType:e.target.value})}>{CONTENT_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select>{(editing.contentType??'VIDEO')!=='SLIDES'&&<input type="url" className="input w-full" placeholder={URL_PLACEHOLDERS[editing.contentType??'VIDEO']} value={editing.videoUrl??''} onChange={e=>setEditing({...editing,videoUrl:e.target.value})}/>}<input type="number" className="input w-full" value={editing.durationMin??0} onChange={e=>setEditing({...editing,durationMin:e.target.value})}/><label className="text-sm"><input type="checkbox" checked={Boolean(editing.isFreePreview)} onChange={e=>setEditing({...editing,isFreePreview:e.target.checked})}/> Free preview</label><div className="flex justify-end gap-3"><button className="btn-secondary rounded-lg px-4 py-2" onClick={()=>setEditing(null)}>Cancel</button><button className="btn-primary rounded-lg px-4 py-2" onClick={()=>void saveLesson()}>Save unit</button></div></section></div>}
  {quizLesson&&<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"><section className="max-h-[85vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6">
   <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Quiz · {quizLesson.title}</h2><button className="text-sm text-gray-500" onClick={()=>{setQuizLessonId(null);setQuestionDraft(EMPTY_QUESTION_DRAFT);}}>Close</button></div>
   <label className="block text-sm font-medium">Feedback timing<select className="input mt-1 w-full" value={quizLesson.feedbackMode??'IMMEDIATE'} onChange={e=>void setFeedbackMode(quizLesson.id,e.target.value)}><option value="IMMEDIATE">Show result right after each question</option><option value="AT_END">Show results only once the quiz is finished</option></select></label>
   <div className="space-y-2">{(quizLesson.quizQuestions??[]).length===0&&<p className="text-sm text-gray-500">No questions yet — add one below.</p>}
    {quizLesson.quizQuestions?.map((q:any)=><div key={q.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{q.text} <span className="text-xs font-normal text-gray-400">({QUESTION_TYPES.find(t=>t.value===q.type)?.label ?? q.type} · {q.points} pt{q.points===1?'':'s'})</span></p><button className="text-red-600" onClick={()=>void removeQuestion(q.id)}><Trash2 className="h-4 w-4"/></button></div>
     <ul className="mt-2 space-y-0.5 text-sm text-gray-600">{q.options.map((o:any)=><li key={o.id}>{q.correctOptionIds?.includes(o.id)?'✓':'·'} {o.text}</li>)}</ul>
    </div>)}
   </div>
   <div className="space-y-2 rounded-xl bg-gray-50 p-4">
    <p className="text-sm font-medium">Add a question</p>
    <input className="input w-full" placeholder="Question text" value={questionDraft.text} onChange={e=>setQuestionDraft({...questionDraft,text:e.target.value})}/>
    <div className="grid gap-2 sm:grid-cols-2"><select className="input" value={questionDraft.type} onChange={e=>setQuestionDraft({...questionDraft,type:e.target.value})}>{QUESTION_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select><input type="number" min="1" className="input" placeholder="Points" value={questionDraft.points} onChange={e=>setQuestionDraft({...questionDraft,points:e.target.value})}/></div>
    <textarea rows={4} className="input w-full" placeholder={'One option per line, e.g.\nC major\nD major\nE major'} value={questionDraft.optionsText} onChange={e=>setQuestionDraft({...questionDraft,optionsText:e.target.value})}/>
    <input className="input w-full" placeholder="Correct option number(s), e.g. 1 or 1,3" value={questionDraft.correctIndexes} onChange={e=>setQuestionDraft({...questionDraft,correctIndexes:e.target.value})}/>
    <button className="btn-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2" onClick={()=>void addQuestion()}><Plus className="h-4 w-4"/>Add question</button>
   </div>
  </section></div>}
  {slidesLesson&&<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"><section className="max-h-[85vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6">
   <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Slides · {slidesLesson.title}</h2><button className="text-sm text-gray-500" onClick={()=>{setSlidesLessonId(null);setSlideUploadError(null);}}>Close</button></div>
   {slideUploadError&&<p className="text-sm text-red-600">{slideUploadError}</p>}
   <div className="space-y-2">{(slidesLesson.slides??[]).length===0&&<p className="text-sm text-gray-500">No slides yet — add one below. Each slide is its own file (image or single-page PDF), shown to students one at a time.</p>}
    {(slidesLesson.slides??[]).map((slide:any,i:number,arr:any[])=><div key={slide.id} className="flex items-center justify-between rounded-lg border p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{i+1}. {slide.title??slide.fileUrl}</p></div><div className="flex shrink-0 items-center gap-2"><button className="text-sm text-gray-500 disabled:opacity-30" disabled={i===0} onClick={()=>void moveSlide(slide.id,-1)}>↑</button><button className="text-sm text-gray-500 disabled:opacity-30" disabled={i===arr.length-1} onClick={()=>void moveSlide(slide.id,1)}>↓</button><button className="text-red-600" onClick={()=>void removeSlide(slide.id)}><Trash2 className="h-4 w-4"/></button></div></div>)}
   </div>
   <div className="space-y-2 rounded-xl bg-gray-50 p-4">
    <p className="text-sm font-medium">Add a slide</p>
    {data?.storageConfigured?<><input type="file" accept="application/pdf,image/png,image/jpeg" disabled={uploadingSlide} onChange={e=>{const f=e.target.files?.[0];if(f)void uploadSlide(f);e.target.value='';}}/>
    {uploadingSlide&&<p className="text-xs text-gray-500">Uploading…</p>}</>:<p className="text-xs text-gray-500">Slide uploads aren&rsquo;t enabled on this deployment yet.</p>}
   </div>
  </section></div>}
  </>}</main></RoleGate>;
}
