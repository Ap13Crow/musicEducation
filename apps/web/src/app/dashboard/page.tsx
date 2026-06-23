'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { gql, useQuery } from '@apollo/client';
import {
  BookOpen, Music, Calendar, GraduationCap, Clock, Video, MapPin,
  Ticket, AlertCircle, ArrowRight, Trophy, Flame, ExternalLink,
  Shield, Users, Search,
} from 'lucide-react';
import { externalLinks, liveApiEnabled } from '@/lib/external-links';

const LEARN_URL = process.env.NEXT_PUBLIC_LEARN_URL ?? 'https://learn.mymusic.coach';
const API_BASE = (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql').replace(/\/graphql$/, '');

// NextAuth's session is augmented with Keycloak realm roles in the JWT/session
// callbacks (see app/api/auth/[...nextauth]/route.ts). Type it locally so we can
// read roles without an `any` cast.
type SessionWithRoles = {
  roles?: string[];
  user?: { name?: string | null; email?: string | null; image?: string | null };
};

// ── Dashboard data query ────────────────────────────────────────────
// Pulls everything the three-pillar overview needs in one round-trip. All
// fields below exist in the GraphQL schema (apps/api). When live API is
// disabled (NEXT_PUBLIC_ENABLE_LIVE_API !== 'true') we render typed fallback
// content instead so the page is never blank.
const GET_DASHBOARD = gql`
  query GetDashboard {
    me {
      id
      displayName
      role
      avatarUrl
      gamification { level xp currentStreak skillLevel }
      profile { city country instruments }
    }
    myEnrollments(page: 1, limit: 50) {
      nodes {
        id
        progress
        completedAt
        createdAt
        course { id slug title moodleCourseId endDate thumbnailUrl level instruments }
      }
    }
    myBookings(page: 1, limit: 50) {
      id
      startsAt
      endsAt
      durationMin
      format
      instrument
      status
      zoomJoinUrl
      teacher { id headline user { displayName avatarUrl } }
    }
    myEventBookings(page: 1, limit: 20) {
      id
      status
      event { id slug title startsAt venueName city country format thumbnailUrl }
    }
    events(page: 1, limit: 4) {
      nodes { id slug title startsAt venueName city country type format }
    }
  }
`;

function daysFromNowISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

// ── Typed fallback content ──────────────────────────────────────────
// Shown until the live API is reachable. Mirrors the query shape so the
// render path is identical whether data is live or static.
const fallback = {
  me: {
    displayName: 'Musician',
    role: 'STUDENT' as const,
    avatarUrl: null as string | null,
    gamification: { level: 3, xp: 1240, currentStreak: 5, skillLevel: 'INTERMEDIATE' },
    profile: { city: null as string | null, country: null as string | null, instruments: ['Piano'] },
  },
  myEnrollments: {
    nodes: [
      { id: 'f-e1', progress: 0.62, completedAt: null, createdAt: daysFromNowISO(-30), course: { id: 'c1', slug: 'piano-fundamentals', title: 'Piano Fundamentals for Classical Beginners', moodleCourseId: null, endDate: null, thumbnailUrl: null, level: 'BEGINNER', instruments: ['Piano'] } },
      { id: 'f-e2', progress: 0.18, completedAt: null, createdAt: daysFromNowISO(-15), course: { id: 'c2', slug: 'ear-training-core', title: 'Ear Training Core: Intervals, Chords & Dictation', moodleCourseId: null, endDate: null, thumbnailUrl: null, level: 'INTERMEDIATE', instruments: ['Theory'] } },
    ],
  },
  myBookings: [
    { id: 'f-b1', startsAt: daysFromNowISO(2), endsAt: daysFromNowISO(2), durationMin: 60, format: 'ZOOM', instrument: 'Piano', status: 'CONFIRMED', zoomJoinUrl: null, teacher: { id: 't1', headline: 'Piano specialist', user: { displayName: 'Anna Keller', avatarUrl: null } } },
    { id: 'f-b2', startsAt: daysFromNowISO(6), endsAt: daysFromNowISO(6), durationMin: 45, format: 'IN_PERSON', instrument: 'Violin', status: 'PENDING', zoomJoinUrl: null, teacher: { id: 't2', headline: 'Violin & chamber music', user: { displayName: 'Marco De Luca', avatarUrl: null } } },
  ],
  myEventBookings: [
    { id: 'f-eb1', status: 'CONFIRMED', event: { id: 'ev1', slug: 'spring-masterclass', title: 'Spring Piano Masterclass', startsAt: daysFromNowISO(10), venueName: 'Conservatory Hall', city: 'Zürich', country: 'CH', format: 'IN_PERSON', thumbnailUrl: null } },
  ],
  events: {
    nodes: [
      { id: 'ev2', slug: 'baroque-evening', title: 'Baroque Evening: Bach & Telemann', startsAt: daysFromNowISO(14), venueName: 'St. Peter Church', city: 'Zürich', country: 'CH', type: 'CONCERT', format: 'IN_PERSON' },
      { id: 'ev3', slug: 'online-theory-workshop', title: 'Online Workshop: Harmony Foundations', startsAt: daysFromNowISO(21), venueName: null, city: null, country: null, type: 'WORKSHOP', format: 'ONLINE' },
    ],
  },
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-50 text-red-700',
};

type ContentTab = 'courses' | 'teachers' | 'events';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<ContentTab>('courses');

  // Session guard: send unauthenticated visitors to Keycloak sign-in,
  // preserving /dashboard as the post-login return target.
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('keycloak', { callbackUrl: '/dashboard' });
    }
  }, [status]);

  const { data, loading } = useQuery(GET_DASHBOARD, { skip: !liveApiEnabled });

  if (status === 'loading' || (status === 'authenticated' && liveApiEnabled && loading)) {
    return <DashboardSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-gray-500">
        Redirecting to sign in…
      </div>
    );
  }

  const usingFallback = !liveApiEnabled || !data;

  const me = data?.me ?? fallback.me;
  const enrollments = data?.myEnrollments?.nodes ?? fallback.myEnrollments.nodes;
  const bookings = data?.myBookings ?? fallback.myBookings;
  const eventBookings = data?.myEventBookings ?? fallback.myEventBookings;
  const upcomingEvents = data?.events?.nodes ?? fallback.events.nodes;

  // Prefer the role from the Keycloak token (NextAuth session) so the badge
  // reflects realm roles even before the GraphQL profile loads.
  const sessionRoles: string[] = (session as SessionWithRoles | null)?.roles ?? [];
  const role = pickRole(sessionRoles) ?? me.role ?? 'STUDENT';
  const displayName = me.displayName ?? session?.user?.name ?? 'Musician';

  // Agenda = lessons + booked events + enrollments, merged and sorted by start time or created time.
  const agenda = [
    ...bookings.map((b: any) => ({
      id: b.id, kind: 'lesson' as const, startsAt: b.startsAt, status: b.status,
      title: `${b.instrument ?? 'Lesson'} with ${b.teacher?.user?.displayName ?? 'teacher'}`,
      format: b.format, joinUrl: b.zoomJoinUrl,
    })),
    ...eventBookings.map((eb: any) => ({
      id: eb.id, kind: 'event' as const, startsAt: eb.event?.startsAt, status: eb.status,
      title: eb.event?.title ?? 'Event', format: eb.event?.format, joinUrl: null,
    })),
    ...enrollments.map((e: any) => ({
      id: e.id, kind: 'course' as const, startsAt: e.createdAt, status: e.completedAt ? 'COMPLETED' : 'IN_PROGRESS',
      title: `Enrolled: ${e.course?.title ?? 'Course'}`, format: 'ONLINE', joinUrl: `/courses/${e.course?.slug}`,
    })),
  ]
    .filter((a) => a.startsAt)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Welcome back</p>
              <h1 className="font-serif text-3xl font-bold text-gray-900">{displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 font-medium text-primary-700">
                  {roleLabel(role)}
                </span>
                {me.profile?.instruments?.slice(0, 3).map((i: string) => (
                  <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600">{i}</span>
                ))}
              </div>
            </div>
            {me.gamification && (
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <Stat icon={<Trophy className="h-4 w-4 text-amber-500" />} label="Level" value={me.gamification.level} />
                <Stat icon={<GraduationCap className="h-4 w-4 text-primary-500" />} label="XP" value={me.gamification.xp} />
                <Stat icon={<Flame className="h-4 w-4 text-orange-500" />} label="Streak" value={`${me.gamification.currentStreak}d`} />
              </div>
            )}
          </div>

          {usingFallback && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Showing example data. Set <code>NEXT_PUBLIC_ENABLE_LIVE_API=true</code> (and ensure the
                GraphQL API at <code>api.mymusic.coach</code> is reachable) to load your real courses,
                agenda and tickets.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex gap-0 rounded-xl border border-gray-200 bg-white p-1 w-fit">
          <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
            <BookOpen className="h-4 w-4" /> Courses
          </TabButton>
          <TabButton active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')}>
            <Users className="h-4 w-4" /> {role === 'TEACHER' ? 'Students' : 'Teachers'}
          </TabButton>
          <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
            <Ticket className="h-4 w-4" /> Events
          </TabButton>
        </div>

        {activeTab === 'courses' && (
          <CoursesTabContent enrollments={enrollments} />
        )}
        {activeTab === 'teachers' && (
          <TeachersTabContent bookings={bookings} role={role} />
        )}
        {activeTab === 'events' && (
          <EventsTabContent eventBookings={eventBookings} />
        )}

        {/* Agenda */}
        <section className="mt-8 card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Calendar className="h-4 w-4 text-primary-600" /> Your agenda
            </h2>
            <span className="text-xs text-gray-400">Lessons & booked events</span>
          </div>
          {agenda.length === 0 ? (
            <EmptyState text="Nothing scheduled yet." cta={{ href: '/teachers', label: 'Book a lesson' }} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {agenda.map((a) => (
                <li key={`${a.kind}-${a.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.kind === 'lesson' ? 'bg-purple-50 text-purple-600' : a.kind === 'event' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {a.kind === 'lesson' ? <Music className="h-4 w-4" /> : a.kind === 'event' ? <Ticket className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(a.startsAt)}</p>
                    </div>
                  </div>
                  {a.status && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* My Availability quick-link */}
        <section className="mt-4 card p-5 flex items-center gap-4">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
              <Clock className="h-4 w-4 text-primary-600" /> My Availability
            </h2>
            <p className="text-xs text-gray-500">Let your teacher know when you're free.</p>
          </div>
          <Link
            href="/dashboard/availability"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 shrink-0"
          >
            <Calendar className="h-4 w-4" /> Set availability <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Upcoming / recommended events */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming events</h2>
            <Link href="/events" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState text="No upcoming events." cta={{ href: '/events', label: 'Discover events' }} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((ev: any) => (
                <Link key={ev.id} href={`/events/${ev.slug}`} className="card group p-4 transition-colors hover:border-primary-300">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-amber-600">{ev.type}</span>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-primary-600">{ev.title}</h3>
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(ev.startsAt)}</p>
                    <p className="flex items-center gap-1">
                      {ev.format === 'ONLINE' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {ev.venueName ?? ev.city ?? (ev.format === 'ONLINE' ? 'Online' : 'TBA')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Admin quick-links — only shown to ADMIN role users */}
        {role === 'ADMIN' && (
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              <h2 className="font-semibold text-gray-900">Administration</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AdminLink
                href="/admin"
                label="Admin Portal"
                description="Users, content & integrations"
                accent="bg-primary-50 text-primary-600"
                icon={<Shield className="h-4 w-4" />}
              />
              <PretixAdminButton session={session} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Presentational helpers ──────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function CoursesTabContent({ enrollments }: { enrollments: any[] }) {
  if (enrollments.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState text="Not enrolled in any courses yet." cta={{ href: '/courses', label: 'Browse courses' }} />
      </div>
    );
  }
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-left">Enrolled</th>
              <th className="px-4 py-3 text-left">Ends</th>
              <th className="px-4 py-3 text-left">Progress</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                  <span className="line-clamp-2">{e.course?.title}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {e.course?.endDate ? new Date(e.course.endDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.round((e.progress ?? 0) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{Math.round((e.progress ?? 0) * 100)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {e.course?.moodleCourseId ? (
                    <a
                      href={`${LEARN_URL}/course/view.php?id=${e.course.moodleCourseId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Go to Course <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={`/courses/${e.course?.slug ?? ''}`}
                      className="text-xs font-medium text-primary-600 hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-end">
        <Link href="/courses" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
          Browse all courses <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function TeachersTabContent({ bookings, role }: { bookings: any[]; role: string }) {
  if (role === 'TEACHER' || role === 'ADMIN') {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <p className="mb-4 text-sm text-gray-500">
          Your enrolled students are managed in the booking platform.
        </p>
        {externalLinks.booking && (
          <a
            href={externalLinks.booking}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
          >
            <GraduationCap className="h-4 w-4" /> Open booking platform <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  // Group bookings by teacher
  const teacherMap: Record<string, { id: string; user: { displayName: string; avatarUrl: string | null }; headline: string | null; count: number }> = {};
  for (const b of bookings) {
    if (!b.teacher?.id) continue;
    if (!teacherMap[b.teacher.id]) {
      teacherMap[b.teacher.id] = { ...b.teacher, count: 0 };
    }
    teacherMap[b.teacher.id].count++;
  }
  const teachers = Object.values(teacherMap);

  if (teachers.length === 0) {
    return <EmptyState text="No lessons booked yet." cta={{ href: '/teachers', label: 'Find a teacher' }} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teachers.map((t: any) => (
        <div key={t.id} className="card flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
            {t.user?.displayName?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{t.user?.displayName}</p>
            {t.headline && <p className="text-xs text-gray-500 truncate">{t.headline}</p>}
            <p className="text-xs text-primary-600">{t.count} lesson{t.count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventsTabContent({ eventBookings }: { eventBookings: any[] }) {
  if (eventBookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <p className="mb-4 text-sm text-gray-500">No tickets booked yet.</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Search className="h-4 w-4" /> Discover events <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {eventBookings.map((eb: any) => (
        <div key={eb.id} className="card flex items-center gap-4 p-4">
          <Ticket className="h-8 w-8 shrink-0 text-amber-500" />
          <div className="flex-1 min-w-0">
            <Link href={`/events/${eb.event?.slug ?? ''}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">
              {eb.event?.title}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(eb.event?.startsAt)}</span>
              {eb.event?.venueName && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{eb.event.venueName}</span>}
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[eb.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {eb.status}
          </span>
        </div>
      ))}
      <div className="mt-2 flex justify-end">
        <Link href="/events" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
          Discover more events <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PretixAdminButton({ session }: { session: any }) {
  const [loading, setLoading] = useState(false);

  async function openPretix() {
    setLoading(true);
    try {
      const token = (session as any)?.accessToken;
      const res = await fetch(`${API_BASE}/pretix-sso-link`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to get SSO link');
      const { url } = await res.json();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open('https://tickets.mymusic.coach/control/', '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openPretix}
      disabled={loading}
      className="card flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-primary-300 disabled:opacity-60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <Ticket className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{loading ? 'Opening…' : 'Pretix Admin'}</p>
        <p className="truncate text-xs text-gray-500">Tickets & events (SSO)</p>
      </div>
      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-400" />
    </button>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-900">
        {icon}{value}
      </div>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function EmptyState({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
      <p className="text-sm text-gray-500">{text}</p>
      {cta && (
        <Link href={cta.href} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
          {cta.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-8 w-56 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-56 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminLink({
  href, label, description, accent, icon,
}: {
  href?: string; label: string; description: string; accent: string; icon: React.ReactNode;
}) {
  const inner = (
    <div className="card flex items-center gap-3 p-4 transition-colors hover:border-primary-300">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="truncate text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-400" />
    </div>
  );

  if (!href) {
    return (
      <div className="opacity-50 cursor-not-allowed" title="URL not configured">
        {inner}
      </div>
    );
  }

  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href}>
      {inner}
    </Link>
  );
}

function pickRole(roles: string[]): string | null {
  const order = ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'];
  const upper = roles.map((r) => r.toUpperCase());
  return order.find((r) => upper.includes(r)) ?? null;
}

function roleLabel(role: string): string {
  switch (role.toUpperCase()) {
    case 'ADMIN': return 'Administrator';
    case 'TEACHER': return 'Teacher';
    case 'STUDENT': return 'Student';
    default: return 'Member';
  }
}
