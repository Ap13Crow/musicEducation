'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { CheckCircle2, GraduationCap, X } from 'lucide-react';
import { hasRole } from '@/lib/roles';

// Teachers: attach this Library item to a lesson of one of their courses,
// straight from the item page (the course builder's "Library" button does
// the same from the lesson side, and also takes whole folders).

const MY_LESSONS = gql`
  query MyCoursesForLibraryReference {
    myCourses(limit: 50) { nodes { id title status sections { id title lessons { id title libraryReferences { id item { id } } } } } }
  }
`;
const ADD = gql`
  mutation AddItemToLesson($input: AddLessonLibraryReferenceInput!) {
    addLessonLibraryReference(input: $input) { id }
  }
`;

export function AddToLessonButton({ itemId, itemTitle }: { itemId: string; itemTitle: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [added, setAdded] = useState<string | null>(null);
  const [load, { data, loading, refetch }] = useLazyQuery(MY_LESSONS, { fetchPolicy: 'network-only' });
  const [add, { loading: adding, error }] = useMutation(ADD);
  if (!hasRole(session?.roles, 'TEACHER') && !hasRole(session?.roles, 'ADMIN')) return null;

  const courses: any[] = data?.myCourses?.nodes ?? [];

  async function attach(lessonId: string, lessonTitle: string) {
    await add({ variables: { input: { lessonId, itemId, note: note.trim() || null } } });
    setAdded(lessonTitle);
    await refetch();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setAdded(null);
          void load();
        }}
        className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-600 shadow-sm hover:text-primary-700"
      >
        <GraduationCap className="h-5 w-5" /> Add to lesson
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" role="dialog" aria-label="Add to a lesson">
          <div className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">Add to a lesson</h2>
                <p className="line-clamp-2 text-sm text-gray-500">{itemTitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {added && (
                <p className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                  <CheckCircle2 className="h-4 w-4" /> Added to &ldquo;{added}&rdquo;.
                </p>
              )}
              {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>}
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder="Note for students (optional)"
                aria-label="Note for students"
                className="input mb-4 w-full text-base sm:text-sm"
              />
              {loading && !data ? (
                <p className="text-sm text-gray-500">Loading your courses…</p>
              ) : courses.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You have no courses yet. <Link href="/dashboard/teacher/content" className="text-primary-700 underline">Create one</Link> first.
                </p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id}>
                      <p className="text-sm font-semibold text-gray-900">
                        {course.title} {course.status !== 'PUBLISHED' && <span className="text-xs font-normal text-gray-500">· {course.status.toLowerCase()}</span>}
                      </p>
                      {course.sections.every((section: any) => !section.lessons.length) && <p className="text-xs text-gray-500">No lessons yet.</p>}
                      {course.sections.map((section: any) =>
                        section.lessons.length ? (
                          <div key={section.id} className="mt-1">
                            <p className="text-xs uppercase tracking-wide text-gray-500">{section.title}</p>
                            <ul>
                              {section.lessons.map((lesson: any) => {
                                const already = lesson.libraryReferences.some((ref: any) => ref.item?.id === itemId);
                                return (
                                  <li key={lesson.id} className="flex items-center gap-2 py-1">
                                    <span className="min-w-0 flex-1 truncate text-sm">{lesson.title}</span>
                                    <button
                                      type="button"
                                      disabled={already || adding}
                                      onClick={() => void attach(lesson.id, lesson.title)}
                                      className="inline-flex min-h-[2.5rem] shrink-0 items-center rounded-lg border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50"
                                    >
                                      {already ? 'Added' : 'Add'}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null,
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
