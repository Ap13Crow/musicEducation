'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  User, Mail, MapPin, Music, Globe, Edit3, Save, X,
  Trophy, Flame, GraduationCap, Star, BookOpen, Lock,
  ExternalLink, CheckCircle, AlertCircle, Phone,
} from 'lucide-react';
import { externalLinks } from '@/lib/external-links';

const INSTRUMENTS = [
  'Piano', 'Violin', 'Viola', 'Cello', 'Guitar', 'Voice', 'Flute',
  'Clarinet', 'Oboe', 'Trumpet', 'Organ', 'Harp', 'Percussion', 'Composition', 'Theory',
];
const TIMEZONES = ['Europe/Zurich', 'Europe/Berlin', 'Europe/Paris', 'Europe/London', 'America/New_York', 'America/Los_Angeles'];

const GET_PROFILE = gql`
  query GetProfile {
    me {
      id email username displayName role avatarUrl
      profile {
        bio city country timezone
        instruments musicStyles onboardingDone
      }
      teacherProfile {
        headline teachingBio hourlyRate currency
        instruments isAvailable avgRating totalStudents
      }
      gamification {
        level xp totalPoints currentStreak skillLevel
      }
    }
    myBookings(page: 1, limit: 20) {
      id status instrument
      teacher {
        id headline avgRating
        user { displayName avatarUrl }
      }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id displayName
      profile {
        bio city country timezone instruments musicStyles
      }
    }
  }
`;

type EditState = {
  displayName: string;
  bio: string;
  city: string;
  country: string;
  timezone: string;
  instruments: string[];
  musicStyles: string;
};

