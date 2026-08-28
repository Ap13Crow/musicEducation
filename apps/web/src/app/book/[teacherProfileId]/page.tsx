'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Music, Users, Video } from 'lucide-react';
import WeeklySlotCalendar, { type CalendarSlot } from '@/components/booking/WeeklySlotCalendar';

const GET = gql`
  query BookTeacher($id: ID!, $from: DateTime!, $to: DateTime!, $instrument: String) {
    teacher(id: $id) {
      id headline teachingBio hourlyRate currency instruments teachingFormats isAvailable
      leadDays cancellationDays
      instrumentCapacities { id instrument maxActiveStudents activeStudentCount remainingCapacity }
      bookableSlots(from: $from, to: $to, instrument: $instrument, limit: 200) {
        startsAt endsAt timezone
      }
      user { email displayName }
    }
    teacherUnavailability(teacherProfileId: $id, from: $from, to: $to) {
      id startsAt endsAt label
    }
  }
`;
const BOOK = gql`
  mutation Book($input: BookSessionInput!) {
    bookSession(input: $input) { id status startsAt endsAt }
  }
`;
const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateBookingCheckoutSession($type: String!, $refId: ID!) {
    createCheckoutSession(type: $type, refId: $refId) { checkoutUrl }
  }
`;

const ALL_FORMATS = ['ONLINE', 'IN_PERSON', 'HYBRID'];
const FORMAT_LABELS: Record<string, string> = { ONLINE: 'Online', IN_PERSON: 'In person', HYBRID: 'Hybrid' };
const MAX_WEEKS_AHEAD = 8;
const DURATION_OPTIONS = [60, 120, 180, 240];

function startOfWeek(value: Date): Date {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return day;
}

export default function BookTeacherPage() {
  const { teacherProfileId } = useParams<{ teacherProfileId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [weekOffset, setWeekOffset] = useState(0);
  const [startsAt, setStartsAt] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [format, setFormat] = useState('');
  const [instrument, setInstrument] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const weekStart = useMemo(() => {
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [weekOffset]);
  const rangeEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);

  const { data, loading, error: queryError } = useQuery(GET, {
    variables: {
      id: teacherProfileId,
      from: weekStart.toISOString(),
      to: rangeEnd.toISOString(),
      instrument: instrument || null,
    },
    fetchPolicy: 'cache-and-network',
  });
  const [book, { loading: saving, error }] = useMutation(BOOK);
  const [createCheckout, { loading: checkingOut }] = useMutation(CREATE_CHECKOUT_SESSION);
  const teacher = data?.teacher;
  const isOwnProfile = Boolean(session?.user?.email && session.user.email === teacher?.user?.email);

  const capacityByInstrument = useMemo(
    () => new Map((teacher?.instrumentCapacities ?? []).map((capacity: any) => [capacity.instrument, capacity])),
    [teacher?.instrumentCapacities],
  );
  useEffect(() => {
    if (!teacher?.instruments?.length) return;
    if (!teacher.instruments.includes(instrument)) setInstrument(teacher.instruments[0]);
  }, [teacher?.instruments, instrument]);

  const availableFormats = useMemo(
    () => (teacher?.teachingFormats?.length ? teacher.teachingFormats : ALL_FORMATS),
    [teacher?.teachingFormats],
  );
  useEffect(() => {
    if (availableFormats.length && !availableFormats.includes(format)) setFormat(availableFormats[0]);
  }, [availableFormats, format]);
  useEffect(() => setStartsAt(''), [weekOffset, instrument]);

  const slots: CalendarSlot[] = teacher?.bookableSlots ?? [];
  const slotStartTimes = useMemo(() => new Set(slots.map((slot) => new Date(slot.startsAt).getTime())), [slots]);
  const durationSlots = useMemo(() => slots.filter((slot) => {
    const start = new Date(slot.startsAt).getTime();
    return Array.from({ length: durationMin / 60 }, (_, index) => start + index * 60 * 60 * 1000)
      .every((expectedStart) => slotStartTimes.has(expectedStart));
  }).map((slot) => ({
    ...slot,
    endsAt: new Date(new Date(slot.startsAt).getTime() + durationMin * 60_000).toISOString(),
  })), [durationMin, slotStartTimes, slots]);
  const selectedCapacity: any = capacityByInstrument.get(instrument);
  const requiresPayment = Number(teacher?.hourlyRate ?? 0) > 0;
  const lessonPrice = teacher?.hourlyRate ? Number(teacher.hourlyRate) * (durationMin / 60) : 0;

  useEffect(() => {
    if (startsAt && !durationSlots.some((slot) => slot.startsAt === startsAt)) setStartsAt('');
  }, [durationSlots, startsAt]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!startsAt || !instrument) return;
    if (!session) {
      await signIn('keycloak', { callbackUrl: window.location.href });
      return;
    }
    setCheckoutError('');
    const { data: bookData } = await book({
      variables: { input: { teacherProfileId, startsAt, durationMin, format, instrument } },
    });
    const newBooking = bookData?.bookSession;
    if (newBooking && requiresPayment) {
      try {
        const { data: checkoutData } = await createCheckout({ variables: { type: 'booking', refId: newBooking.id } });
        const checkoutUrl = checkoutData?.createCheckoutSession?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
        setCheckoutError('Could not start checkout — your request was saved. Retry payment from your profile.');
      } catch (checkoutErr) {
        setCheckoutError(checkoutErr instanceof Error ? checkoutErr.message : 'Could not start checkout.');
      }
      return;
    }
    router.push('/profile');
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href={`/teachers/${teacherProfileId}`} className="text-sm text-primary-700">← Teacher profile</Link>
      {loading && !teacher ? (
        <p className="mt-8">Loading availability…</p>
      ) : queryError || !teacher ? (
        <p className="mt-8">Teacher not found.</p>
      ) : isOwnProfile ? (
        <section className="card mt-8 p-8 text-center">
          <h1 className="font-serif text-2xl font-bold">This is your teacher profile</h1>
          <p className="mt-2 text-gray-600">You cannot book yourself. Use the teacher calendar to manage recurring hours and time off.</p>
          <Link href="/dashboard/teacher/availability" className="btn-primary mt-5 inline-block rounded-lg px-5 py-2.5">Manage availability</Link>
        </section>
      ) : !teacher.isAvailable ? (
        <section className="card mt-8 p-8 text-center">
          <h1 className="font-serif text-2xl font-bold">Bookings are currently paused</h1>
          <p className="mt-2 text-gray-600">This teacher is not accepting new lesson requests at the moment.</p>
        </section>
      ) : (
        <>
          <h1 className="mt-4 font-serif text-3xl font-bold">Book {teacher.user?.displayName}</h1>
          <p className="mt-2 text-gray-600">{teacher.headline ?? teacher.teachingBio}</p>

          <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="h-5 w-5" />Choose a lesson</h2>
                  <p className="mt-1 text-sm text-gray-500">Only real, conflict-free openings are shown for the selected lesson length.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setWeekOffset((value) => Math.max(0, value - 1))} disabled={weekOffset === 0} className="rounded-lg border border-gray-200 p-2 disabled:opacity-30" aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="min-w-[9rem] text-center text-sm font-medium text-gray-600">
                    {weekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {new Date(rangeEnd.getTime() - 1).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                  <button type="button" onClick={() => setWeekOffset((value) => Math.min(MAX_WEEKS_AHEAD, value + 1))} disabled={weekOffset >= MAX_WEEKS_AHEAD} className="rounded-lg border border-gray-200 p-2 disabled:opacity-30" aria-label="Next week"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="mt-5">
                <WeeklySlotCalendar
                  weekStart={weekStart}
                  slots={durationSlots}
                  blocks={data?.teacherUnavailability ?? []}
                  selectedStartsAt={startsAt}
                  onSelect={(slot) => setStartsAt(slot.startsAt)}
                />
              </div>
              {durationSlots.length === 0 && (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  No openings for {instrument || 'this instrument'} in this week. Try the next week{selectedCapacity?.remainingCapacity === 0 ? ', or choose another instrument because this one is currently full' : ''}.
                </p>
              )}
              {slots[0]?.timezone && <p className="mt-3 text-xs text-gray-400">Teacher schedule: {slots[0].timezone}. Times are displayed in your device timezone.</p>}
            </section>

            <aside className="space-y-5">
              <section className="card p-5">
                <h2 className="flex items-center gap-2 font-semibold"><Music className="h-4 w-4" />Instrument</h2>
                <div className="mt-3 space-y-2">
                  {(teacher.instruments ?? []).map((item: string) => {
                    const capacity: any = capacityByInstrument.get(item);
                    const full = capacity?.remainingCapacity === 0;
                    return (
                      <button key={item} type="button" disabled={full} onClick={() => setInstrument(item)} className={`w-full rounded-xl border p-3 text-left ${instrument === item ? 'border-primary-500 bg-primary-50' : 'border-gray-200'} disabled:cursor-not-allowed disabled:opacity-50`}>
                        <span className="font-medium">{item}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {capacity?.remainingCapacity == null ? 'Accepting new students' : capacity.remainingCapacity === 0 ? 'Currently full' : `${capacity.remainingCapacity} student place${capacity.remainingCapacity === 1 ? '' : 's'} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="card p-5">
                <h2 className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" />Lesson details</h2>
                <label className="mt-3 block text-sm font-medium">
                  Lesson length
                  <select className="input mt-2 w-full" value={durationMin} onChange={(event) => setDurationMin(Number(event.target.value))}>
                    {DURATION_OPTIONS.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes / 60} hour{minutes === 60 ? '' : 's'}{teacher.hourlyRate ? ` · ${teacher.currency} ${(Number(teacher.hourlyRate) * (minutes / 60)).toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-3 text-sm"><strong>{durationMin} minutes</strong>{teacher.hourlyRate ? ` · ${teacher.currency} ${lessonPrice.toFixed(2)}` : ' · Free'}</p>
                <label className="mt-4 block text-sm font-medium">
                  <span className="flex items-center gap-2">{format === 'ONLINE' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}Format</span>
                  <select className="input mt-2 w-full" value={format} onChange={(event) => setFormat(event.target.value)}>
                    {availableFormats.map((item: string) => <option key={item} value={item}>{FORMAT_LABELS[item] ?? item}</option>)}
                  </select>
                </label>
                {startsAt && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Selected: {new Date(startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                <p className="mt-4 text-xs text-gray-500">Book at least {teacher.leadDays === 0 ? 'one calendar day' : `${teacher.leadDays} day${teacher.leadDays === 1 ? '' : 's'}`} ahead. Free cancellation up to {teacher.cancellationDays} days before.</p>
                {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
                {checkoutError && <p className="mt-4 text-sm text-red-600">{checkoutError}</p>}
                <button disabled={saving || checkingOut || !startsAt || !instrument} className="btn-primary mt-5 w-full rounded-lg px-5 py-2.5 disabled:opacity-50">
                  {saving ? 'Booking…' : checkingOut ? 'Redirecting…' : !session ? 'Sign in to book' : requiresPayment ? 'Continue to payment' : 'Request this lesson'}
                </button>
              </section>

              <p className="flex items-start gap-2 text-xs text-gray-500"><Users className="mt-0.5 h-4 w-4 shrink-0" />Student capacity is enforced when the lesson is confirmed, so places cannot be oversold.</p>
            </aside>
          </form>
        </>
      )}
    </main>
  );
}
