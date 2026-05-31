'use client';

import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { BookOpen, Star, Clock, Users } from 'lucide-react';

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
  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { page: 1, limit: 12 },
  });

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

        {error && (
          <p className="text-center text-red-500">Failed to load courses. Please try again.</p>
        )}

        {data && (
          <>
            <p className="mb-4 text-sm text-gray-500">{data.courses.pageInfo.totalCount} courses available</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.courses.nodes.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && data?.courses.nodes.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No courses available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
