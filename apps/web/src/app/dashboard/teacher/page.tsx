'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { BookOpen, Calendar, CalendarClock, CalendarPlus, User, UserRoundCheck } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';

const GET_TEACHER_BOOKINGS = gql`
  query TeacherBookings {
    me { id }
    myBookings(page: 1, limit: 20) {
      id status instrument startsAt format
      student { id displayName avatarUrl }
    }
  }
`;

function UpcomingSessions() {
  const { data, loading, error } = useQuery(GET_TEACHER_BOOKINGS, { fetchPolicy: 'cache-and-network' });
  const meId = data?.me?.id;
  // myBookings returns rows where the caller is either the student or the
  // teacher; a booked-with-me session is one where the student isn't me.
  const sessions = (data?.myBookings ?? [])
    .filter((b: any) => b.student?.id && b.student.id !== meId && b.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900">
        <Calendar className="h-4 w-4 text-primary-600" /> Booked sessions
      </h2>
      {error && <p className="mt-3 text-sm text-red-600">Failed to load sessions: {error.message}</p>}
      {!error && !loading && sessions.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">No students have booked a session with you yet.</p>
      )}
      {sessions.length > 0 && (
        <ul className="mt-4 space-y-3">
          {(sessions as any[]).map((b: any) => (
            <li key={b.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                {b.student?.avatarUrl
                  ? <img src={b.student.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  : <User className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{b.student?.displayName}</p>
                <p className="truncate text-xs text-gray-500">
                  {new Date(b.startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  {b.instrument ? ` · ${b.instrument}` : ''} · {b.format}
                </p>
              </div>
              <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                b.status === 'CONFIRMED' ? 'bg-green-50 text-green-700'
                : b.status === 'PENDING' ? 'bg-amber-50 text-amber-700'
                : b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function TeacherWorkspacePage() {
  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher">
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <Link href="/dashboard" className="text-sm text-primary-700">← Dashboard</Link>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary-600">Teacher workspace</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Build your teaching practice</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Set up the profile and availability that will power lessons, courses and events as each pillar comes online.
            </p>
          </div>
        </section>
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-4">
          <WorkspaceCard href="/dashboard/profile" icon={<UserRoundCheck />} title="Teacher profile" text="Complete your public teaching profile and instruments." />
          <WorkspaceCard href="/dashboard/teacher/availability" icon={<CalendarClock />} title="Lesson availability" text="Publish the recurring times students can book." />
          <WorkspaceCard href="/dashboard/teacher/content" icon={<BookOpen />} title="Theory studio" text="Create and publish native courses." />
          <WorkspaceCard href="/dashboard/teacher/content/performance" icon={<CalendarPlus />} title="Performance studio" text="Create and publish events." />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <UpcomingSessions />
        </div>
      </main>
    </RoleGate>
  );
}

function WorkspaceCard({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="card p-6 transition hover:-translate-y-0.5 hover:border-primary-300">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">{icon}</div>
      <h2 className="mt-4 font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{text}</p>
    </Link>
  );
}
