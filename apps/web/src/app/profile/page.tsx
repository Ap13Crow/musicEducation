'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  User, Mail, MapPin, Music, Globe, Edit3, Save, X,
  Trophy, Flame, GraduationCap, Star, Lock,
  ExternalLink, CheckCircle, AlertCircle, Phone, ImagePlus, Calendar,
} from 'lucide-react';
import { externalLinks, keycloakAccountUrl, keycloakAdminUrl, keycloakSigningInUrl } from '@/lib/external-links';

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
        instruments isAvailable avgRating
      }
      gamification {
        level xp totalPoints currentStreak skillLevel
      }
      enrollments(limit: 20) {
        nodes {
          id progress completedAt createdAt
          course { id slug title thumbnailUrl status }
        }
      }
    }
    myBookings(page: 1, limit: 20) {
      id status instrument startsAt endsAt format
      teacher {
        id headline avgRating
        user { id displayName avatarUrl }
      }
    }
    myAssessments {
      id completedAt skillLevel xpAwarded
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

  const { data, loading, error: profileError, refetch } = useQuery(GET_PROFILE, {
    skip: !liveApiEnabled,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const [updateProfile, { loading: saving, error: saveError }] = useMutation(UPDATE_PROFILE);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [edit, setEdit] = useState<EditState>({
    displayName: '', bio: '', city: '', country: '', timezone: 'Europe/Zurich',
    instruments: [], musicStyles: '',
  });

  const me = data?.me;
  const bookings = data?.myBookings ?? [];
  const enrollments = me?.enrollments?.nodes ?? [];
  const latestAssessment = [...(data?.myAssessments ?? [])]
    .filter((a: any) => a.completedAt)
    .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0] ?? null;

  // Booked sessions with a teacher, soonest first, excluding cancelled ones.
  // myBookings returns both "sessions I booked as a student" AND, when the
  // viewer is themselves a teacher, "sessions students booked with me" (see
  // myBookings in bookings.ts) - the latter's `teacher` field always
  // resolves to the viewer's own TeacherProfile, which without this filter
  // rendered as what looked exactly like a session booked with yourself.
  // This section is the student view only; a teacher's own dashboard has
  // the incoming-bookings list.
  const mySessions = [...bookings]
    .filter((b: any) => b.teacher && b.teacher.user?.id !== me?.id && b.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

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

  async function uploadPhoto(file?: File) {
    if (!file) return;
    setPhotoError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 500_000) {
      setPhotoError('Choose a JPEG, PNG, or WebP image smaller than 500 KB.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the image.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Photo upload failed.');
      await refetch();
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
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
      const musicStyles = edit.musicStyles.split(',').map(s => s.trim()).filter(Boolean);
      const result = await updateProfile({
        variables: {
          input: {
            displayName: edit.displayName.trim() || null,
            bio: edit.bio.trim() || null,
            city: edit.city.trim() || null,
            country: edit.country.trim() || null,
            timezone: edit.timezone,
            instruments: edit.instruments,
            musicStyles,
          },
        },
      });
      const persisted = result.data?.updateProfile;
      if (!persisted?.profile) throw new Error('The API did not confirm the profile update.');

      setEditing(false);
      setSaved(true);
      await refetch();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // saveError is shown inline
    }
  }

  if (status === 'loading' || (liveApiEnabled && loading)) {
    return <ProfileSkeleton />;
  }
  if (status === 'unauthenticated') {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Redirecting to sign in…</div>;
  }

  const displayName = me?.displayName ?? session?.user?.name ?? 'Musician';
  const email = me?.email ?? session?.user?.email ?? '';
  const role = me?.role ?? session?.roles?.[0] ?? 'STUDENT';
  const gamification = me?.gamification;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700">
                {me?.avatarUrl ? (
                  <img src={me.avatarUrl} alt={displayName} className="h-16 w-16 object-cover" />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow" title="Upload profile photo">
                <ImagePlus className="h-4 w-4" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingPhoto}
                  onChange={event => void uploadPhoto(event.target.files?.[0])} />
              </label>
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

      {photoError && (
        <div className="mx-auto mt-4 max-w-4xl px-6">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {photoError}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {(saveError || profileError) && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveError?.message ?? profileError?.message}
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

            {/* My booked sessions */}
            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Calendar className="h-4 w-4 text-primary-600" /> My booked sessions
                </h2>
                <a href={externalLinks.booking}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
                  Book a lesson <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {mySessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">No sessions booked yet.</p>
                  <a href="/teachers" className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline">Browse teachers →</a>
                </div>
              ) : (
                <ul className="space-y-3">
                  {(mySessions as any[]).map((b: any) => (
                    <li key={b.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        {b.teacher?.user?.avatarUrl
                          ? <img src={b.teacher.user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          : <User className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{b.teacher?.user?.displayName}</p>
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

            {/* My courses */}
            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <GraduationCap className="h-4 w-4 text-primary-600" /> My courses
                </h2>
                <a href={externalLinks.learn}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
                  Browse courses <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {enrollments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">No courses yet.</p>
                  <a href="/courses" className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline">Browse courses →</a>
                </div>
              ) : (
                <ul className="space-y-3">
                  {(enrollments as any[]).map((e: any) => {
                    const pct = Math.round((e.progress ?? 0) * 100);
                    const isComplete = Boolean(e.completedAt);
                    return (
                      <li key={e.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between gap-3">
                          {e.course?.slug ? (
                            <a href={`/courses/${e.course.slug}`} className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 hover:text-primary-700">
                              {e.course?.title ?? 'Course'}
                            </a>
                          ) : (
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                              {e.course?.title ?? 'Course'}
                            </span>
                          )}
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            isComplete ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {isComplete ? 'Completed' : 'In progress'}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {pct}% complete
                          {isComplete && e.completedAt ? ` · finished ${new Date(e.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}` : ''}
                        </p>
                      </li>
                    );
                  })}
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

            {/* My evaluation - the onboarding assessment is a one-time
                introductory evaluation, not something retaken on every
                visit (see /onboarding), so its result lives here as part
                of ongoing evolution tracking rather than disappearing. */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Star className="h-4 w-4 text-amber-500" /> My evaluation
              </h2>
              {latestAssessment ? (
                <div className="space-y-2">
                  <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                    {latestAssessment.skillLevel}
                  </span>
                  <p className="text-xs text-gray-500">
                    Completed {new Date(latestAssessment.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    {typeof latestAssessment.xpAwarded === 'number' ? ` · +${latestAssessment.xpAwarded} XP` : ''}
                  </p>
                  <a href="/onboarding" className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline">View details →</a>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-400">You haven&rsquo;t completed the introductory evaluation yet.</p>
                  <a href="/onboarding" className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline">Take the assessment →</a>
                </div>
              )}
            </section>

            {/* Security */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Lock className="h-4 w-4 text-gray-500" /> Security
              </h2>
              <div className="space-y-3">
                <a
                  href={keycloakSigningInUrl}
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
                  href={keycloakAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" /> Keycloak account settings
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                {role === 'ADMIN' && (
                  <a
                    href={keycloakAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Keycloak realm administration
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Password, MFA, and linked accounts are managed via your identity provider.
              </p>
            </section>

            {/* Quick links to pillars */}
            <section className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Phone className="h-4 w-4 text-gray-500" /> Quick links
              </h2>
              <div className="space-y-2">
                <PillarLink href={externalLinks.learn} label="Browse courses" color="text-blue-600" />
                <PillarLink href={externalLinks.booking} label="Find a teacher" color="text-purple-600" />
                <PillarLink href={externalLinks.tickets} label="Upcoming events" color="text-amber-600" />
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

function PillarLink({ href, label, color }: { href?: string; label: string; color: string }) {
  if (!href) return null;
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
