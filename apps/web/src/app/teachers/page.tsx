'use client';

import { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Star, MapPin, Clock, Music, Search, SlidersHorizontal, X, Video, Users as UsersIcon, Calendar, Award } from 'lucide-react';

const INSTRUMENTS = ['Piano', 'Violin', 'Viola', 'Cello', 'Guitar', 'Voice', 'Flute', 'Clarinet', 'Oboe', 'Trumpet', 'Organ', 'Harp', 'Percussion'];
const FORMATS = ['Online', 'In-Person', 'Hybrid'];
const EXPERIENCE_RANGES = [
  { label: 'Any', min: undefined },
  { label: '5+ years', min: 5 },
  { label: '10+ years', min: 10 },
  { label: '15+ years', min: 15 },
];
const RATING_OPTIONS = [
  { label: 'Any', min: undefined },
  { label: '4+ stars', min: 4 },
  { label: '4.5+ stars', min: 4.5 },
];

const fallbackTeachers = [
  {
    id: 't1', userId: 'u1',
    headline: 'Piano Pedagogue — Romantic repertoire and exam preparation',
    teachingBio: 'I specialize in helping students develop a deep connection with Romantic-era piano music. My approach combines technical precision with musical expression, drawing from my 12 years of teaching and performing experience.',
    hourlyRate: 80, currency: 'CHF',
    instruments: ['Piano'],
    specializations: ['Romantic repertoire', 'Exam prep', 'Technique'],
    teachingFormats: ['Online', 'In-Person'],
    locationCity: 'Zurich', locationCountry: 'Switzerland',
    isAvailable: true, yearsExperience: 12,
    avgRating: 4.9, totalReviews: 87,
    user: { displayName: 'Anna Keller', avatarUrl: null },
    certifications: [{ id: 'c1', title: 'Diploma in Piano Performance', issuingBody: 'Zurich Conservatory' }],
  },
  {
    id: 't2', userId: 'u2',
    headline: 'Violin Technique & Orchestral Audition Preparation',
    teachingBio: 'Former concertmaster with a passion for teaching. I work with students of all levels on intonation, bowing technique, and performance confidence. Specializing in audition preparation.',
    hourlyRate: 90, currency: 'CHF',
    instruments: ['Violin', 'Viola'],
    specializations: ['Technique', 'Audition prep', 'Chamber music'],
    teachingFormats: ['Online', 'In-Person', 'Hybrid'],
    locationCity: 'Geneva', locationCountry: 'Switzerland',
    isAvailable: true, yearsExperience: 9,
    avgRating: 4.8, totalReviews: 63,
    user: { displayName: 'Marco De Luca', avatarUrl: null },
    certifications: [{ id: 'c2', title: 'Master in Violin Performance', issuingBody: 'Geneva HEM' }],
  },
  {
    id: 't3', userId: 'u3',
    headline: 'Bel Canto Voice Coach & Stage Confidence',
    teachingBio: '15 years of vocal coaching experience with opera singers, musical theatre performers, and classical vocalists. My holistic approach combines breath work, vocal technique, and performance psychology.',
    hourlyRate: 100, currency: 'CHF',
    instruments: ['Voice'],
    specializations: ['Bel canto', 'Opera', 'Stage coaching', 'Breath work'],
    teachingFormats: ['Online', 'In-Person'],
    locationCity: 'Lausanne', locationCountry: 'Switzerland',
    isAvailable: true, yearsExperience: 15,
    avgRating: 4.7, totalReviews: 54,
    user: { displayName: 'Elise Moreau', avatarUrl: null },
    certifications: [{ id: 'c3', title: 'Diplôme de Chant', issuingBody: 'HEMU Lausanne' }],
  },
  {
    id: 't4', userId: 'u4',
    headline: 'Classical Guitar — From Renaissance to Contemporary',
    teachingBio: 'Experienced guitar teacher covering a wide range of classical guitar repertoire. I focus on building strong foundations in technique while exploring the full breadth of guitar literature.',
    hourlyRate: 70, currency: 'CHF',
    instruments: ['Guitar'],
    specializations: ['Classical guitar', 'Fingerstyle', 'Music reading'],
    teachingFormats: ['Online'],
    locationCity: 'Bern', locationCountry: 'Switzerland',
    isAvailable: true, yearsExperience: 8,
    avgRating: 4.6, totalReviews: 42,
    user: { displayName: 'David Chen', avatarUrl: null },
    certifications: [],
  },
  {
    id: 't5', userId: 'u5',
    headline: 'Flute & Music Theory — Patient and Encouraging',
    teachingBio: 'I believe every student can learn to play beautifully. With 20 years of teaching, I combine flute instruction with solid music theory education for a well-rounded musical development.',
    hourlyRate: 75, currency: 'CHF',
    instruments: ['Flute'],
    specializations: ['Music theory', 'Beginners', 'Orchestral repertoire'],
    teachingFormats: ['Online', 'In-Person', 'Hybrid'],
    locationCity: 'Basel', locationCountry: 'Switzerland',
    isAvailable: false, yearsExperience: 20,
    avgRating: 4.9, totalReviews: 98,
    user: { displayName: 'Sophie Müller', avatarUrl: null },
    certifications: [{ id: 'c5', title: 'Teaching Diploma', issuingBody: 'Basel Music Academy' }],
  },
];

