'use client';

import { useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { ArrowLeft, CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react';
import { toYouTubeEmbedUrl } from '@/lib/youtube';

const GET_COURSE = gql`
  query GetCourseForLearning($slug: String) {
    course(slug: $slug) {
      id
      slug
      title
      sections {
        id
        title
        order
        lessons { id title description videoUrl contentType durationMin isFreePreview order xpReward }
      }
    }
  }
`;

// Separate from GET_COURSE (which is public) so a guest previewing a free
// lesson doesn't trip an auth error on the whole page — this only runs once
// we have both a session and the course id.
const GET_ENROLLMENT = gql`
  query MyEnrollmentForLearning($courseId: ID!) {
    myEnrollment(courseId: $courseId) {
      id
      progress
      lessonProgress { lessonId completedAt }
    }
  }
`;

const MARK_COMPLETE = gql`
  mutation MarkLessonCompleteFromLearn($lessonId: ID!) {
    markLessonComplete(lessonId: $lessonId) { id completedAt }
  }
`;

export default function CourseLearnPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

  const { data, loading, error } = useQuery(GET_COURSE, { variables: { slug }, skip: !liveApiEnabled });
  const course = data?.course;

  const { data: enrollmentData, refetch: refetchEnrollment } = useQuery(GET_ENROLLMENT, {
    variables: { courseId: course?.id },
    skip: !liveApiEnabled || !course?.id || status !== 'authenticated',
  });
  const enrollment = enrollmentData?.myEnrollment;
  const enrolled = Boolean(enrollment);

  const [markComplete, { loading: completing }] = useMutation(MARK_COMPLETE);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const lessons = useMemo(
    () => (course?.sections ?? []).flatMap((s: any) => s.lessons ?? []),
    [course],
  );
  // Deep-link from the course detail page's curriculum list (?lesson=<id>).
  // Read via window.location rather than useSearchParams() — the latter pulls
  // this whole client page into a Suspense boundary at build time, which we
  // avoid elsewhere in this app (see the payouts page for the same pattern).
  useEffect(() => {
    const lessonParam = new URLSearchParams(window.location.search).get('lesson');
    if (lessonParam && lessons.some((l: any) => l.id === lessonParam)) {
      setSelectedLessonId(lessonParam);
    }
  }, [lessons]);

  const currentLesson = lessons.find((l: any) => l.id === selectedLessonId) ?? lessons[0];

  const completedLessonIds = new Set<string>(
    (enrollment?.lessonProgress ?? []).filter((p: any) => p.completedAt).map((p: any) => p.lessonId),
  );
  const isCurrentComplete = currentLesson && completedLessonIds.has(currentLesson.id);
  const canWatchCurrent = currentLesson && (currentLesson.isFreePreview || enrolled);

  async function handleMarkComplete() {
    if (!currentLesson) return;
    await markComplete({ variables: { lessonId: currentLesson.id } });
    await refetchEnrollment();
  }

  if (loading) {
    return <main className="mx-auto max-w-5xl px-6 py-16 text-center text-gray-500">Loading course…</main>;
  }
  if (error || !course) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold">Course not found</h1>
        <p className="mt-3 text-gray-600">This course is unavailable or has not been published yet.</p>
        <Link href="/courses" className="btn-primary mt-6 inline-block rounded-lg px-5 py-3">Back to courses</Link>
      </main>
    );
  }

  const progressPct = Math.round((enrollment?.progress ?? 0) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <Link href={`/courses/${slug}`} className="flex items-center gap-1 text-sm text-primary-700">
              <ArrowLeft className="h-4 w-4" /> {course.title}
            </Link>
          </div>
          {enrolled && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-32 rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-primary-600" style={{ width: `${progressPct}%` }} />
              </div>
              {progressPct}% complete
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Curriculum sidebar */}
          <nav className="lg:col-span-1">
            <div className="card divide-y divide-gray-100 overflow-hidden">
              {course.sections?.map((section: any) => (
                <div key={section.id}>
                  <p className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500">{section.title}</p>
                  {section.lessons?.map((lesson: any) => {
                    const locked = !lesson.isFreePreview && !enrolled;
                    const done = completedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors ${
                          currentLesson?.id === lesson.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                        ) : locked ? (
                          <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-xs text-gray-400">{lesson.durationMin}min</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* Lesson content */}
          <section className="lg:col-span-2">
            {!currentLesson ? (
              <p className="card p-8 text-center text-gray-500">This course doesn&rsquo;t have any lessons yet.</p>
            ) : (
              <div className="card p-6">
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>

                <div className="mt-4 overflow-hidden rounded-xl bg-gray-900">
                  {canWatchCurrent && currentLesson.videoUrl && currentLesson.contentType === 'YOUTUBE' ? (
                    (() => {
                      const embedUrl = toYouTubeEmbedUrl(currentLesson.videoUrl);
                      return embedUrl ? (
                        <iframe
                          key={currentLesson.id}
                          className="aspect-video w-full"
                          src={embedUrl}
                          title={currentLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center text-sm text-gray-400">
                          This YouTube link couldn&rsquo;t be read — see the notes below.
                        </div>
                      );
                    })()
                  ) : canWatchCurrent && currentLesson.videoUrl && currentLesson.contentType === 'AUDIO' ? (
                    <div className="flex aspect-video flex-col items-center justify-center gap-4 px-8">
                      <PlayCircle className="h-10 w-10 text-gray-500" />
                      <audio key={currentLesson.id} controls className="w-full" src={currentLesson.videoUrl} />
                    </div>
                  ) : canWatchCurrent && currentLesson.videoUrl ? (
                    <video key={currentLesson.id} controls className="aspect-video w-full" src={currentLesson.videoUrl} />
                  ) : canWatchCurrent ? (
                    <div className="flex aspect-video items-center justify-center text-sm text-gray-400">
                      No video for this lesson yet — see the notes below.
                    </div>
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center text-white">
                      <Lock className="h-8 w-8" />
                      <p className="text-sm text-gray-300">
                        {status === 'authenticated' ? 'Enroll in this course to unlock this lesson.' : 'Sign in and enroll to unlock this lesson.'}
                      </p>
                      {status === 'authenticated' ? (
                        <Link href={`/courses/${slug}`} className="btn-primary rounded-lg px-4 py-2 text-sm">
                          Go to enrollment
                        </Link>
                      ) : (
                        <button onClick={() => signIn('keycloak', { callbackUrl: `/courses/${slug}/learn` })} className="btn-primary rounded-lg px-4 py-2 text-sm">
                          Sign in
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {currentLesson.description && (
                  <p className="mt-4 whitespace-pre-line text-sm text-gray-600">{currentLesson.description}</p>
                )}

                {enrolled && (
                  <div className="mt-6 flex items-center gap-3">
                    {isCurrentComplete ? (
                      <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <CheckCircle className="h-5 w-5" /> Completed
                      </span>
                    ) : (
                      <button onClick={handleMarkComplete} disabled={completing} className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
                        <PlayCircle className="h-4 w-4" /> {completing ? 'Saving…' : `Mark complete (+${currentLesson.xpReward} XP)`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
