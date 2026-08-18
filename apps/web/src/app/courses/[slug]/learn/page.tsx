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
        lessons {
          id title description videoUrl contentType durationMin isFreePreview order xpReward feedbackMode
          quizQuestions { id text type points order options { id text } }
        }
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

// Quiz-taking: myQuizAttempt is only queried once a lesson with questions
// is actually selected and the viewer is enrolled (see skip below).
const GET_QUIZ_ATTEMPT = gql`
  query MyQuizAttemptForLearning($lessonId: ID!) {
    myQuizAttempt(lessonId: $lessonId) {
      id
      score
      maxScore
      completedAt
      answers { id questionId selectedOptionIds isCorrect pointsAwarded }
    }
  }
`;
const START_QUIZ_ATTEMPT = gql`
  mutation StartQuizAttemptFromLearn($lessonId: ID!) {
    startQuizAttempt(lessonId: $lessonId) { id score maxScore completedAt }
  }
`;
const SUBMIT_QUIZ_ANSWER = gql`
  mutation SubmitQuizAnswerFromLearn($input: SubmitQuizAnswerInput!) {
    submitQuizAnswer(input: $input) { id questionId selectedOptionIds isCorrect pointsAwarded }
  }
`;
const COMPLETE_QUIZ_ATTEMPT = gql`
  mutation CompleteQuizAttemptFromLearn($attemptId: ID!) {
    completeQuizAttempt(attemptId: $attemptId) {
      id score maxScore completedAt
      answers { id questionId selectedOptionIds isCorrect pointsAwarded }
    }
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
  const hasQuiz = (currentLesson?.quizQuestions?.length ?? 0) > 0;

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

  const { data: attemptData, refetch: refetchAttempt } = useQuery(GET_QUIZ_ATTEMPT, {
    variables: { lessonId: currentLesson?.id },
    skip: !liveApiEnabled || !hasQuiz || !currentLesson?.id || !enrolled,
  });
  const attempt = attemptData?.myQuizAttempt;
  const [startQuizAttempt, { loading: startingQuiz }] = useMutation(START_QUIZ_ATTEMPT);
  const [submitQuizAnswer, { loading: submittingAnswer }] = useMutation(SUBMIT_QUIZ_ANSWER);
  const [completeQuizAttempt, { loading: completingQuiz }] = useMutation(COMPLETE_QUIZ_ATTEMPT);
  // Local in-progress picks, keyed by question id, before a question is submitted.
  const [quizSelections, setQuizSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setQuizSelections({});
  }, [currentLesson?.id]);

  function toggleOption(question: any, optionId: string) {
    setQuizSelections((prev) => {
      const current = prev[question.id] ?? [];
      if (question.type === 'SINGLE_CHOICE') return { ...prev, [question.id]: [optionId] };
      const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [question.id]: next };
    });
  }

  async function handleStartQuiz() {
    if (!currentLesson) return;
    await startQuizAttempt({ variables: { lessonId: currentLesson.id } });
    setQuizSelections({});
    await refetchAttempt();
  }

  async function handleSubmitAnswer(question: any) {
    if (!attempt) return;
    const selectedOptionIds = quizSelections[question.id] ?? [];
    if (selectedOptionIds.length === 0) return;
    await submitQuizAnswer({ variables: { input: { attemptId: attempt.id, questionId: question.id, selectedOptionIds } } });
    await refetchAttempt();
  }

  async function handleFinishQuiz() {
    if (!attempt) return;
    await completeQuizAttempt({ variables: { attemptId: attempt.id } });
    await refetchAttempt();
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
  const allQuestionsAnswered =
    hasQuiz && attempt && currentLesson.quizQuestions.every((q: any) => attempt.answers.some((a: any) => a.questionId === q.id));

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

                {enrolled && !hasQuiz && (
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

                {enrolled && hasQuiz && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h2 className="text-lg font-semibold">Quiz</h2>
                    {!attempt ? (
                      <button onClick={handleStartQuiz} disabled={startingQuiz} className="btn-primary mt-3 rounded-lg px-4 py-2 text-sm">
                        {startingQuiz ? 'Starting…' : 'Start quiz'}
                      </button>
                    ) : (
                      <div className="mt-3 space-y-4">
                        {attempt.completedAt && (
                          <p className="text-sm font-medium text-green-700">
                            Score: {attempt.score} / {attempt.maxScore}
                          </p>
                        )}
                        {currentLesson.quizQuestions.map((question: any) => {
                          const answer = attempt.answers.find((a: any) => a.questionId === question.id);
                          const selections = quizSelections[question.id] ?? answer?.selectedOptionIds ?? [];
                          const locked = Boolean(answer) || Boolean(attempt.completedAt);
                          return (
                            <div key={question.id} className="rounded-lg border border-gray-200 p-3">
                              <p className="text-sm font-medium">
                                {question.text}{' '}
                                <span className="text-xs font-normal text-gray-400">
                                  ({question.points} pt{question.points === 1 ? '' : 's'}
                                  {question.type === 'MULTIPLE_CHOICE' ? ' · select all that apply' : ''})
                                </span>
                              </p>
                              <div className="mt-2 space-y-1">
                                {question.options.map((option: any) => (
                                  <label key={option.id} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                      type={question.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                                      name={`quiz-question-${question.id}`}
                                      checked={selections.includes(option.id)}
                                      disabled={locked}
                                      onChange={() => toggleOption(question, option.id)}
                                    />
                                    {option.text}
                                  </label>
                                ))}
                              </div>
                              {answer ? (
                                answer.isCorrect === null || answer.isCorrect === undefined ? (
                                  <p className="mt-2 text-xs text-gray-500">
                                    Answer saved — you&rsquo;ll see whether it was right once you finish the quiz.
                                  </p>
                                ) : (
                                  <p className={`mt-2 text-xs font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {answer.isCorrect ? `Correct (+${answer.pointsAwarded} pt)` : 'Incorrect'}
                                  </p>
                                )
                              ) : (
                                <button
                                  onClick={() => handleSubmitAnswer(question)}
                                  disabled={submittingAnswer || selections.length === 0}
                                  className="btn-secondary mt-2 rounded-lg px-3 py-1 text-xs"
                                >
                                  Submit answer
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {!attempt.completedAt && allQuestionsAnswered && (
                          <button onClick={handleFinishQuiz} disabled={completingQuiz} className="btn-primary rounded-lg px-4 py-2 text-sm">
                            {completingQuiz ? 'Finishing…' : 'Finish quiz'}
                          </button>
                        )}
                        {attempt.completedAt && (
                          <button onClick={handleStartQuiz} disabled={startingQuiz} className="btn-secondary rounded-lg px-4 py-2 text-sm">
                            {startingQuiz ? 'Resetting…' : 'Retake quiz'}
                          </button>
                        )}
                      </div>
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
