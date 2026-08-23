'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { hasRole } from '@/lib/roles';
import { uploadFileToStorage } from '@/lib/upload';
import { toYouTubeEmbedUrl } from '@/lib/youtube';

const GET = gql`
  query MyTeacherApplicationStatus {
    me { id displayName }
    myTeacherApplication {
      id status headline bio instruments experienceYears birthdate gender motivation videoUrl
      street houseNumber postalCode city state country
      cvUrl audioSampleUrl documentUrls imageUrl
    }
    storageConfigured
  }
`;

const REQUEST_UPLOAD_URL = gql`
  mutation RequestUploadUrl($purpose: UploadPurpose!, $filename: String!, $contentType: String!) {
    requestUploadUrl(purpose: $purpose, filename: $filename, contentType: $contentType) {
      uploadUrl
      fileUrl
    }
  }
`;

const APPLY = gql`
  mutation ApplyForTeacher($input: TeacherApplicationInput!) {
    applyForTeacher(input: $input) { id status }
  }
`;

const MIN_TEACHER_AGE_YEARS = 18;
// Mirrors the resolver's MAX_TEACHER_AGE_YEARS - catches an obvious
// data-entry mistake (e.g. "1900" instead of "2000") client-side; the
// resolver is the actual authority and re-checks this.
const MAX_TEACHER_AGE_YEARS = 100;

// Native date-picker bounds (native browser UI, not validation) so the
// picker doesn't even offer an obviously-wrong date - min/max still
// duplicated in validateStep()/the resolver, since a picker's min/max is
// only a UI hint and a typed-in date can bypass it.
function isoDateYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

function calculateAge(birthdate: string): number | null {
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

const INSTRUMENTS = ['Piano', 'Violin', 'Viola', 'Cello', 'Guitar', 'Voice', 'Flute', 'Clarinet', 'Oboe', 'Trumpet', 'Organ', 'Harp', 'Percussion', 'Composition', 'Theory'];
const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

// Not an exhaustive ISO-3166 list, but broad enough to cover this
// platform's actual applicant base without an external dependency -
// alphabetical, matches the resolver's permissive server-side pattern
// rather than a closed enum, so a country missing here doesn't hard-block
// an applicant (see "Other" below).
const COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
  'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
  'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
  'Switzerland', 'United Kingdom', 'United States', 'Other',
];

