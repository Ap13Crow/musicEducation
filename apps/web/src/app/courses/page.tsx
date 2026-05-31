'use client';

import { gql, useQuery } from '@apollo/client';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import Link from 'next/link';

const fallbackCourses = [
  {
    id: 'fallback-1',
    slug: 'piano-fundamentals',
    title: 'Piano Fundamentals for Classical Beginners',
    shortSummary: 'Build posture, hand position, and first repertoire pieces with structured guidance.',
    thumbnailUrl: null,
    price: 0,
    currency: 'USD',
    level: 'Beginner',
    avgRating: 4.8,
    totalReviews: 122,
    totalEnrollments: 1860,
    totalDurationMin: 280,
    instruments: ['Piano'],
    isFreeTier: true,
    teacher: { id: 't1', headline: 'Piano Pedagogue', user: { displayName: 'Anna Keller', avatarUrl: null } },
  },
  {
    id: 'fallback-2',
    slug: 'ear-training-core',
    title: 'Ear Training Core: Intervals, Chords, and Dictation',
    shortSummary: 'Strengthen your listening for auditions, improvisation, and confident ensemble playing.',
    thumbnailUrl: null,
    price: 29,
    currency: 'USD',
    level: 'Intermediate',
    avgRating: 4.7,
    totalReviews: 94,
    totalEnrollments: 1304,
    totalDurationMin: 360,
    instruments: ['All'],
    isFreeTier: false,
    teacher: { id: 't2', headline: 'Theory Specialist', user: { displayName: 'Marco De Luca', avatarUrl: null } },
  },
  {
    id: 'fallback-3',
    slug: 'baroque-performance-practice',
    title: 'Baroque Performance Practice for Modern Musicians',
    shortSummary: 'Learn articulation, ornamentation, and historical style to shape informed interpretations.',
    thumbnailUrl: null,
    price: 39,
    currency: 'USD',
    level: 'Advanced',
    avgRating: 4.9,
    totalReviews: 77,
    totalEnrollments: 742,
    totalDurationMin: 410,
    instruments: ['Strings', 'Keyboard'],
    isFreeTier: false,
    teacher: { id: 't3', headline: 'Historically Informed Performance', user: { displayName: 'Elise Moreau', avatarUrl: null } },
  },
];

const GET_COURSES = gql`
  query GetCourses($filter: CourseFilterInput, $page: Int, $limit: Int) {
    courses(filter: $filter, page: $page, limit: $limit) {
      nodes {
        id slug title shortSummary thumbnailUrl price currency
        level avgRating totalReviews totalEnrollments totalDurationMin
        instruments isFreeTier
        teacher { id headline user { displayName avatarUrl } }
      }
      pageInfo { totalCount hasNextPage }
    }
  }
`;

function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.slug}`} className="card group hover:border-primary-300 transition-colors">
      {course.thumbnailUrl ? (
        <img src={course.thumbnailUrl} alt={course.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
          <BookOpen className="h-12 w-12 text-primary-400" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">{course.level}</span>
          {course.isFreeTier && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Free</span>}
        </div>
        <h3 className="mb-1 font-semibold leading-snug group-hover:text-primary-600">{course.title}</h3>
        {course.shortSummary && <p className="mb-3 text-xs text-gray-500 line-clamp-2">{course.shortSummary}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {course.avgRating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.avgRating.toFixed(1)} ({course.totalReviews})
            </span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.totalDurationMin}min</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.totalEnrollments}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {Number(course.price) === 0 ? 'Free' : `${course.currency} ${Number(course.price).toFixed(2)}`}
          </span>
          {course.teacher && (
            <span className="text-xs text-gray-500">{course.teacher.headline ?? 'Instructor'}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { page: 1, limit: 12 },
    skip: !liveApiEnabled,
  });
  const courses = data?.courses?.nodes ?? fallbackCourses;
  const totalCount = data?.courses?.pageInfo?.totalCount ?? fallbackCourses.length;
  const usingFallback = !liveApiEnabled || Boolean(error) || !data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-2 text-3xl font-bold">Theory Courses</h1>
          <p className="text-gray-500">Structured video courses for every level — from beginner to professional.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex gap-2">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
            <button key={level} className="rounded-full border border-gray-200 px-4 py-1.5 text-sm hover:border-primary-500 hover:text-primary-600 transition-colors">
              {level}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Live API is disabled in this environment. Showing sample catalog data.
          </p>
        )}

        {error && liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Live API is currently unavailable. Showing sample catalog data.
          </p>
        )}

        {!loading && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {totalCount} courses available{usingFallback ? ' (sample data)' : ''}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No courses available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