const GET_TEACHERS = gql`
  query GetTeachers($filter: TeacherFilterInput, $page: Int, $limit: Int) {
    teachers(filter: $filter, page: $page, limit: $limit) {
      nodes {
        id userId headline teachingBio hourlyRate currency
        instruments specializations teachingFormats
        locationCity locationCountry
        isAvailable yearsExperience
        avgRating totalReviews
        certifications { id title issuingBody }
      }
      pageInfo { totalCount hasNextPage }
    }
  }
`;

function TeacherCard({ teacher }: { teacher: any }) {
  const { data: session } = useSession();

  return (
    <article className="card p-5 hover:border-primary-300 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
          {teacher.user?.displayName?.charAt(0) ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">{teacher.user?.displayName}</h2>
            {teacher.isAvailable ? (
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Available</span>
            ) : (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Unavailable</span>
            )}
          </div>
          {teacher.headline && <p className="mt-0.5 text-sm text-primary-700">{teacher.headline}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {teacher.instruments?.map((inst: string) => (
          <span key={inst} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
            {inst}
          </span>
        ))}
        {teacher.specializations?.slice(0, 3).map((s: string) => (
          <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
        ))}
      </div>

      {teacher.teachingBio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{teacher.teachingBio}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {teacher.avgRating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {teacher.avgRating.toFixed(1)} ({teacher.totalReviews} reviews)
          </span>
        )}
        {teacher.yearsExperience && (
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5" />
            {teacher.yearsExperience}y experience
          </span>
        )}
        {teacher.locationCity && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {teacher.locationCity}{teacher.locationCountry ? `, ${teacher.locationCountry}` : ''}
          </span>
        )}
        {teacher.teachingFormats?.length > 0 && (
          <span className="flex items-center gap-1">
            <Video className="h-3.5 w-3.5" />
            {teacher.teachingFormats.join(', ')}
          </span>
        )}
      </div>

      {teacher.certifications?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {teacher.certifications.slice(0, 2).map((cert: any) => (
            <span key={cert.id} className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              {cert.title}{cert.issuingBody ? ` — ${cert.issuingBody}` : ''}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          {teacher.hourlyRate ? (
            <span className="text-lg font-bold text-gray-900">
              {teacher.currency} {teacher.hourlyRate}
              <span className="text-sm font-normal text-gray-500">/hr</span>
            </span>
          ) : (
            <span className="text-sm text-gray-500">Contact for pricing</span>
          )}
        </div>
        {teacher.isAvailable ? (
          session ? (
            <button className="btn-primary">Book Intro Lesson</button>
          ) : (
            <button onClick={() => signIn('keycloak')} className="btn-primary">
              Sign in to Book
            </button>
          )
        ) : (
          <button disabled className="btn-secondary opacity-50 cursor-not-allowed">Unavailable</button>
        )}
      </div>
    </article>
  );
}

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInstrument, setActiveInstrument] = useState('');
  const [activeFormat, setActiveFormat] = useState('');
  const [minExperience, setMinExperience] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

  const filter: any = {};
  if (activeInstrument) filter.instrument = activeInstrument;
  if (activeFormat) filter.format = activeFormat.toUpperCase();
  if (minRating !== undefined) filter.minRating = minRating;
  if (availableOnly) filter.isAvailable = true;
  if (searchQuery) filter.search = searchQuery;

  const { data, loading, error } = useQuery(GET_TEACHERS, {
    variables: { filter: Object.keys(filter).length > 0 ? filter : undefined, page: 1, limit: 24 },
    skip: !liveApiEnabled,
  });

  const filteredTeachers = useMemo(() => {
    const base = data?.teachers?.nodes ?? fallbackTeachers;
    return base.filter((t: any) => {
      if (activeInstrument && !t.instruments?.some((i: string) => i.toLowerCase() === activeInstrument.toLowerCase())) return false;
      if (activeFormat && !t.teachingFormats?.some((f: string) => f.toLowerCase() === activeFormat.toLowerCase())) return false;
      if (minExperience !== undefined && (t.yearsExperience ?? 0) < minExperience) return false;
      if (minRating !== undefined && (t.avgRating ?? 0) < minRating) return false;
      if (availableOnly && !t.isAvailable) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = t.user?.displayName?.toLowerCase().includes(q) ||
          t.headline?.toLowerCase().includes(q) ||
          t.teachingBio?.toLowerCase().includes(q) ||
          t.instruments?.some((i: string) => i.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [data, activeInstrument, activeFormat, minExperience, minRating, availableOnly, searchQuery]);

  const hasActiveFilters = !!activeInstrument || !!activeFormat || minExperience !== undefined || minRating !== undefined || availableOnly || !!searchQuery;

  function clearFilters() {
    setSearchQuery('');
    setActiveInstrument('');
    setActiveFormat('');
    setMinExperience(undefined);
    setMinRating(undefined);
    setAvailableOnly(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            Practice Pillar
          </p>
          <h1 className="mb-2 text-3xl font-bold">Find Your Teacher</h1>
          <p className="text-gray-500">
            Choose from certified instructors for piano, strings, voice, and theory. Book online lessons or in-person sessions.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Search + filter toggle */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, instrument, or specialty..."
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
                {[!!activeInstrument, !!activeFormat, minExperience !== undefined, minRating !== undefined, availableOnly].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 space-y-4">
            {/* Instrument filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Instrument</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveInstrument('')}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${!activeInstrument ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                >
                  All
                </button>
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setActiveInstrument(activeInstrument === inst ? '' : inst)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeInstrument === inst ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>

            {/* Format filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Teaching Format</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFormat('')}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${!activeFormat ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                >
                  All
                </button>
                {FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setActiveFormat(activeFormat === fmt ? '' : fmt)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeFormat === fmt ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Years of Experience</label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setMinExperience(minExperience === r.min ? undefined : r.min)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      minExperience === r.min ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Rating</label>
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setMinRating(minRating === r.min ? undefined : r.min)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      minRating === r.min ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Available now only
              </label>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
                <X className="h-4 w-4" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse p-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
              {!liveApiEnabled ? ' (sample data)' : ''}
            </p>

            {filteredTeachers.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredTeachers.map((teacher: any) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Music className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="mb-2 text-gray-500">No teachers match your filters.</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-200 p-6">
          <h3 className="text-xl font-semibold">Need help choosing?</h3>
          <p className="mt-2 text-sm text-gray-600">
            Take the onboarding assessment and get AI recommendations for teachers matched to your level and goals.
          </p>
          <Link href="/onboarding" className="btn-secondary mt-4 inline-block">
            Take Assessment
          </Link>
        </div>
      </div>
    </main>
  );
}
