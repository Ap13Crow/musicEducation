'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { BookOpen, Calendar, CalendarClock, CalendarPlus, CreditCard, Star, User, UserRoundCheck, Users } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';

const GET_TEACHER_BOOKINGS = gql`
  query TeacherBookings {
    me { id }
    myBookings(page: 1, limit: 20) {
      id status instrument startsAt format paymentId packagePurchaseId
      student { id displayName avatarUrl }
      teacher { hourlyRate }
    }
  }
`;
// Backend has supported this since Phase 4 (apps/api/src/resolvers/
// bookings.ts) - either party can cancel - but nothing in the UI ever
// called it ("the cancellation of bookings ... even from the teacher's side
// is also untouched", direct user feedback).
const CANCEL_BOOKING = gql`
  mutation TeacherCancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) { id status }
  }
`;
const CONFIRM_BOOKING = gql`
  mutation TeacherConfirmBooking($bookingId: ID!) {
    confirmBooking(bookingId: $bookingId) { id status }
  }
`;

function UpcomingSessions() {
  const { data, loading, error, refetch } = useQuery(GET_TEACHER_BOOKINGS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 10_000,
  });
  const [cancelBooking, { loading: cancelling }] = useMutation(CANCEL_BOOKING);
  const [confirmBooking, { loading: accepting }] = useMutation(CONFIRM_BOOKING);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const meId = data?.me?.id;
  // myBookings returns rows where the caller is either the student or the
  // teacher; a booked-with-me session is one where the student isn't me.
  const sessions = (data?.myBookings ?? [])
    .filter((b: any) => b.student?.id && b.student.id !== meId && b.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  async function handleCancel(bookingId: string) {
    if (!confirm('Cancel this lesson? The student will be notified.')) return;
    setActionError('');
    setCancellingId(bookingId);
    try {
      await cancelBooking({ variables: { bookingId } });
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not cancel this lesson.');
    } finally {
      setCancellingId(null);
    }
  }

  async function handleAccept(bookingId: string) {
    setActionError('');
    setAcceptingId(bookingId);
    try {
      await confirmBooking({ variables: { bookingId } });
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not accept this lesson.');
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900">
        <Calendar className="h-4 w-4 text-primary-600" /> Booked sessions
      </h2>
      {error && <p className="mt-3 text-sm text-red-600">Failed to load sessions: {error.message}</p>}
      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
      {!error && !loading && sessions.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">No students have booked a session with you yet.</p>
      )}
      {sessions.length > 0 && (
        <ul className="mt-4 space-y-3">
          {(sessions as any[]).map((b: any) => {
            const canAccept = Boolean(b.paymentId || b.packagePurchaseId || Number(b.teacher?.hourlyRate ?? 0) <= 0);
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 p-3">
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
                {b.status === 'PENDING' ? (canAccept ? 'AWAITING APPROVAL' : 'AWAITING PAYMENT') : b.status}
              </span>
              {b.status === 'PENDING' && canAccept && (
                <button
                  type="button"
                  disabled={accepting && acceptingId === b.id}
                  onClick={() => handleAccept(b.id)}
                  className="shrink-0 rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {accepting && acceptingId === b.id ? 'Accepting…' : 'Accept'}
                </button>
              )}
              {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                <button
                  type="button"
                  disabled={cancelling && cancellingId === b.id}
                  onClick={() => handleCancel(b.id)}
                  className="shrink-0 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  {cancelling && cancellingId === b.id ? 'Updating…' : b.status === 'PENDING' ? 'Decline' : 'Cancel'}
                </button>
              )}
              </li>
            );
          })}
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
          <WorkspaceCard href="/dashboard/teacher/profile" icon={<UserRoundCheck />} title="Teacher profile" text="Complete your public teaching profile, photo and instruments." />
          <WorkspaceCard href="/dashboard/teacher/availability" icon={<CalendarClock />} title="Lesson availability" text="Publish the recurring times students can book." />
          <WorkspaceCard href="/dashboard/teacher/students" icon={<Users />} title="My students" text="Your students from recent bookings, with contact info and upcoming sessions." />
          <WorkspaceCard href="/dashboard/teacher/reviews" icon={<Star />} title="Reviews" text="What students have said about your courses and events." />
          <WorkspaceCard href="/dashboard/teacher/content" icon={<BookOpen />} title="Theory studio" text="Create and publish native courses." />
          <WorkspaceCard href="/dashboard/teacher/content/performance" icon={<CalendarPlus />} title="Performance studio" text="Create and publish events." />
          <WorkspaceCard href="/dashboard/teacher/payouts" icon={<CreditCard />} title="Payouts" text="Connect Stripe to receive your share of sales." />
        </div>
        <div className="mx-auto max-w-6xl space-y-6 px-6 pb-10">
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