// Permissive mirrors of the server-side patterns in teacherApplications.ts -
// client-side validation is a UX convenience (fail fast, explain why), the
// resolver is the actual authority and re-checks everything. \p{Pd} covers
// every Unicode dash (not just ASCII hyphen-minus) and '‘’ cover both the
// ASCII apostrophe and typographic quote marks, so real names like
// "St John's"/"St John’s" or "Côte d’Ivoire" aren't rejected.
const STREET_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.,'‘’\p{Pd}]{0,99}$/u;
// Requires at least one digit - "b" alone isn't a real house number, but
// "12b"/"221B"/"12-14"/"12 bis" are all fine. Mirrors the resolver.
const HOUSE_NUMBER_PATTERN = /^(?=.*\d)[\p{L}0-9][\p{L}0-9\s.\p{Pd}/]{0,14}$/u;
const CITY_PATTERN = /^[\p{L}][\p{L}\s.'‘’\p{Pd}]{0,99}$/u;
const STATE_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.'‘’\p{Pd}]{0,59}$/u;

// Mirrors POSTAL_CODE_PATTERNS_BY_COUNTRY in teacherApplications.ts - a
// generic pattern would accept "12" as a valid Swiss postal code just
// because the characters were plausible. Keyed by the exact strings in
// COUNTRIES above; the resolver is the authority and re-checks this.
const POSTAL_CODE_PATTERNS_BY_COUNTRY: Record<string, RegExp> = {
  Austria: /^\d{4}$/,
  Belgium: /^\d{4}$/,
  Bulgaria: /^\d{4}$/,
  Canada: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  Croatia: /^\d{5}$/,
  Cyprus: /^\d{4}$/,
  Czechia: /^\d{3} ?\d{2}$/,
  Denmark: /^\d{4}$/,
  Estonia: /^\d{5}$/,
  Finland: /^\d{5}$/,
  France: /^\d{5}$/,
  Germany: /^\d{5}$/,
  Greece: /^\d{3} ?\d{2}$/,
  Hungary: /^\d{4}$/,
  Iceland: /^\d{3}$/,
  Ireland: /^[A-Za-z]\d[A-Za-z0-9] ?[A-Za-z0-9]{4}$/,
  Italy: /^\d{5}$/,
  Latvia: /^(LV-)?\d{4}$/,
  Liechtenstein: /^\d{4}$/,
  Lithuania: /^(LT-)?\d{5}$/,
  Luxembourg: /^\d{4}$/,
  Malta: /^[A-Za-z]{3} ?\d{4}$/,
  Netherlands: /^\d{4} ?[A-Za-z]{2}$/,
  Norway: /^\d{4}$/,
  Poland: /^\d{2}-\d{3}$/,
  Portugal: /^\d{4}-\d{3}$/,
  Romania: /^\d{6}$/,
  Slovakia: /^\d{3} ?\d{2}$/,
  Slovenia: /^(SI-)?\d{4}$/,
  Spain: /^\d{5}$/,
  Sweden: /^\d{3} ?\d{2}$/,
  Switzerland: /^\d{4}$/,
  'United Kingdom': /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
  'United States': /^\d{5}(-\d{4})?$/,
};
const POSTAL_CODE_FALLBACK_PATTERN = /^[\p{L}0-9][\p{L}0-9\s\p{Pd}]{0,11}$/u;

function isValidPostalCode(postalCode: string, country: string): boolean {
  const pattern = POSTAL_CODE_PATTERNS_BY_COUNTRY[country] ?? POSTAL_CODE_FALLBACK_PATTERN;
  return pattern.test(postalCode);
}

const STEPS = ['About you', 'Photo', 'Your teaching', 'Motivation', 'Proof & video', 'Review'] as const;

function StepCard({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <article className="card p-5">
      <h2 className="text-lg font-semibold">{step}. {title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </article>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2 text-xs">
      {STEPS.map((label, i) => (
        <li
          key={label}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
            i === current
              ? 'border-primary-500 bg-primary-50 font-medium text-primary-700'
              : i < current
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-400'
          }`}
        >
          <span>{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

// Everything typed in this multi-step wizard used to live only in React
// state - a reload (accidental, or the browser reclaiming the tab) threw
// away every field the applicant had already filled in, with no way back
// short of retyping it all. Persisted per-account (userId, not a fixed key -
// a shared/kiosk browser must not show one account's draft to another) so
// it survives a reload and a later visit alike. File selections (CV, photo,
// etc.) can't go in here - browsers don't allow restoring a <input
// type="file">'s value programmatically, and File objects aren't
// JSON-serializable - those still have to be re-picked after a reload, same
// as every other web upload form.
interface WizardDraft {
  form: typeof INITIAL_FORM;
  selectedInstruments: string[];
  stepIndex: number;
}
const INITIAL_FORM = {
  fullName: '', birthdate: '', gender: '',
  street: '', houseNumber: '', postalCode: '', city: '', state: '', country: '',
  headline: '', bio: '', experienceYears: '', motivation: '', videoUrl: '',
};
const DRAFT_KEY_PREFIX = 'become-teacher-draft:';

function loadDraft(userId: string): WizardDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as WizardDraft;
  } catch {
    // Private browsing, disabled storage, corrupted JSON - a lost draft
    // isn't worth failing the page over, so just start blank.
    return null;
  }
}

function saveDraft(userId: string, draft: WizardDraft) {
  try {
    localStorage.setItem(DRAFT_KEY_PREFIX + userId, JSON.stringify(draft));
  } catch {
    // Storage full/unavailable - silently skip, same reasoning as above.
  }
}

function clearDraft(userId: string) {
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + userId);
  } catch {
    // Nothing meaningful to do if this fails.
  }
}

export default function BecomeTeacherPage() {
  const { data: session, status } = useSession();
  const alreadyTeacher = hasRole(session?.roles, 'TEACHER', 'ADMIN');

  const { data, loading, refetch } = useQuery(GET, { skip: status !== 'authenticated' || alreadyTeacher, fetchPolicy: 'cache-and-network' });
  const [apply, { loading: applying, error }] = useMutation(APPLY);
  const [requestUploadUrl] = useMutation(REQUEST_UPLOAD_URL);

  const application = data?.myTeacherApplication;
  const me = data?.me;
  const storageConfigured = data?.storageConfigured ?? false;

  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Revoke the previous local preview URL whenever a new file is chosen or
  // the component unmounts - object URLs otherwise leak for the page's
  // lifetime. Also clears imagePreviewUrl when imageFile is reset to null
  // (e.g. after a successful submit) - without this, the state kept
  // pointing at a URL this same effect had just revoked, and the render
  // below prefers imagePreviewUrl over application?.imageUrl, so the
  // freshly-saved photo appeared broken until the next reload.
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  // Guards the save effect below against writing a blank draft over a real
  // one - both the prefill effect and the save effect fire on every mount,
  // but the prefill (draft/server restore) effect must run and finish
  // first. Doesn't itself trigger a re-render (it's a ref, not state) -
  // it's read by the save effect's next invocation, which the prefill
  // effect's own setForm/setSelectedInstruments calls schedule.
  const hydratedRef = useRef(false);

  // Prefill on load, in priority order: an unsaved local draft (the
  // applicant's own most recent edits, possibly newer than what's on the
  // server) beats the last-submitted application (a resubmission after
  // rejection starts from what was submitted before, not blank) beats
  // blank. me.id isn't known until this query resolves, so the draft can
  // only be looked up here, not in a useState lazy initializer.
  useEffect(() => {
    if (!data) return;
    const draft = me?.id ? loadDraft(me.id) : null;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || draft?.form.fullName || me?.displayName || '',
      street: f.street || draft?.form.street || application?.street || '',
      houseNumber: f.houseNumber || draft?.form.houseNumber || application?.houseNumber || '',
      postalCode: f.postalCode || draft?.form.postalCode || application?.postalCode || '',
      city: f.city || draft?.form.city || application?.city || '',
      state: f.state || draft?.form.state || application?.state || '',
      country: f.country || draft?.form.country || application?.country || '',
      birthdate: f.birthdate || draft?.form.birthdate || (application?.birthdate ? application.birthdate.slice(0, 10) : ''),
      gender: f.gender || draft?.form.gender || application?.gender || '',
      headline: f.headline || draft?.form.headline || application?.headline || '',
      bio: f.bio || draft?.form.bio || application?.bio || '',
      experienceYears: f.experienceYears || draft?.form.experienceYears || (application?.experienceYears != null ? String(application.experienceYears) : ''),
      motivation: f.motivation || draft?.form.motivation || application?.motivation || '',
      videoUrl: f.videoUrl || draft?.form.videoUrl || application?.videoUrl || '',
    }));
    if (selectedInstruments.length === 0) {
      const restoredInstruments = draft?.selectedInstruments?.length ? draft.selectedInstruments : application?.instruments;
      if (restoredInstruments?.length) setSelectedInstruments(restoredInstruments);
    }
    if (draft?.stepIndex) setStepIndex((i) => (i === 0 ? draft.stepIndex : i));
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Saves on every change once the prefill effect above has actually run
  // (hydratedRef guards against overwriting a real draft with the blank
  // initial state on mount, before that effect has had a chance to restore
  // it). File selections aren't included - see the WizardDraft comment.
  useEffect(() => {
    if (!hydratedRef.current || !me?.id) return;
    saveDraft(me.id, { form, selectedInstruments, stepIndex });
  }, [form, selectedInstruments, stepIndex, me?.id]);

  function toggleInstrument(inst: string) {
    setSelectedInstruments((prev) => (prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]));
  }

  function requestUrlFor(purpose: string) {
    return async (filename: string, contentType: string) => {
      const { data } = await requestUploadUrl({ variables: { purpose, filename, contentType } });
      return data.requestUploadUrl;
    };
  }

  const videoEmbedUrl = useMemo(() => toYouTubeEmbedUrl(form.videoUrl), [form.videoUrl]);

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!form.fullName.trim()) return 'Enter your full name.';
      if (!STREET_PATTERN.test(form.street.trim())) return 'Enter a valid street name.';
      if (!HOUSE_NUMBER_PATTERN.test(form.houseNumber.trim())) return 'Enter a valid house/street number (must include a number).';
      if (!CITY_PATTERN.test(form.city.trim())) return 'Enter a valid town/city.';
      if (form.state.trim() && !STATE_PATTERN.test(form.state.trim())) return 'Enter a valid state/region, or leave it blank.';
      if (!form.country) return 'Select your country.';
      // Country-dependent, so this must run after the country check above.
      if (!isValidPostalCode(form.postalCode.trim(), form.country)) return `Enter a valid postal code for ${form.country}.`;
      const age = form.birthdate ? calculateAge(form.birthdate) : null;
      if (age === null) return 'Enter your date of birth.';
      if (age < MIN_TEACHER_AGE_YEARS) return `You must be at least ${MIN_TEACHER_AGE_YEARS} to apply as a teacher.`;
      if (age > MAX_TEACHER_AGE_YEARS) return 'Enter a valid date of birth.';
      return null;
    }
    if (index === 1) {
      // Same escape hatch as the CV requirement below - when storage isn't
      // configured no upload is possible at all, so this can't be a hard
      // requirement in that case.
      if (storageConfigured && !application?.imageUrl && !imageFile) {
        return 'Add a profile photo before continuing — students see this on your teacher profile.';
      }
      return null;
    }
    if (index === 2) {
      if (selectedInstruments.length === 0) return 'Select at least one instrument you teach.';
      if (!form.headline.trim()) return 'Add a short headline.';
      if (!form.bio.trim()) return 'Write a short self-presentation — this is shown on your public profile once approved.';
      return null;
    }
    if (index === 3) {
      if (!form.motivation.trim()) return 'Tell us why you want to teach on My Music Coach — this is for our reviewers only, never shown publicly.';
      return null;
    }
    if (index === 4) {
      // Uploads aren't possible at all when storage isn't configured (the
      // file inputs are hidden in that case - see the storageConfigured
      // branch below) - requiring a CV then would make every application
      // un-submittable on a deployment without S3_* set.
      if (storageConfigured && !application?.cvUrl && !cvFile) return 'Upload your CV.';
      if (!videoEmbedUrl) return 'Add a link to a YouTube presentation or performance video.';
      return null;
    }
    return null;
  }

  function goNext() {
    const err = validateStep(stepIndex);
    setStepError(err);
    if (err) return;
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function goBack() {
    setStepError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function submit() {
    setStepError(null);
    setUploadError(null);
    for (let i = 0; i < STEPS.length - 1; i++) {
      const err = validateStep(i);
      if (err) {
        setStepIndex(i);
        setStepError(err);
        return;
      }
    }

    // When storage isn't configured, these fields are omitted from the
    // mutation entirely (undefined) rather than resent as their current
    // value - applyForTeacher rejects any non-null upload URL while storage
    // is unconfigured (there's no way to prove ownership), so resending an
    // untouched, previously-uploaded URL from before storage was disabled
    // would make an otherwise-unrelated resubmission (e.g. just editing the
    // headline) fail outright. The resolver treats an omitted field as "no
    // change," which is exactly what an untouched file should mean here.
    let cvUrl: string | null | undefined = storageConfigured ? (application?.cvUrl ?? null) : undefined;
    let audioSampleUrl: string | null | undefined = storageConfigured ? (application?.audioSampleUrl ?? null) : undefined;
    let documentUrls: string[] | undefined = storageConfigured ? (application?.documentUrls ?? []) : undefined;
    let imageUrl: string | null | undefined = storageConfigured ? (application?.imageUrl ?? null) : undefined;
    try {
      setUploading(true);
      if (imageFile) imageUrl = await uploadFileToStorage(requestUrlFor('TEACHER_PROFILE_IMAGE'), imageFile);
      if (cvFile) cvUrl = await uploadFileToStorage(requestUrlFor('TEACHER_APPLICATION_CV'), cvFile);
      if (audioFile) audioSampleUrl = await uploadFileToStorage(requestUrlFor('TEACHER_APPLICATION_AUDIO'), audioFile);
      if (documentFiles.length > 0) {
        const uploaded = await Promise.all(documentFiles.map((f) => uploadFileToStorage(requestUrlFor('TEACHER_APPLICATION_DOCUMENT'), f)));
        documentUrls = [...(documentUrls ?? []), ...uploaded];
      }
    } catch (err: any) {
      setUploadError(err.message ?? 'File upload failed.');
      setUploading(false);
      return;
    }
    setUploading(false);

    await apply({
      variables: {
        input: {
          fullName: form.fullName.trim(),
          headline: form.headline.trim() || null,
          bio: form.bio.trim() || null,
          instruments: selectedInstruments,
          experienceYears: form.experienceYears ? Math.trunc(Number(form.experienceYears)) : null,
          street: form.street.trim(),
          houseNumber: form.houseNumber.trim(),
          postalCode: form.postalCode.trim(),
          city: form.city.trim(),
          state: form.state.trim() || null,
          country: form.country,
          birthdate: form.birthdate,
          gender: form.gender || null,
          motivation: form.motivation.trim() || null,
          cvUrl,
          audioSampleUrl,
          documentUrls,
          imageUrl,
          videoUrl: form.videoUrl.trim(),
        },
      },
    });
    setCvFile(null);
    setAudioFile(null);
    setDocumentFiles([]);
    setImageFile(null);
    // Only reached if apply() above didn't throw - the application is now
    // safely persisted server-side, so the local draft's job is done. Left
    // in place on a failed submit, so the applicant doesn't lose their
    // input to a validation error.
    if (me?.id) clearDraft(me.id);
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
          ) : loading && !data ? (
            <p className="text-sm text-gray-500">Loading your application status…</p>
          ) : application?.status === 'PENDING' ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your application is submitted and pending review. We&rsquo;ll let you know once an admin has looked at it.
            </p>
          ) : (
            <div className="card max-w-2xl p-6">
              {application?.status === 'REJECTED' && (
                <p className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  Your previous application wasn&rsquo;t approved. You&rsquo;re welcome to update the details below and resubmit.
                </p>
              )}
              <Stepper current={stepIndex} />
              {error && <p className="mb-3 text-sm text-red-600">{error.message}</p>}
              {stepError && <p className="mb-3 text-sm text-red-600">{stepError}</p>}
              {uploadError && <p className="mb-3 text-sm text-red-600">{uploadError}</p>}

              {stepIndex === 0 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Full name
                    <input
                      className="input mt-1 w-full"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                    <span className="mt-1 block text-xs text-gray-400">This is what students will see on your public profile.</span>
                  </label>
                  {/* Structured address (street/number/postal code/city/
                      state/country) instead of one free-text line - keeps
                      the data usable and validated rather than an
                      unparseable blob. Not shown publicly - for our records
                      only. */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr,1fr]">
                    <label className="block min-w-0 text-sm font-medium">
                      Street
                      <input
                        className="input mt-1 w-full"
                        placeholder="e.g. Bahnhofstrasse"
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                      />
                    </label>
                    <label className="block min-w-0 text-sm font-medium">
                      House / street number
                      <input
                        className="input mt-1 w-full"
                        placeholder="e.g. 12b"
                        value={form.houseNumber}
                        onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,2fr]">
                    <label className="block min-w-0 text-sm font-medium">
                      Postal code
                      <input
                        className="input mt-1 w-full"
                        placeholder="e.g. 8001"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      />
                    </label>
                    <label className="block min-w-0 text-sm font-medium">
                      Town / city
                      <input
                        className="input mt-1 w-full"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block min-w-0 text-sm font-medium">
                      State / region <span className="font-normal text-gray-400">(optional)</span>
                      <input
                        className="input mt-1 w-full"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                      />
                    </label>
                    <label className="block min-w-0 text-sm font-medium">
                      Country
                      <select className="input mt-1 w-full" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                        <option value="">Select…</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <span className="block text-xs text-gray-400">Address is not shown publicly — for our records only.</span>
                  {/* min-w-0 on both grid items: a native <input type="date">
                      has an intrinsic minimum content width that CSS Grid
                      otherwise respects over the column's actual width,
                      letting it overflow into the Gender column next to it
                      instead of shrinking to fit. */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block min-w-0 text-sm font-medium">
                      Date of birth
                      <input
                        type="date"
                        className="input mt-1 w-full min-w-0"
                        value={form.birthdate}
                        min={isoDateYearsAgo(MAX_TEACHER_AGE_YEARS)}
                        max={isoDateYearsAgo(MIN_TEACHER_AGE_YEARS)}
                        onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                      />
                      <span className="mt-1 block text-xs text-gray-400">Applicants must be 18 or older. Not shown publicly.</span>
                    </label>
                    <label className="block min-w-0 text-sm font-medium">
                      Gender
                      <select className="input mt-1 w-full min-w-0" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="">Select…</option>
                        {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <span className="mt-1 block text-xs text-gray-400">Not shown publicly.</span>
                    </label>
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {imagePreviewUrl || application?.imageUrl ? (
                      <img src={imagePreviewUrl ?? application?.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No photo yet</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    This is your public teacher photo — separate from your account picture — shown alongside your
                    name and self-presentation on your public teacher profile and directory card once approved.
                  </p>
                  {storageConfigured ? (
                    <label className="btn-secondary mx-auto block w-fit cursor-pointer rounded-lg px-4 py-2 text-sm">
                      {application?.imageUrl || imageFile ? 'Change photo' : 'Add a photo'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  ) : (
                    <p className="text-xs text-gray-500">Photo uploads aren&rsquo;t enabled on this deployment yet — you can continue without one.</p>
                  )}
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-4">
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
                  <label className="block text-sm font-medium">
                    Years of teaching experience
                    <input
                      type="number" min="0" step="1"
                      className="input mt-1 w-full"
                      value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    />
                  </label>
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
                    Self-presentation
                    <textarea
                      rows={4}
                      className="input mt-1 w-full"
                      placeholder="Introduce yourself to prospective students — your background, teaching style, what makes your lessons different."
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                    <span className="mt-1 block text-xs text-gray-400">Shown on your public profile once approved.</span>
                  </label>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Why do you want to teach on My Music Coach?
                    <textarea
                      rows={5}
                      className="input mt-1 w-full"
                      placeholder="Your motivation, teaching philosophy, what you're hoping to bring to students here."
                      value={form.motivation}
                      onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    />
                  </label>
                  <p className="text-xs text-gray-400">For our review team only — never shown on your public profile.</p>
                </div>
              )}

              {stepIndex === 4 && (
                <div className="space-y-4">
                  {storageConfigured ? (
                    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                      <label className="block text-sm">
                        CV / resume (PDF)
                        <input type="file" accept="application/pdf" className="input mt-1 w-full" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
                        {application?.cvUrl && !cvFile && <span className="mt-1 block text-xs text-green-700">A CV is already on file — choose a new one to replace it.</span>}
                      </label>
                      <label className="block text-sm">
                        Qualifications / certificates / references (PDF or image, multiple allowed)
                        <input type="file" accept="application/pdf,image/png,image/jpeg" multiple className="input mt-1 w-full" onChange={(e) => setDocumentFiles(Array.from(e.target.files ?? []))} />
                        {application?.documentUrls?.length > 0 && (
                          <span className="mt-1 block text-xs text-green-700">{application.documentUrls.length} document(s) already on file — new ones are added, not replaced.</span>
                        )}
                      </label>
                      <label className="block text-sm">
                        Recording of a previous performance/competition (optional, audio)
                        <input type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg" className="input mt-1 w-full" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
                        {application?.audioSampleUrl && !audioFile && <span className="mt-1 block text-xs text-green-700">A recording is already on file — choose a new one to replace it.</span>}
                      </label>
                    </div>
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Uploading a CV and supporting documents isn&rsquo;t enabled on this deployment yet — our team follows up
                      by email if we need anything beyond what&rsquo;s here.
                    </p>
                  )}
                  <label className="block text-sm font-medium">
                    Presentation or performance video (YouTube link)
                    <input
                      className="input mt-1 w-full"
                      placeholder="https://www.youtube.com/watch?v=…"
                      value={form.videoUrl}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    />
                    <span className="mt-1 block text-xs text-gray-400">
                      A YouTube link, not a file upload — once approved you can choose whether it&rsquo;s shown on your public profile.
                    </span>
                  </label>
                  {videoEmbedUrl && (
                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-900">
                      <iframe className="h-full w-full" src={videoEmbedUrl} title="Presentation video preview" allowFullScreen />
                    </div>
                  )}
                </div>
              )}

              {stepIndex === 5 && (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">Review your application before submitting.</p>
                  <dl className="space-y-2 rounded-lg bg-gray-50 p-4">
                    <div><dt className="font-medium">Name</dt><dd className="text-gray-600">{form.fullName}</dd></div>
                    <div><dt className="font-medium">Instruments</dt><dd className="text-gray-600">{selectedInstruments.join(', ') || '—'}</dd></div>
                    <div><dt className="font-medium">Headline</dt><dd className="text-gray-600">{form.headline || '—'}</dd></div>
                    <div><dt className="font-medium">Experience</dt><dd className="text-gray-600">{form.experienceYears ? `${form.experienceYears} years` : '—'}</dd></div>
                    <div><dt className="font-medium">CV</dt><dd className="text-gray-600">{cvFile?.name || (application?.cvUrl ? 'On file' : 'Not provided')}</dd></div>
                    <div><dt className="font-medium">Video</dt><dd className="text-gray-600">{form.videoUrl || '—'}</dd></div>
                  </dl>
                  <p className="text-xs text-gray-400">
                    Once approved, your instruments, experience, name, photo, self-presentation, and (if you keep it visible)
                    your video become visible on your public teacher profile. Address, birthdate, gender, and your motivation
                    stay private.
                  </p>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} disabled={stepIndex === 0} className="btn-secondary rounded-lg px-5 py-2.5 text-sm disabled:opacity-40">
                  Back
                </button>
                {stepIndex < STEPS.length - 1 ? (
                  <button type="button" onClick={goNext} className="btn-primary rounded-lg px-6 py-2.5 text-sm">
                    Next
                  </button>
                ) : (
                  <button type="button" onClick={submit} disabled={applying || uploading} className="btn-primary rounded-lg px-6 py-2.5 text-sm">
                    {uploading ? 'Uploading files…' : applying ? 'Submitting…' : 'Submit application'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
