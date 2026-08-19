'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { BookOpen, Calendar, CalendarClock, CalendarPlus, CreditCard, User, UserRoundCheck, Video } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';
import { toYouTubeEmbedUrl } from '@/lib/youtube';

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

const GET_PUBLIC_PROFILE = gql`
  query TeacherPublicProfileSettings {
    me {
      id
      teacherProfile { id headline teachingBio specializations introVideoUrl introVideoVisible }
    }
  }
`;
const UPDATE_TEACHER_PROFILE = gql`
  mutation UpdateTeacherProfilePublicFields($headline: String, $teachingBio: String, $specializations: [String!], $introVideoVisible: Boolean) {
    updateTeacherProfile(headline: $headline, teachingBio: $teachingBio, specializations: $specializations, introVideoVisible: $introVideoVisible) {
      id headline teachingBio specializations introVideoUrl introVideoVisible
    }
  }
`;

function PublicProfileSettings() {
  const { data, loading } = useQuery(GET_PUBLIC_PROFILE, { fetchPolicy: 'cache-and-network' });
  const [update, { loading: saving }] = useMutation(UPDATE_TEACHER_PROFILE);
  const profile = data?.me?.teacherProfile;
  const [form, setForm] = useState({ headline: '', teachingBio: '', specializations: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      headline: profile.headline ?? '',
      teachingBio: profile.teachingBio ?? '',
      specializations: (profile.specializations ?? []).join(', '),
    });
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await update({
      variables: {
        headline: form.headline.trim() || null,
        teachingBio: form.teachingBio.trim() || null,
        specializations: form.specializations.split(',').map((s) => s.trim()).filter(Boolean),
      },
    });
    setSaved(true);
  }

  async function toggleVideoVisible() {
    await update({ variables: { introVideoVisible: !profile.introVideoVisible } });
  }

  if (loading && !data) return null;

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900">
        <UserRoundCheck className="h-4 w-4 text-primary-600" /> Public teacher profile
      </h2>
      <p className="mt-1 text-sm text-gray-500">What students see on your profile page — your name and photo come from your account settings.</p>
      <form onSubmit={save} className="mt-4 space-y-3">
        <label className="block text-sm font-medium">
          Headline
          <input className="input mt-1 w-full" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">
          Self-presentation
          <textarea rows={4} className="input mt-1 w-full" value={form.teachingBio} onChange={(e) => setForm({ ...form, teachingBio: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">
          Specializations
          <input className="input mt-1 w-full" placeholder="Jazz, Classical, Music theory…" value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
        </label>
        <div className="flex items-center gap-3">
          <button disabled={saving} className="btn-primary rounded-lg px-4 py-2 text-sm">{saving ? 'Saving…' : 'Save'}</button>
          {saved && <span className="text-xs text-green-700">Saved.</span>}
        </div>
      </form>

      {profile?.introVideoUrl && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="flex items-center gap-2 text-sm font-medium"><Video className="h-4 w-4" /> Presentation video</h3>
          {toYouTubeEmbedUrl(profile.introVideoUrl) && (
            <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-gray-900">
              <iframe className="h-full w-full" src={toYouTubeEmbedUrl(profile.introVideoUrl)!} title="Your presentation video" allowFullScreen />
            </div>
          )}
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(profile.introVideoVisible)} onChange={() => void toggleVideoVisible()} />
            Show this video on my public profile
          </label>
        </div>
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
          <WorkspaceCard href="/dashboard/teacher/payouts" icon={<CreditCard />} title="Payouts" text="Connect Stripe to receive your share of sales." />
        </div>
        <div className="mx-auto max-w-6xl space-y-6 px-6 pb-10">
          <PublicProfileSettings />
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