const SKILL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner', ELEMENTARY: 'Elementary', INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced', PROFESSIONAL: 'Professional',
};
const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student', TEACHER: 'Teacher', ADMIN: 'Administrator', GUEST: 'Guest',
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('keycloak', { callbackUrl: '/profile' });
    }
  }, [status]);

  const { data, loading, refetch } = useQuery(GET_PROFILE, { skip: !liveApiEnabled });
  const [updateProfile, { loading: saving, error: saveError }] = useMutation(UPDATE_PROFILE);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edit, setEdit] = useState<EditState>({
    displayName: '', bio: '', city: '', country: '', timezone: 'Europe/Zurich',
    instruments: [], musicStyles: '',
  });

  const me = data?.me;
  const bookings = data?.myBookings ?? [];

  // Unique teachers the user has booked
  const myTeachers = Array.from(
    new Map(
      bookings
        .filter((b: any) => b.teacher)
        .map((b: any) => [b.teacher.id, b.teacher])
    ).values()
  );

  function startEdit() {
    setEdit({
      displayName: me?.displayName ?? session?.user?.name ?? '',
      bio: me?.profile?.bio ?? '',
      city: me?.profile?.city ?? '',
      country: me?.profile?.country ?? '',
      timezone: me?.profile?.timezone ?? 'Europe/Zurich',
      instruments: me?.profile?.instruments ?? [],
      musicStyles: (me?.profile?.musicStyles ?? []).join(', '),
    });
    setEditing(true);
    setSaved(false);
  }

  function toggleInstrument(inst: string) {
    setEdit(prev => ({
      ...prev,
      instruments: prev.instruments.includes(inst)
        ? prev.instruments.filter(i => i !== inst)
        : [...prev.instruments, inst],
    }));
  }

  async function handleSave() {
    try {
      await updateProfile({
        variables: {
          input: {
            displayName: edit.displayName || undefined,
            bio: edit.bio || undefined,
            city: edit.city || undefined,
            country: edit.country || undefined,
            timezone: edit.timezone || undefined,
            instruments: edit.instruments.length > 0 ? edit.instruments : undefined,
            musicStyles: edit.musicStyles
              ? edit.musicStyles.split(',').map(s => s.trim()).filter(Boolean)
              : undefined,
          },
        },
      });
      await refetch();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // saveError is shown inline
    }
  }

  // keycloakAccountUrl is unused — links use hardcoded production URL directly

  if (status === 'loading' || (liveApiEnabled && loading)) {
    return <ProfileSkeleton />;
  }
  if (status === 'unauthenticated') {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Redirecting to sign in…</div>;
  }

  const displayName = me?.displayName ?? session?.user?.name ?? 'Musician';
  const email = me?.email ?? session?.user?.email ?? '';
  const role = me?.role ?? (session as any)?.roles?.[0] ?? 'STUDENT';
  const gamification = me?.gamification;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt={displayName} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">{displayName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {ROLE_LABELS[role] ?? role}
                </span>
                {me?.profile?.instruments?.slice(0, 3).map((i: string) => (
                  <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{i}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> Saved
              </span>
            )}
            {!editing ? (
              <button onClick={startEdit} className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
                <Edit3 className="h-4 w-4" /> Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {saveError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveError.message}
          </div>
        )}

        {!liveApiEnabled && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Showing session data only. Connect to the live API to load and edit your full profile.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left column: personal info + instruments ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal information */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <User className="h-4 w-4 text-primary-600" /> Personal information
              </h2>
              <div className="space-y-4">
                <Field label="Full name" icon={<User className="h-4 w-4" />}
                  editing={editing} value={me?.displayName ?? displayName}
                  editNode={
                    <input className="input w-full" value={edit.displayName}
                      onChange={e => setEdit(p => ({ ...p, displayName: e.target.value }))} />
                  } />

                <Field label="Email address" icon={<Mail className="h-4 w-4" />}
                  value={email} editing={false}
                  editNode={<span className="text-sm text-gray-500">{email}</span>}
                  hint="Managed by your identity provider" />

                <Field label="Biography" icon={<Edit3 className="h-4 w-4" />}
                  editing={editing} value={me?.profile?.bio ?? '—'}
                  editNode={
                    <textarea className="input w-full" rows={3} value={edit.bio}
                      placeholder="Tell students a little about yourself…"
                      onChange={e => setEdit(p => ({ ...p, bio: e.target.value }))} />
                  } />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City" icon={<MapPin className="h-4 w-4" />}
                    editing={editing} value={me?.profile?.city ?? '—'}
                    editNode={
                      <input className="input w-full" value={edit.city}
                        placeholder="e.g. Zürich"
                        onChange={e => setEdit(p => ({ ...p, city: e.target.value }))} />
                    } />
                  <Field label="Country" icon={<Globe className="h-4 w-4" />}
                    editing={editing} value={me?.profile?.country ?? '—'}
                    editNode={
                      <input className="input w-full" value={edit.country}
                        placeholder="e.g. Switzerland"
                        onChange={e => setEdit(p => ({ ...p, country: e.target.value }))} />
                    } />
                </div>

                <Field label="Timezone" icon={<Globe className="h-4 w-4" />}
                  editing={editing} value={me?.profile?.timezone ?? 'Europe/Zurich'}
                  editNode={
                    <select className="input w-full" value={edit.timezone}
                      onChange={e => setEdit(p => ({ ...p, timezone: e.target.value }))}>
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  } />
              </div>
            </section>

            {/* Instruments */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Music className="h-4 w-4 text-primary-600" /> My instruments
              </h2>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map(inst => (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => toggleInstrument(inst)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        edit.instruments.includes(inst)
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(me?.profile?.instruments ?? []).length > 0
                    ? (me?.profile?.instruments ?? []).map((i: string) => (
                        <span key={i} className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">{i}</span>
                      ))
                    : <p className="text-sm text-gray-400">No instruments added yet.</p>
                  }
                </div>
              )}

              {editing && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Music styles (comma-separated)</label>
                  <input className="input w-full" value={edit.musicStyles}
                    placeholder="e.g. Classical, Baroque, Contemporary"
                    onChange={e => setEdit(p => ({ ...p, musicStyles: e.target.value }))} />
                </div>
              )}

              {!editing && (me?.profile?.musicStyles ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(me?.profile?.musicStyles ?? []).map((s: string) => (
                    <span key={s} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{s}</span>
                  ))}
                </div>
              )}
            </section>

            {/* My teachers */}
            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <BookOpen className="h-4 w-4 text-primary-600" /> My teachers
                </h2>
                <a href={externalLinks.booking} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
                  Book a lesson <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {myTeachers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">No teachers yet.</p>
                  <a href="/teachers" className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline">Browse teachers →</a>
                </div>
              ) : (
                <ul className="space-y-3">
                  {(myTeachers as any[]).map((t: any) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        {t.user?.avatarUrl
                          ? <img src={t.user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          : <User className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{t.user?.displayName}</p>
                        {t.headline && <p className="truncate text-xs text-gray-500">{t.headline}</p>}
                      </div>
                      {t.avgRating > 0 && (
                        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400" />{t.avgRating.toFixed(1)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ── Right column: stats + security ── */}
          <div className="space-y-6">

            {/* Progress & achievements */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Trophy className="h-4 w-4 text-amber-500" /> Progress
              </h2>
              {gamification ? (
                <div className="space-y-4">
                  <StatRow icon={<GraduationCap className="h-4 w-4 text-primary-500" />}
                    label="Level" value={gamification.level} />
                  <StatRow icon={<Star className="h-4 w-4 text-amber-500" />}
                    label="XP" value={gamification.xp.toLocaleString()} />
                  <StatRow icon={<Trophy className="h-4 w-4 text-amber-600" />}
                    label="Total points" value={gamification.totalPoints.toLocaleString()} />
                  <StatRow icon={<Flame className="h-4 w-4 text-orange-500" />}
                    label="Current streak" value={`${gamification.currentStreak} days`} />
                  <div className="pt-2">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Skill level</p>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                      {SKILL_LABELS[gamification.skillLevel] ?? gamification.skillLevel}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No progress data yet.</p>
              )}
            </section>

            {/* Security */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Lock className="h-4 w-4 text-gray-500" /> Security
              </h2>
              <div className="space-y-3">
                <a
                  href={`https://auth.mymusic.coach/realms/mymusic-coach/account/#/security/signingIn`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-400" /> Change password
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a
                  href={`https://auth.mymusic.coach/realms/mymusic-coach/account/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" /> Keycloak account settings
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Password, MFA, and linked accounts are managed via your identity provider.
              </p>
            </section>

            {/* Quick links to pillars */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Phone className="h-4 w-4 text-gray-500" /> My accounts
              </h2>
              <div className="space-y-2">
                <PillarLink href={externalLinks.learn} label="Moodle — courses" color="text-blue-600" />
                <PillarLink href={externalLinks.booking} label="LibreBooking — lessons" color="text-purple-600" />
                <PillarLink href={externalLinks.tickets} label="Pretix — tickets" color="text-amber-600" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, icon, value, editing, editNode, hint,
}: {
  label: string; icon: React.ReactNode; value: string;
  editing: boolean; editNode: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {icon} {label}
      </label>
      {editing
        ? editNode
        : <p className="text-sm text-gray-800">{value}</p>}
      {hint && !editing && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-600">{icon}{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function PillarLink({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm ${color} transition-colors hover:bg-gray-50`}>
      {label}
      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
    </a>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="card h-48 animate-pulse bg-gray-100" />)}
          </div>
          <div className="space-y-6">
            {[1, 2].map(i => <div key={i} className="card h-48 animate-pulse bg-gray-100" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
