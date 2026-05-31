'use client';

import { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { BookOpen, Clock, Star, Users, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

const INSTRUMENTS = ['Piano', 'Violin', 'Viola', 'Cello', 'Guitar', 'Voice', 'Flute', 'Clarinet', 'Oboe', 'Trumpet', 'Organ', 'Harp', 'Percussion', 'Composition', 'Theory'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

const fallbackCourses = [
  {
    id: 'fallback-1', slug: 'piano-fundamentals',
    title: 'Piano Fundamentals for Classical Beginners',
    shortSummary: 'Build posture, hand position, and first repertoire pieces with structured guidance.',
    thumbnailUrl: null, price: 0, currency: 'USD', level: 'Beginner',
    avgRating: 4.8, totalReviews: 122, totalEnrollments: 1860, totalDurationMin: 280,
    instruments: ['Piano'], isFreeTier: true,
    teacher: { id: 't1', headline: 'Piano Pedagogue', user: { displayName: 'Anna Keller', avatarUrl: null } },
  },
  {
    id: 'fallback-2', slug: 'ear-training-core',
    title: 'Ear Training Core: Intervals, Chords, and Dictation',
    shortSummary: 'Strengthen your listening for auditions, improvisation, and confident ensemble playing.',
    thumbnailUrl: null, price: 29, currency: 'USD', level: 'Intermediate',
    avgRating: 4.7, totalReviews: 94, totalEnrollments: 1304, totalDurationMin: 360,
    instruments: ['All'], isFreeTier: false,
    teacher: { id: 't2', headline: 'Theory Specialist', user: { displayName: 'Marco De Luca', avatarUrl: null } },
  },
  {
    id: 'fallback-3', slug: 'baroque-performance-practice',
    title: 'Baroque Performance Practice for Modern Musicians',
    shortSummary: 'Learn articulation, ornamentation, and historical style to shape informed interpretations.',
    thumbnailUrl: null, price: 39, currency: 'USD', level: 'Advanced',
    avgRating: 4.9, totalReviews: 77, totalEnrollments: 742, totalDurationMin: 410,
    instruments: ['Strings', 'Keyboard'], isFreeTier: false,
    teacher: { id: 't3', headline: 'Historically Informed Performance', user: { displayName: 'Elise Moreau', avatarUrl: null } },
  },
  {
    id: 'fallback-4', slug: 'violin-technique-mastery',
    title: 'Violin Technique Mastery: From Scales to Concerto',
    shortSummary: 'Master bowing, intonation and vibrato through progressive exercises and repertoire.',
    thumbnailUrl: null, price: 49, currency: 'USD', level: 'Intermediate',
    avgRating: 4.8, totalReviews: 63, totalEnrollments: 890, totalDurationMin: 420,
    instruments: ['Violin'], isFreeTier: false,
    teacher: { id: 't4', headline: 'Concertmaster & Teacher', user: { displayName: 'Marco De Luca', avatarUrl: null } },
  },
  {
    id: 'fallback-5', slug: 'voice-classical-singing',
    title: 'Classical Singing: Breath, Tone & Expression',
    shortSummary: 'Develop your vocal technique with bel canto exercises and aria study.',
    thumbnailUrl: null, price: 0, currency: 'USD', level: 'Beginner',
    avgRating: 4.6, totalReviews: 88, totalEnrollments: 1450, totalDurationMin: 300,
    instruments: ['Voice'], isFreeTier: true,
    teacher: { id: 't5', headline: 'Opera & Vocal Coach', user: { displayName: 'Elise Moreau', avatarUrl: null } },
  },
  {
    id: 'fallback-6', slug: 'music-theory-harmony',
    title: 'Music Theory: Harmony and Counterpoint',
    shortSummary: 'Understand harmonic progressions, voice leading, and counterpoint from Bach to Debussy.',
    thumbnailUrl: null, price: 35, currency: 'USD', level: 'Advanced',
    avgRating: 4.9, totalReviews: 112, totalEnrollments: 1680, totalDurationMin: 480,
    instruments: ['Theory', 'Composition'], isFreeTier: false,
    teacher: { id: 't2', headline: 'Theory Specialist', user: { displayName: 'Marco De Luca', avatarUrl: null } },
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
        <div className="mb-1 flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">{course.level}</span>
          {course.isFreeTier && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Free</span>}
          {course.instruments?.slice(0, 2).map((i: string) => (
            <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{i}</span>
          ))}
        </div>
        <h3 className="mb-1 font-semibold leading-snug group-hover:text-primary-600">{course.title}</h3>
        {course.shortSummary && <p className="mb-3 text-xs text-gray-500 line-clamp-2">{course.shortSummary}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {course.avgRating > 0 && (
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
            <span className="text-xs text-gray-500 truncate ml-2">{course.teacher.user?.displayName}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeInstrument, setActiveInstrument] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

  const filter: any = {};
  if (activeLevel !== 'All') filter.level = activeLevel.toUpperCase();
  if (activeInstrument) filter.instrument = activeInstrument;
  if (searchQuery) filter.search = searchQuery;
  if (freeOnly) filter.isFreeTier = true;

  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { filter: Object.keys(filter).length > 0 ? filter : undefined, page: 1, limit: 24 },
    skip: !liveApiEnabled,
  });

  // Client-side filtering for fallback data
  const filteredCourses = useMemo(() => {
    const base = data?.courses?.nodes ?? fallbackCourses;
    return base.filter((c: any) => {
      if (activeLevel !== 'All' && c.level?.toUpperCase() !== activeLevel.toUpperCase()) return false;
      if (activeInstrument && !c.instruments?.some((i: string) => i.toLowerCase() === activeInstrument.toLowerCase())) return false;
      if (freeOnly && !c.isFreeTier) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.title?.toLowerCase().includes(q) && !c.shortSummary?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, activeLevel, activeInstrument, searchQuery, freeOnly]);

  const totalCount = data?.courses?.pageInfo?.totalCount ?? filteredCourses.length;
  const usingFallback = !liveApiEnabled || Boolean(error) || !data;
  const hasActiveFilters = activeLevel !== 'All' || !!activeInstrument || !!searchQuery || freeOnly;

  function clearFilters() {
    setActiveLevel('All');
    setActiveInstrument('');
    setSearchQuery('');
    setFreeOnly(false);
  }

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
        {/* Search bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              showFilters ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                {[activeLevel !== 'All', !!activeInstrument, freeOnly].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 space-y-4">
            {/* Level filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Level</label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      activeLevel === level
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Instrument</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveInstrument('')}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    !activeInstrument ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  All
                </button>
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setActiveInstrument(activeInstrument === inst ? '' : inst)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      activeInstrument === inst
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Free courses only
              </label>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
                <X className="h-4 w-4" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Level quick filters (always visible) */}
        <div className="mb-6 flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                activeLevel === level
                  ? 'border-primary-500 bg-primary-600 text-white font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
              }`}
            >
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
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found{usingFallback ? ' (sample data)' : ''}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-2 text-gray-500">No courses match your filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
