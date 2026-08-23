'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Award, BookOpen, Calendar, MapPin, Star, UserRoundCheck, Users as UsersIcon, Video } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';
import { toYouTubeEmbedUrl } from '@/lib/youtube';
import { resizeImageToDataUrl } from '@/lib/upload';
import { membershipLabel } from '@/lib/membership';

const INSTRUMENTS = ['Piano', 'Violin', 'Viola', 'Cello', 'Guitar', 'Voice', 'Flute', 'Clarinet', 'Oboe', 'Trumpet', 'Organ', 'Harp', 'Percussion', 'Composition', 'Theory'];
const FORMATS: { value: string; label: string }[] = [
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const GET = gql`
  query TeacherProfessionalProfile {
    me {
      id
      profile { city country }
      teacherProfile {
        id headline teachingBio hourlyRate currency instruments specializations teachingFormats
        isAvailable publicImageUrl introVideoUrl introVideoVisible avgRating totalReviews
        memberSince distinctStudentCount publishedResourceCount
        leadDays cancellationDays autoApproveNewStudents autoApproveRecurringStudents
        instrumentCapacities { id instrument maxActiveStudents activeStudentCount remainingCapacity }
      }
    }
    myBookings(page: 1, limit: 100) {
      id status
    }
  }
`;
const UPDATE = gql`
  mutation UpdateTeacherProfessionalProfile(
    $headline: String, $teachingBio: String, $hourlyRate: Float, $instruments: [String!]
    $specializations: [String!], $teachingFormats: [String!], $isAvailable: Boolean
    $introVideoVisible: Boolean, $publicImageUrl: String
  ) {
    updateTeacherProfile(
      headline: $headline, teachingBio: $teachingBio, hourlyRate: $hourlyRate, instruments: $instruments
      specializations: $specializations, teachingFormats: $teachingFormats, isAvailable: $isAvailable
      introVideoVisible: $introVideoVisible, publicImageUrl: $publicImageUrl
    ) {
      id headline teachingBio hourlyRate instruments specializations teachingFormats isAvailable
      publicImageUrl introVideoUrl introVideoVisible
    }
  }
`;
const UPDATE_POLICY = gql`
  mutation UpdateTeacherBookingPolicy($leadDays: Int, $cancellationDays: Int, $autoApproveNewStudents: Boolean, $autoApproveRecurringStudents: Boolean) {
    updateTeacherProfile(leadDays: $leadDays, cancellationDays: $cancellationDays, autoApproveNewStudents: $autoApproveNewStudents, autoApproveRecurringStudents: $autoApproveRecurringStudents) {
      id leadDays cancellationDays autoApproveNewStudents autoApproveRecurringStudents
    }
  }
`;
const SET_INSTRUMENT_CAPACITY = gql`
  mutation SetTeacherInstrumentCapacity($instrument: String!, $maxActiveStudents: Int) {
    setInstrumentCapacity(instrument: $instrument, maxActiveStudents: $maxActiveStudents) {
      id instrument maxActiveStudents activeStudentCount remainingCapacity
    }
  }
`;

export default function TeacherProfessionalProfilePage() {
  const { data, loading, error, refetch } = useQuery(GET, { fetchPolicy: 'cache-and-network' });
  const [update, { loading: saving }] = useMutation(UPDATE);
  const [updatePolicy, { loading: savingPolicy, error: policyError }] = useMutation(UPDATE_POLICY);
  const [setCapacity, { loading: savingCapacity }] = useMutation(SET_INSTRUMENT_CAPACITY);
  const [policyDraft, setPolicyDraft] = useState({ leadDays: '1', cancellationDays: '2' });
  const [capacityDraft, setCapacityDraft] = useState<{ instrument: string; maxActiveStudents: string }>({ instrument: '', maxActiveStudents: '' });
  const profile = data?.me?.teacherProfile;
  const account = data?.me?.profile;

  const [form, setForm] = useState({ headline: '', teachingBio: '', hourlyRate: '', currency: 'CHF', specializations: '' });
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      headline: profile.headline ?? '',
      teachingBio: profile.teachingBio ?? '',
      hourlyRate: profile.hourlyRate != null ? String(profile.hourlyRate) : '',
      currency: profile.currency ?? 'CHF',
      specializations: (profile.specializations ?? []).join(', '),
    }));
    setSelectedInstruments(profile.instruments ?? []);
    setSelectedFormats(profile.teachingFormats ?? []);
    setPolicyDraft({ leadDays: String(profile.leadDays ?? 1), cancellationDays: String(profile.cancellationDays ?? 2) });
  }, [profile]);

  async function savePolicy(e: React.FormEvent) {
    e.preventDefault();
    await updatePolicy({ variables: { leadDays: Number(policyDraft.leadDays), cancellationDays: Number(policyDraft.cancellationDays) } });
    await refetch();
  }
  async function toggleAutoApproveNew() {
    await updatePolicy({ variables: { autoApproveNewStudents: !profile.autoApproveNewStudents } });
    await refetch();
  }
  async function toggleAutoApproveRecurring() {
    await updatePolicy({ variables: { autoApproveRecurringStudents: !profile.autoApproveRecurringStudents } });
    await refetch();
  }
  async function saveCapacity(e: React.FormEvent) {
    e.preventDefault();
    if (!capacityDraft.instrument.trim()) return;
    const maxActiveStudents = capacityDraft.maxActiveStudents.trim() === '' ? null : Number(capacityDraft.maxActiveStudents);
    await setCapacity({ variables: { instrument: capacityDraft.instrument.trim(), maxActiveStudents } });
    setCapacityDraft({ instrument: '', maxActiveStudents: '' });
    await refetch();
  }

  function toggleInstrument(inst: string) {
    setSelectedInstruments((prev) => (prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]));
  }
  function toggleFormat(fmt: string) {
    setSelectedFormats((prev) => (prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await update({
      variables: {
        headline: form.headline.trim() || null,
        teachingBio: form.teachingBio.trim() || null,
        hourlyRate: form.hourlyRate.trim() ? Number(form.hourlyRate) : null,
        instruments: selectedInstruments,
        specializations: form.specializations.split(',').map((s) => s.trim()).filter(Boolean),
        teachingFormats: selectedFormats,
      },
    });
    setSaved(true);
  }

  async function toggleAvailable() {
    await update({ variables: { isAvailable: !profile.isAvailable } });
    await refetch();
  }
  async function toggleVideoVisible() {
    await update({ variables: { introVideoVisible: !profile.introVideoVisible } });
    await refetch();
  }

  async function uploadImage(file: File) {
    setImageError(null);
    setImageUploading(true);
    try {
      // Same mechanism as the personal account avatar (POST /profile/avatar)
      // and the become-teacher wizard's photo step: resized/compressed
      // in-browser, then saved straight to Postgres via its own small REST
      // endpoint - not routed through updateTeacherProfile/GraphQL or S3.
      const publicImageUrl = await resizeImageToDataUrl(file);
      const res = await fetch('/api/teacher/photo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ publicImageUrl }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? 'Upload failed.');
      await refetch();
    } catch (err: any) {
      setImageError(err?.message ?? 'Upload failed.');
    }
    setImageUploading(false);
  }
  async function removeImage() {
    await update({ variables: { publicImageUrl: null } });
    await refetch();
  }

  const bookings: any[] = data?.myBookings ?? [];
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const upcomingCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher/profile">
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary-600">Teacher profile</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Your professional profile</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              What students see on your public directory card and profile page — separate from your general account
              settings.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {loading && !data && <p className="text-sm text-gray-500">Loading…</p>}
          {error && <p className="text-sm text-red-600">Failed to load your profile: {error.message}</p>}

          {profile && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {/* Public image */}
                <section className="card p-6">
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                    <UserRoundCheck className="h-4 w-4 text-primary-600" /> Public teacher photo
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Shown to guests and students on your directory card and public profile — separate from your
                    account picture in general settings.
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {profile.publicImageUrl ? (
                        <img src={profile.publicImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400">No photo</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="btn-secondary inline-block w-fit cursor-pointer rounded-lg px-4 py-2 text-sm">
                        {profile.publicImageUrl ? 'Change photo' : 'Add a photo'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          disabled={imageUploading}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); e.target.value = ''; }}
                        />
                      </label>
                      {profile.publicImageUrl && (
                        <button type="button" onClick={() => void removeImage()} className="block text-xs text-red-600 underline">
                          Remove photo
                        </button>
                      )}
                      {imageUploading && <p className="text-xs text-gray-500">Uploading…</p>}
                      {imageError && <p className="text-xs text-red-600">{imageError}</p>}
                    </div>
                  </div>
                </section>

                {/* Editable profile fields */}
                <form onSubmit={save} className="card space-y-4 p-6">
                  <h2 className="font-semibold text-gray-900">Public details</h2>
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
                  <div>
                    <p className="mb-2 text-sm font-medium">Instruments you teach</p>
                    <div className="flex flex-wrap gap-2">
                      {INSTRUMENTS.map((inst) => (
                        <button
                          key={inst} type="button" aria-pressed={selectedInstruments.includes(inst)}
                          onClick={() => toggleInstrument(inst)}
                          className={`rounded-full border px-3 py-1 text-sm transition-colors ${selectedInstruments.includes(inst) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Teaching formats</p>
                    <div className="flex flex-wrap gap-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f.value} type="button" aria-pressed={selectedFormats.includes(f.value)}
                          onClick={() => toggleFormat(f.value)}
                          className={`rounded-full border px-3 py-1 text-sm transition-colors ${selectedFormats.includes(f.value) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Hourly rate
                      <input type="number" min="0" step="0.01" className="input mt-1 w-full" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} placeholder="Leave blank for &ldquo;Contact for pricing&rdquo;" />
                    </label>
                    <label className="text-sm font-medium">
                      Currency
                      <input className="input mt-1 w-full" value={form.currency} disabled title="Set from your account currency" />
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button disabled={saving} className="btn-primary rounded-lg px-4 py-2 text-sm">{saving ? 'Saving…' : 'Save'}</button>
                    {saved && <span className="text-xs text-green-700">Saved.</span>}
                  </div>
                </form>

                {/* Availability toggle */}
                <section className="card p-6">
                  <h2 className="font-semibold text-gray-900">Booking availability</h2>
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={Boolean(profile.isAvailable)} onChange={() => void toggleAvailable()} />
                    Show my profile as available for new bookings
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    Manage the specific times students can book from{' '}
                    <Link href="/dashboard/teacher/availability" className="text-primary-700 underline">Lesson availability</Link>.
                  </p>
                </section>

                {/* Booking policy (Phase 4) */}
                <section className="card p-6">
                  <h2 className="font-semibold text-gray-900">Booking policy</h2>
                  <form onSubmit={savePolicy} className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Advance booking (lead time)
                      <select className="input mt-1 w-full" value={policyDraft.leadDays} onChange={(e) => setPolicyDraft({ ...policyDraft, leadDays: e.target.value })}>
                        <option value="0">Until end of the day before the lesson</option>
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d} day{d === 1 ? '' : 's'} before</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium">
                      Cancellation window
                      <select className="input mt-1 w-full" value={policyDraft.cancellationDays} onChange={(e) => setPolicyDraft({ ...policyDraft, cancellationDays: e.target.value })}>
                        {[2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d} days before</option>)}
                      </select>
                    </label>
                    <p className="sm:col-span-2 text-xs text-gray-500">
                      Cancelling inside this window (or a no-show) charges the full lesson price or consumes a prepaid credit -
                      this leaves time for another student to book the released slot. Must be at least one day more than your lead time.
                    </p>
                    {policyError && <p className="sm:col-span-2 text-sm text-red-600">{policyError.message}</p>}
                    <div className="sm:col-span-2">
                      <button disabled={savingPolicy} className="btn-secondary rounded-lg px-4 py-2 text-sm">{savingPolicy ? 'Saving…' : 'Save policy'}</button>
                    </div>
                  </form>
                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(profile.autoApproveNewStudents)} onChange={() => void toggleAutoApproveNew()} />
                      Automatically confirm bookings from new students
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(profile.autoApproveRecurringStudents)} onChange={() => void toggleAutoApproveRecurring()} />
                      Automatically confirm bookings from recurring students (a student with a prior confirmed/completed lesson with you)
                    </label>
                    <p className="text-xs text-gray-500">When off, a request holds the slot for 48 hours awaiting your approval.</p>
                  </div>
                </section>

                {/* Per-instrument student capacity (Phase 4) */}
                <section className="card p-6">
                  <h2 className="font-semibold text-gray-900">Student capacity</h2>
                  <p className="mt-1 text-sm text-gray-500">Cap how many active students you take per instrument. Leave blank for unlimited.</p>
                  <div className="mt-3 space-y-2">
                    {(profile.instrumentCapacities ?? []).map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <span>{c.instrument}: {c.activeStudentCount}{c.maxActiveStudents != null ? ` / ${c.maxActiveStudents}` : ''} students</span>
                        <span className="text-xs text-gray-500">{c.maxActiveStudents == null ? 'Unlimited' : c.remainingCapacity > 0 ? `${c.remainingCapacity} spot${c.remainingCapacity === 1 ? '' : 's'} left` : 'Full'}</span>
                      </div>
                    ))}
                    {(profile.instrumentCapacities ?? []).length === 0 && <p className="text-sm text-gray-500">No caps set - every instrument is unlimited.</p>}
                  </div>
                  <form onSubmit={saveCapacity} className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                    <label className="text-sm font-medium">Instrument<input className="input mt-1 w-full" list="capacity-instruments" value={capacityDraft.instrument} onChange={(e) => setCapacityDraft({ ...capacityDraft, instrument: e.target.value })}/></label>
                    <datalist id="capacity-instruments">{selectedInstruments.map((i) => <option key={i} value={i}/>)}</datalist>
                    <label className="text-sm font-medium">Max active students<input type="number" min="0" className="input mt-1 w-full" placeholder="Unlimited" value={capacityDraft.maxActiveStudents} onChange={(e) => setCapacityDraft({ ...capacityDraft, maxActiveStudents: e.target.value })}/></label>
                    <div className="flex items-end"><button disabled={savingCapacity} className="btn-secondary rounded-lg px-4 py-2 text-sm">{savingCapacity ? 'Saving…' : 'Set cap'}</button></div>
                  </form>
                </section>

                {profile.introVideoUrl && (
                  <section className="card p-6">
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
                  </section>
                )}
              </div>

              {/* Overview sidebar - real, calculated data only; honest neutral states, never invented metrics */}
              <aside className="space-y-4">
                <section className="card p-5">
                  <h2 className="font-semibold text-gray-900">Overview</h2>
                  <dl className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-500"><Star className="h-3.5 w-3.5" /> Rating</dt>
                      <dd className="font-medium text-gray-900">
                        {profile.totalReviews > 0 ? `${profile.avgRating.toFixed(1)} (${profile.totalReviews})` : 'No reviews yet'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-500"><UsersIcon className="h-3.5 w-3.5" /> Students</dt>
                      <dd className="font-medium text-gray-900">{profile.distinctStudentCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-500"><Award className="h-3.5 w-3.5" /> Member since</dt>
                      <dd className="font-medium text-gray-900">{membershipLabel(profile.memberSince)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-500"><BookOpen className="h-3.5 w-3.5" /> Published courses</dt>
                      <dd className="font-medium text-gray-900">{profile.publishedResourceCount}</dd>
                    </div>
                    {account?.city && (
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1.5 text-gray-500"><MapPin className="h-3.5 w-3.5" /> Location</dt>
                        <dd className="font-medium text-gray-900">{account.city}{account.country ? `, ${account.country}` : ''}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-3 text-xs text-gray-400">
                    Location comes from your <Link href="/dashboard/profile" className="underline">account settings</Link>.
                  </p>
                </section>

                <section className="card p-5">
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Calendar className="h-4 w-4 text-primary-600" /> Needs attention</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500">Pending booking requests</dt>
                      <dd className="font-medium text-gray-900">{pendingCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500">Upcoming confirmed lessons</dt>
                      <dd className="font-medium text-gray-900">{upcomingCount}</dd>
                    </div>
                  </dl>
                  <Link href="/dashboard/teacher" className="mt-3 block text-xs text-primary-700 underline">Review in your workspace →</Link>
                </section>

                <section className="card p-5">
                  <h2 className="font-semibold text-gray-900">Pricing</h2>
                  <p className="mt-2 text-sm text-gray-700">
                    {profile.hourlyRate ? `${profile.currency} ${profile.hourlyRate}/hr` : 'Contact for pricing'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Packages and subscriptions will appear here once published.</p>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>
    </RoleGate>
  );
}
