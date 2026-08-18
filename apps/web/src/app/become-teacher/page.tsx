'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { signIn, useSession } from 'next-auth/react';
import { hasRole } from '@/lib/roles';

const GET = gql`
  query MyTeacherApplicationStatus {
    myTeacherApplication { id status headline bio instruments experienceYears address birthdate }
  }
`;

const MIN_TEACHER_AGE_YEARS = 18;

function calculateAge(birthdate: string): number | null {
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}
const APPLY = gql`
  mutation ApplyForTeacher($input: TeacherApplicationInput!) {
    applyForTeacher(input: $input) { id status }
  }
`;

const INSTRUMENTS = ['Piano', 'Violin', 'Viola', 'Cello', 'Guitar', 'Voice', 'Flute', 'Clarinet', 'Oboe', 'Trumpet', 'Organ', 'Harp', 'Percussion', 'Composition', 'Theory'];

function StepCard({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <article className="card p-5">
      <h2 className="text-lg font-semibold">{step}. {title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </article>
  );
}

export default function BecomeTeacherPage() {
  const { data: session, status } = useSession();
  // Signed-in users who already hold TEACHER/ADMIN have nothing to apply for.
  const alreadyTeacher = hasRole(session?.roles, 'TEACHER', 'ADMIN');

  const { data, loading, refetch } = useQuery(GET, { skip: status !== 'authenticated' || alreadyTeacher });
  const [apply, { loading: applying, error }] = useMutation(APPLY);
  const [form, setForm] = useState({ headline: '', bio: '', experienceYears: '', address: '', birthdate: '' });
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [ageError, setAgeError] = useState<string | null>(null);

  const application = data?.myTeacherApplication;

  function toggleInstrument(inst: string) {
    setSelectedInstruments((prev) => (prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setAgeError(null);
    // Server enforces this too (the real check) - client-side only saves a
    // round trip for the common case of someone just under the line.
    const age = form.birthdate ? calculateAge(form.birthdate) : null;
    if (age === null) {
      setAgeError('Enter your date of birth.');
      return;
    }
    if (age < MIN_TEACHER_AGE_YEARS) {
      setAgeError(`You must be at least ${MIN_TEACHER_AGE_YEARS} to apply as a teacher.`);
      return;
    }
    await apply({
      variables: {
        input: {
          headline: form.headline.trim() || null,
          bio: form.bio.trim() || null,
          instruments: selectedInstruments,
          // GraphQL Int rejects a fractional value like "2.5" that a plain
          // number input can otherwise produce — round down to a whole year.
          experienceYears: form.experienceYears ? Math.trunc(Number(form.experienceYears)) : null,
          address: form.address.trim() || null,
          birthdate: form.birthdate,
        },
      },
    });
    await refetch();
  }

  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Become a Teacher</h1>
        <p className="mb-8 text-gray-600">
          Join My Music Coach as a verified instructor and teach motivated students online or in person.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          <StepCard step="1" title="Apply" text="Share your profile, experience, certifications, and teaching focus." />
          <StepCard step="2" title="Verify" text="Our team reviews credentials and class quality standards." />
          <StepCard step="3" title="Teach" text="Set availability, publish your offer, and start onboarding students." />
        </div>

        <div className="mt-10">
          {status === 'loading' ? (
            <p className="text-sm text-gray-500">Checking your account…</p>
          ) : status !== 'authenticated' ? (
            // Step 1 of THIS flow, not a separate page: clicking takes the
            // visitor through Keycloak sign-in/registration and lands them
            // straight back here (callbackUrl), continuing into the form below.
            <div className="card max-w-md p-6">
              <p className="mb-4 text-sm text-gray-600">
                You&rsquo;ll need a My Music Coach account first — creating one takes a minute, then you&rsquo;ll
                come straight back here to finish your application.
              </p>
              <button onClick={() => signIn('keycloak', { callbackUrl: '/become-teacher' })} className="btn-primary px-8 py-3">
                Create account &amp; continue
              </button>
            </div>
          ) : alreadyTeacher ? (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              You already have teacher access — head to your{' '}
              <a href="/dashboard/teacher" className="font-medium underline">teacher workspace</a> to get started.
            </p>
          ) : loading ? (
            <p className="text-sm text-gray-500">Loading your application status…</p>
          ) : application?.status === 'PENDING' ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your application is submitted and pending review. We&rsquo;ll let you know once an admin has looked at it.
            </p>
          ) : (
            <form onSubmit={submit} className="card max-w-lg space-y-4 p-6">
              {application?.status === 'REJECTED' && (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  Your previous application wasn&rsquo;t approved. You&rsquo;re welcome to update the details below and resubmit.
                </p>
              )}
              {error && <p className="text-sm text-red-600">{error.message}</p>}
              {ageError && <p className="text-sm text-red-600">{ageError}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Date of birth
                  <input
                    type="date"
                    required
                    className="input mt-1 w-full"
                    value={form.birthdate}
                    onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                  />
                  <span className="mt-1 block text-xs text-gray-400">Applicants must be 18 or older. Not shown publicly.</span>
                </label>
                <label className="block text-sm font-medium">
                  Address
                  <input
                    className="input mt-1 w-full"
                    placeholder="Street, city, country"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Headline
                <input
                  className="input mt-1 w-full"
                  placeholder="e.g. Conservatory-trained pianist, 10 years teaching"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                About you &amp; your teaching experience
                <textarea
                  rows={4}
                  className="input mt-1 w-full"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Years of teaching experience
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="input mt-1 w-full"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-medium">Instruments you teach</p>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map((inst) => (
                    <button
                      key={inst}
                      type="button"
                      aria-pressed={selectedInstruments.includes(inst)}
                      onClick={() => toggleInstrument(inst)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        selectedInstruments.includes(inst)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>
              <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                Uploading a CV, a recording, and supporting documents will be added soon — for now our team follows up by
                email if we need anything beyond what&rsquo;s here. A verified-identity step is also planned for a later phase.
              </p>
              <button disabled={applying} className="btn-primary px-8 py-3">
                {applying ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
