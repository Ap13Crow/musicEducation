'use client';

import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { BookOpen, Clock, Star, Users, Play, Lock, ChevronRight, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';

const LEARN_URL = process.env.NEXT_PUBLIC_LEARN_URL ?? 'https://learn.mymusic.coach';

const ENROLL_IN_COURSE = gql`
  mutation EnrollInCourse($courseId: ID!) {
    enrollInCourse(courseId: $courseId) { id courseId progress }
  }
`;

const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSession($type: String!, $refId: ID!) {
    createCheckoutSession(type: $type, refId: $refId) { checkoutUrl }
  }
`;

const GET_COURSE = gql`
  query GetCourse($slug: String) {
    course(slug: $slug) {
      id slug title description shortSummary thumbnailUrl
      price currency level status language moodleCourseId
      instruments musicStyles isFreeTier
      avgRating totalReviews totalEnrollments totalDurationMin
      teacher {
        id headline
        user { displayName avatarUrl }
        avgRating totalReviews yearsExperience instruments
      }
      sections {
        id title order
        lessons { id title description durationMin order isFreePreview xpReward }
      }
      reviews(page: 1, limit: 5) {
        nodes { id rating comment createdAt author { displayName avatarUrl } }
        pageInfo { totalCount }
      }
    }
    myEnrollments(page: 1, limit: 200) {
      nodes { id courseId progress createdAt }
    }
  }
`;

const fallbackCourse = {
  id: 'fallback-1',
  slug: 'piano-fundamentals',
  title: 'Piano Fundamentals for Classical Beginners',
  description:
    'This comprehensive course takes you through the essential foundations of classical piano playing. You will learn proper posture, hand positioning, basic music reading, and begin working on your first repertoire pieces with structured guidance from an experienced instructor.\n\nTopics covered include:\n- Correct sitting posture and hand position\n- Reading treble and bass clef\n- Major and minor scales (C, G, D, F)\n- Simple classical pieces from the Baroque and Classical periods\n- Basic pedal technique\n- Practice strategies for efficient learning',
  shortSummary: 'Build posture, hand position, and first repertoire pieces with structured guidance.',
  thumbnailUrl: null,
  price: 0,
  currency: 'USD',
  level: 'Beginner',
  status: 'PUBLISHED',
  language: 'en',
  instruments: ['Piano'],
  musicStyles: ['Classical', 'Baroque'],
  isFreeTier: true,
  avgRating: 4.8,
  totalReviews: 122,
  totalEnrollments: 1860,
  totalDurationMin: 280,
  teacher: {
    id: 't1',
    headline: 'Piano Pedagogue — 12 years experience',
    user: { displayName: 'Anna Keller', avatarUrl: null },
    avgRating: 4.9,
    totalReviews: 87,
    yearsExperience: 12,
    instruments: ['Piano'],
  },
  sections: [
    {
      id: 's1',
      title: 'Getting Started',
      order: 0,
      lessons: [
        { id: 'l1', title: 'Welcome & Course Overview', description: null, durationMin: 8, order: 0, isFreePreview: true, xpReward: 5 },
        { id: 'l2', title: 'Setting Up Your Practice Space', description: null, durationMin: 12, order: 1, isFreePreview: true, xpReward: 10 },
        { id: 'l3', title: 'Correct Sitting Posture', description: null, durationMin: 15, order: 2, isFreePreview: false, xpReward: 10 },
      ],
    },
    {
      id: 's2',
      title: 'Reading Music',
      order: 1,
      lessons: [
        { id: 'l4', title: 'Introduction to the Staff', description: null, durationMin: 20, order: 0, isFreePreview: false, xpReward: 15 },
        { id: 'l5', title: 'Treble Clef Note Reading', description: null, durationMin: 25, order: 1, isFreePreview: false, xpReward: 15 },
        { id: 'l6', title: 'Bass Clef Note Reading', description: null, durationMin: 25, order: 2, isFreePreview: false, xpReward: 15 },
        { id: 'l7', title: 'Rhythm Basics', description: null, durationMin: 18, order: 3, isFreePreview: false, xpReward: 15 },
      ],
    },
    {
      id: 's3',
      title: 'First Scales & Exercises',
      order: 2,
      lessons: [
        { id: 'l8', title: 'C Major Scale — Right Hand', description: null, durationMin: 20, order: 0, isFreePreview: false, xpReward: 20 },
        { id: 'l9', title: 'C Major Scale — Left Hand', description: null, durationMin: 20, order: 1, isFreePreview: false, xpReward: 20 },
        { id: 'l10', title: 'Hands Together Practice', description: null, durationMin: 25, order: 2, isFreePreview: false, xpReward: 25 },
      ],
    },
  ],
  reviews: {
    nodes: [
      { id: 'r1', rating: 5, comment: 'Excellent course! Clear explanations and great pacing for beginners.', createdAt: '2024-12-01', author: { displayName: 'Sarah K.', avatarUrl: null } },
      { id: 'r2', rating: 5, comment: 'Finally understood proper hand position after struggling for months.', createdAt: '2024-11-15', author: { displayName: 'Thomas M.', avatarUrl: null } },
      { id: 'r3', rating: 4, comment: 'Very thorough. Would love more repertoire pieces in future updates.', createdAt: '2024-11-01', author: { displayName: 'Luisa G.', avatarUrl: null } },
    ],
    pageInfo: { totalCount: 122 },
  },
};

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { slug },
    skip: !liveApiEnabled,
  });

  const [enrollFree, { loading: enrolling, data: enrollData }] = useMutation(ENROLL_IN_COURSE);
  const [createCheckout, { loading: checkingOut }] = useMutation(CREATE_CHECKOUT_SESSION);

  // Check enrollment from DB (past sessions) OR from the current-session mutation result
  const enrolledFromDb = (data?.myEnrollments?.nodes ?? []).some(
    (e: any) => e.courseId === data?.course?.id,
  );
  const enrolled = enrolledFromDb || !!enrollData?.enrollInCourse;

  const moodleUrl = data?.course?.moodleCourseId
    ? `${LEARN_URL}/course/view.php?id=${data.course.moodleCourseId}`
    : null;

  async function handleEnroll() {
    if (!course?.id || !liveApiEnabled) return;
    if (Number(course.price) === 0) {
      await enrollFree({ variables: { courseId: course.id } });
    } else {
      const { data: checkoutData } = await createCheckout({
        variables: { type: 'course', refId: course.id },
      });
      if (checkoutData?.createCheckoutSession?.checkoutUrl) {
        window.location.href = checkoutData.createCheckoutSession.checkoutUrl;
      }
    }
  }

  function getFallbackCourse(courseSlug: string) {
    if (courseSlug === fallbackCourse.slug) return fallbackCourse;
    const title = courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    return { ...fallbackCourse, slug: courseSlug, title };
  }

  const course = data?.course ?? getFallbackCourse(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-64 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <Link href="/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{course.level}</span>
            {course.isFreeTier && <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-medium text-green-100">Free</span>}
            {course.instruments?.map((i: string) => (
              <span key={i} className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{i}</span>
            ))}
          </div>
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">{course.title}</h1>
          {course.shortSummary && <p className="mb-4 text-lg text-primary-100">{course.shortSummary}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-200">
            {course.avgRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {course.avgRating.toFixed(1)} ({course.totalReviews} reviews)
              </span>
            )}
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.totalEnrollments} students</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.totalDurationMin} min</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
          </div>

          {course.teacher && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                {course.teacher.user?.displayName?.charAt(0) ?? '?'}
              </div>
              <div>
                <p className="font-medium">{course.teacher.user?.displayName}</p>
                <p className="text-xs text-primary-200">{course.teacher.headline}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <section>
                <h2 className="mb-3 text-xl font-bold">About This Course</h2>
                <div className="prose prose-sm text-gray-600 whitespace-pre-line">{course.description}</div>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <h2 className="mb-4 text-xl font-bold">Curriculum</h2>
              <div className="space-y-3">
                {course.sections?.map((section: any, si: number) => (
                  <div key={section.id} className="card overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">
                      Section {si + 1}: {section.title}
                      <span className="ml-2 text-xs text-gray-500">({section.lessons?.length ?? 0} lessons)</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {section.lessons?.map((lesson: any) => (
                        <li key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => alert('Next.js course player/quiz form opens here (submits to Moodle REST API)')}>
                          {lesson.isFreePreview ? (
                            <Play className="h-4 w-4 shrink-0 text-primary-600" />
                          ) : (
                            <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <span className="rounded bg-primary-50 px-2 py-0.5 text-xs text-primary-700">Preview</span>
                          )}
                          <span className="text-xs text-gray-500">{lesson.durationMin} min</span>
                          <span className="text-xs text-amber-600">+{lesson.xpReward} XP</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            {course.reviews?.nodes?.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold">
                  Student Reviews
                  <span className="ml-2 text-sm font-normal text-gray-500">({course.reviews.pageInfo.totalCount})</span>
                </h2>
                <div className="space-y-3">
                  {course.reviews.nodes.map((review: any) => (
                    <div key={review.id} className="card p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.author?.displayName}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20 card p-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {Number(course.price) === 0 ? 'Free' : `${course.currency} ${Number(course.price).toFixed(2)}`}
                </p>
              </div>

              {session ? (
                enrolled ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
                      <CheckCircle className="h-5 w-5" /> Enrolled
                    </div>
                    {moodleUrl && (
                      <a
                        href={moodleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700"
                      >
                        Go to Course <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn-primary w-full py-3 text-base disabled:opacity-60"
                    onClick={handleEnroll}
                    disabled={enrolling || checkingOut || !liveApiEnabled}
                  >
                    {enrolling || checkingOut
                      ? 'Processing…'
                      : Number(course.price) === 0
                      ? 'Enroll — Free'
                      : 'Enroll Now'}
                  </button>
                )
              ) : (
                <button
                  onClick={() => signIn('keycloak')}
                  className="btn-primary w-full py-3 text-base"
                >
                  Sign in to Enroll
                </button>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Level</span>
                  <span className="font-medium text-gray-900">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-medium text-gray-900">{course.totalDurationMin} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span className="font-medium text-gray-900">{totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language</span>
                  <span className="font-medium text-gray-900">{course.language?.toUpperCase()}</span>
                </div>
                {course.musicStyles?.length > 0 && (
                  <div className="flex justify-between">
                    <span>Styles</span>
                    <span className="font-medium text-gray-900">{course.musicStyles.join(', ')}</span>
                  </div>
                )}
              </div>

              {course.teacher && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="mb-2 text-sm font-semibold">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
                      {course.teacher.user?.displayName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{course.teacher.user?.displayName}</p>
                      {course.teacher.avgRating > 0 && (
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {course.teacher.avgRating.toFixed(1)} · {course.teacher.yearsExperience}y experience
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
