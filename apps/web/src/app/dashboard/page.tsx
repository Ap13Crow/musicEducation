'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { BookOpen, CalendarDays, CheckCircle2, Music2, ShieldCheck, UserRound } from 'lucide-react';

const GET_PROFILE = gql`
  query GetProfileDashboard {
    me {
      id
      email
      displayName
      role
      isEmailVerified
      avatarUrl
      profile {
        bio
        city
        country
        instruments
        musicStyles
        onboardingDone
      }
      gamification {
        level
        xp
        totalPoints
        skillLevel
        currentStreak
      }
    }
  }
`;

type ProfileData = {
  me: null | {
    id: string;
    email: string;
    displayName: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    isEmailVerified: boolean;
    avatarUrl?: string | null;
    profile?: {
      bio?: string | null;
      city?: string | null;
      country?: string | null;
      instruments: string[];
      musicStyles: string[];
      onboardingDone: boolean;
    } | null;
    gamification?: {
      level: number;
      xp: number;
      totalPoints: number;
      skillLevel: string;
      currentStreak: number;
    } | null;
  };
};

export default function DashboardPage() {
  const { status } = useSession();
  const { data, loading, error, refetch } = useQuery<ProfileData>(GET_PROFILE, {
    skip: status !== 'authenticated',
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (status === 'unauthenticated') void signIn('keycloak', { callbackUrl: '/dashboard' });
  }, [status]);

  if (status === 'loading' || loading) return <DashboardLoading />;
  if (status === 'unauthenticated') return <CenteredMessage>Redirecting to your secure sign-in…</CenteredMessage>;
  if (error || !data?.me) {
    return (
      <CenteredMessage>
        <div className="max-w-md">
          <h1 className="font-serif text-2xl font-semibold text-gray-900">Your profile is almost ready</h1>
          <p className="mt-2 text-sm text-gray-600">
            We could not load the application profile. Your Keycloak account remains signed in.
          </p>
          <button className="btn-primary mt-5 rounded-lg px-4 py-2 text-sm" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </CenteredMessage>
    );
  }

  const me = data.me;
  const location = [me.profile?.city, me.profile?.country].filter(Boolean).join(', ');
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <UserRound className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Learning profile</p>
              <h1 className="font-serif text-3xl font-bold text-gray-900">{me.displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-700">{roleLabel(me.role)}</span>
                {location && <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{location}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-center shadow-sm">
            <Metric value={me.gamification?.level ?? 1} label="Level" />
            <Metric value={me.gamification?.xp ?? 0} label="XP" />
            <Metric value={me.gamification?.currentStreak ?? 0} label="Streak" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="font-serif text-2xl font-semibold text-gray-900">Your learning space</h2>
          <p className="mt-1 text-sm text-gray-600">The three pillars will meet here as your activity grows.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Pillar href="/teachers" icon={<Music2 />} title="Book a teacher" text="Find the right teacher and reserve a lesson." />
            <Pillar href="/courses" icon={<BookOpen />} title="Online courses" text="Learn at your pace and track progress." />
            <Pillar href="/events" icon={<CalendarDays />} title="Music events" text="Discover performances and workshops." />
          </div>
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-primary-500" />
            <h3 className="mt-3 font-semibold text-gray-900">Your account is connected</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-gray-600">
              This profile was created from your secure identity on first sign-in. Bookings, courses, progress and events will appear here.
            </p>
          </div>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Account</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <AccountRow label="Email" value={me.email} />
            <AccountRow label="Role" value={roleLabel(me.role)} />
            <AccountRow label="Skill level" value={me.gamification?.skillLevel ?? 'BEGINNER'} />
            <AccountRow label="Profile" value={me.profile?.onboardingDone ? 'Complete' : 'Ready to complete'} />
          </dl>
          <Link href="/profile" className="btn-primary mt-6 block rounded-lg px-4 py-2 text-center text-sm">Complete profile</Link>
        </aside>
      </div>
    </main>
  );
}

function Pillar({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">{icon}</div>
      <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-primary-700">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-gray-600">{text}</p>
    </Link>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div><p className="font-semibold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>;
}
function AccountRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 break-words font-medium text-gray-700">{value}</dd></div>;
}
function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[65vh] items-center justify-center px-6 text-center text-gray-600">{children}</div>;
}
function DashboardLoading() {
  return <div className="mx-auto max-w-6xl px-6 py-12"><div className="h-10 w-72 animate-pulse rounded bg-gray-200" /><div className="mt-8 grid gap-4 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}</div></div>;
}
function roleLabel(role: string) {
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'TEACHER') return 'Teacher';
  return 'Student';
}
