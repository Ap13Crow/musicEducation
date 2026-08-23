'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { Mail, User } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';

// Same underlying data as the workspace hub's "Booked sessions" list
// (myBookings, filtered to rows where the caller is the teacher) - this
// page just aggregates it per student instead of per session, which is
// what was actually missing: "I need other information about my students
// ... to finish from the online courses I manage" had nowhere to look
// across every booking at once.
//
// Bounded at 200 bookings, same as every other query in this codebase -
// not exhaustive for a teacher with more history than that (see the page
// copy below, which doesn't claim otherwise).
const GET = gql`
  query TeacherStudentRoster {
    me { id }
    myBookings(page: 1, limit: 200) {
      id status instrument startsAt format
      student { id displayName avatarUrl email }
    }
  }
`;

interface StudentSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  instruments: Set<string>;
  totalSessions: number;
  confirmedOrCompleted: number;
  nextSession: string | null;
}

function buildRoster(bookings: any[], meId: string | undefined): StudentSummary[] {
  const byStudent = new Map<string, StudentSummary>();
  const now = Date.now();
  for (const b of bookings) {
    if (!b.student?.id || b.student.id === meId || b.status === 'CANCELLED') continue;
    let entry = byStudent.get(b.student.id);
    if (!entry) {
      entry = {
        id: b.student.id,
        displayName: b.student.displayName,
        avatarUrl: b.student.avatarUrl,
        email: b.student.email,
        instruments: new Set(),
        totalSessions: 0,
        confirmedOrCompleted: 0,
        nextSession: null,
      };
      byStudent.set(b.student.id, entry);
    }
    if (b.instrument) entry.instruments.add(b.instrument);
    entry.totalSessions += 1;
    if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') entry.confirmedOrCompleted += 1;
    const startsAtMs = new Date(b.startsAt).getTime();
    if (startsAtMs > now && (b.status === 'CONFIRMED' || b.status === 'PENDING')) {
      if (!entry.nextSession || startsAtMs < new Date(entry.nextSession).getTime()) entry.nextSession = b.startsAt;
    }
  }
  // Students with an upcoming session first, then by most total sessions -
  // the two things a teacher actually scans this list for.
  return Array.from(byStudent.values()).sort((a, b) => {
    if (a.nextSession && b.nextSession) return new Date(a.nextSession).getTime() - new Date(b.nextSession).getTime();
    if (a.nextSession) return -1;
    if (b.nextSession) return 1;
    return b.totalSessions - a.totalSessions;
  });
}

// Split out from the default-exported page so the myBookings query only
// ever fires once RoleGate has actually authorized the viewer and rendered
// this as its children - RoleGate returns a loading/sign-in/restricted
// screen instead of {children} for anyone else, so React never mounts
// (and never runs the hooks of) a component it never renders. Calling
// useQuery directly in the page component instead - the previous shape -
// ran the query unconditionally before RoleGate's own check ever happened
// (Copilot review finding on PR #56).
function StudentRoster() {
  const { data, loading, error } = useQuery(GET, { fetchPolicy: 'cache-and-network' });
  const roster = buildRoster(data?.myBookings ?? [], data?.me?.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">My students</h1>
      <p className="mt-2 text-sm text-gray-600">
        Students from your {'≤'}200 most recent bookings, across every instrument - the roster your one-off
        "Booked sessions" list on the workspace page doesn&rsquo;t group by student.
      </p>

      {loading && <p className="mt-8 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">Failed to load students: {error.message}</p>}
      {!loading && !error && roster.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed p-6 text-sm text-gray-500">No students have booked a session with you yet.</p>
      )}

      <div className="mt-8 space-y-3">
        {roster.map((s) => (
          <div key={s.id} className="card flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-purple-600">
              {s.avatarUrl ? <img src={s.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{s.displayName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <Mail className="h-3 w-3" /> {s.email}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {s.instruments.size > 0 ? Array.from(s.instruments).join(', ') : 'No instrument on file'}
                {' · '}{s.totalSessions} session{s.totalSessions === 1 ? '' : 's'} booked
                {s.confirmedOrCompleted !== s.totalSessions ? ` (${s.confirmedOrCompleted} confirmed/completed)` : ''}
              </p>
            </div>
            {s.nextSession && (
              <div className="shrink-0 rounded-lg bg-primary-50 px-3 py-2 text-right">
                <p className="text-xs text-primary-600">Next session</p>
                <p className="text-sm font-medium text-primary-700">
                  {new Date(s.nextSession).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

export default function TeacherStudentsPage() {
  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher/students">
      <StudentRoster />
    </RoleGate>
  );
}
