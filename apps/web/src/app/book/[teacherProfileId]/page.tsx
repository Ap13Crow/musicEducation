'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Video } from 'lucide-react';

const GET = gql`
  query BookTeacher($id: ID!, $from: DateTime!, $to: DateTime!) {
    teacher(id: $id) {
      id headline teachingBio hourlyRate currency instruments teachingFormats
      leadDays cancellationDays
      availability { id dayOfWeek startTime endTime }
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

// Every format a teacher can be booked in when they haven't set
// teachingFormats at all (older profiles from before that field existed) -
// the previous behavior, kept as a fallback so a teacher with no formats
// configured isn't suddenly unbookable.
const ALL_FORMATS = ['ONLINE', 'IN_PERSON', 'HYBRID'];
const FORMAT_LABELS: Record<string, string> = { ONLINE: 'Online', IN_PERSON: 'In person', HYBRID: 'Hybrid' };

const UNAVAILABILITY_LABELS: Record<string, string> = {
  UNAVAILABLE: 'Unavailable',
  PRIVATE_APPOINTMENT: 'Private appointment',
  HOLIDAY: 'Holiday',
  VACATION: 'Vacation',
  OTHER_UNAVAILABLE: 'Unavailable',
};

// How many weeks the picker can navigate forward - bounded, like every
// other calendar query in this codebase, rather than an unbounded scroll.
const MAX_WEEKS_AHEAD = 8;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfWeek(d: Date): Date {
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  // Monday-start week - getDay() is 0=Sun..6=Sat, so Sunday needs +6 rather than -0.
  const diff = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - diff);
  return day;
}

// Mirrors bookingDeadline() in apps/api/src/lib/bookingPolicy.ts (the
// actual authority - this is a client-side approximation using the
// browser's local time, since TeacherAvailability doesn't expose the
// teacher's timezone to this query). leadDays 0 = open until the calendar
// day before the lesson; 1-7 = a fixed rolling window.
function isWithinLeadTime(startsAt: Date, leadDays: number, now: Date): boolean {
  if (leadDays === 0) {
    const midnightOfLessonDay = new Date(startsAt);
    midnightOfLessonDay.setHours(0, 0, 0, 0);
    return now.getTime() < midnightOfLessonDay.getTime();
  }
  return now.getTime() < startsAt.getTime() - leadDays * 24 * 60 * 60 * 1000;
}

interface HourCell {
  hour: number;
  startsAt: Date;
  bookable: boolean;
  blockedLabel: string | null;
}

export default function BookTeacherPage() {
  const { teacherProfileId } = useParams<{ teacherProfileId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [weekOffset, setWeekOffset] = useState(0);
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

  const { data, loading } = useQuery(GET, {
    variables: { id: teacherProfileId, from: weekStart.toISOString(), to: rangeEnd.toISOString() },
  });
  const [startsAt, setStartsAt] = useState('');
  const [format, setFormat] = useState('');
  const [book, { loading: saving, error }] = useMutation(BOOK);
  const [createCheckout, { loading: checkingOut }] = useMutation(CREATE_CHECKOUT_SESSION);
  const [checkoutError, setCheckoutError] = useState('');
  const teacher = data?.teacher;
  const isOwnProfile = Boolean(session?.user?.email && session.user.email === teacher?.user?.email);

  // Only a format the teacher actually offers can be selected - previously
  // every format was offered regardless of what the teacher set (direct
  // user feedback: "when a teacher set the appointment to a specific type
  // ... only these can be selected"). Falls back to every format for an
  // older profile that never set teachingFormats at all, so it doesn't
  // suddenly become unbookable.
  const availableFormats = useMemo(
    () => (teacher?.teachingFormats?.length ? teacher.teachingFormats : ALL_FORMATS),
    [teacher?.teachingFormats],
  );
  useEffect(() => {
    if (availableFormats.length > 0 && !availableFormats.includes(format)) {
      setFormat(availableFormats[0]);
    }
  }, [availableFormats, format]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }), [weekStart]);

  // The union of every hour any availability window covers - the grid's
  // row set. Kept at 60-minute granularity to match the fixed one-hour
  // lesson length, same as the availability the teacher actually publishes.
  const hourRows = useMemo(() => {
    const availability = teacher?.availability ?? [];
    let min = 24, max = 0;
    for (const w of availability) {
      const [sh] = w.startTime.split(':').map(Number);
      const [eh, em] = w.endTime.split(':').map(Number);
      min = Math.min(min, sh);
      max = Math.max(max, em > 0 || eh > sh ? eh + (em > 0 ? 1 : 0) : eh);
    }
    if (min > max) return [];
    const rows: number[] = [];
    for (let h = min; h < max; h++) rows.push(h);
    return rows;
  }, [teacher?.availability]);

  const now = new Date();
  const leadDays = teacher?.leadDays ?? 1;

  function cellFor(day: Date, hour: number): HourCell {
    const cellStart = new Date(day);
    cellStart.setHours(hour, 0, 0, 0);
    const dayOfWeek = cellStart.getDay();
    const inWindow = (teacher?.availability ?? []).some((w: any) => {
      if (w.dayOfWeek !== dayOfWeek) return false;
      const [sh, sm] = w.startTime.split(':').map(Number);
      const [eh, em] = w.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm, endMin = eh * 60 + em, cellMin = hour * 60;
      return cellMin >= startMin && cellMin + 60 <= endMin;
    });
    if (!inWindow) return { hour, startsAt: cellStart, bookable: false, blockedLabel: null };

    const block = (data?.teacherUnavailability ?? []).find((b: any) => {
      const bs = new Date(b.startsAt).getTime(), be = new Date(b.endsAt).getTime();
      return cellStart.getTime() < be && cellStart.getTime() + 60 * 60_000 > bs;
    });
    if (block) return { hour, startsAt: cellStart, bookable: false, blockedLabel: UNAVAILABILITY_LABELS[block.label] ?? 'Unavailable' };

    if (cellStart.getTime() <= now.getTime()) return { hour, startsAt: cellStart, bookable: false, blockedLabel: null };
    if (!isWithinLeadTime(cellStart, leadDays, now)) return { hour, startsAt: cellStart, bookable: false, blockedLabel: null };

    return { hour, startsAt: cellStart, bookable: true, blockedLabel: null };
  }

  // "The payment and check-out process for bookings is not working yet" -
  // direct user feedback. bookSession now always creates a priced lesson
  // PENDING (never CONFIRMED without payment - see the requiresPayment
  // comment in apps/api/src/resolvers/bookings.ts), so this is what
  // actually collects that payment: create the booking, then immediately
  // send the student to Stripe checkout for it, exactly like the existing
  // course-purchase flow (apps/web/src/app/courses/[slug]/page.tsx). A free
  // lesson (hourlyRate 0/null) skips checkout entirely, unchanged from
  // before.
  const requiresPayment = Number(teacher?.hourlyRate ?? 0) > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!startsAt) return;
    setCheckoutError('');
    const { data: bookData } = await book({
      variables: { input: { teacherProfileId, startsAt, durationMin: 60, format, instrument: teacher?.instruments?.[0] } },
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
        setCheckoutError('Could not start checkout - your request was saved, retry payment from your profile page.');
      } catch (checkoutErr) {
        setCheckoutError(checkoutErr instanceof Error ? checkoutErr.message : 'Could not start checkout.');
      }
      return;
    }
    router.push('/profile');
  }

  const selectedCell = startsAt ? new Date(startsAt) : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href={`/teachers/${teacherProfileId}`} className="text-sm text-primary-700">← Teacher profile</Link>
      {loading ? (
        <p className="mt-8">Loading…</p>
      ) : !teacher ? (
        <p className="mt-8">Teacher not found.</p>
      ) : isOwnProfile ? (
        <section className="card mt-8 p-8 text-center">
          <h1 className="font-serif text-2xl font-bold">This is your teacher profile</h1>
          <p className="mt-2 text-gray-600">You cannot book yourself. Manage your availability from the teacher workspace.</p>
          <Link href="/dashboard/teacher/availability" className="btn-primary mt-5 inline-block rounded-lg px-5 py-2.5">Manage availability</Link>
        </section>
      ) : (
        <>
          <h1 className="mt-4 font-serif text-3xl font-bold">Book {teacher.user?.displayName}</h1>
          <p className="mt-2 text-gray-600">{teacher.headline ?? teacher.teachingBio}</p>
          <form onSubmit={submit} className="mt-8 space-y-6">
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="h-5 w-5" />Availability</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-30"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[9rem] text-center text-sm font-medium text-gray-600">
                    {weekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => Math.min(MAX_WEEKS_AHEAD, w + 1))}
                    disabled={weekOffset >= MAX_WEEKS_AHEAD}
                    className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-30"
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {hourRows.length === 0 ? (
                <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">This teacher has not published any bookable hours yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-separate border-spacing-1 text-sm">
                    <thead>
                      <tr>
                        <th className="w-16" />
                        {days.map((d) => (
                          <th key={d.toISOString()} className="pb-1 text-center font-medium text-gray-600">
                            <div>{DAY_LABELS[(d.getDay() + 6) % 7]}</div>
                            <div className="text-xs font-normal text-gray-400">{d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hourRows.map((hour) => (
                        <tr key={hour}>
                          <td className="pr-1 text-right text-xs text-gray-400">{String(hour).padStart(2, '0')}:00</td>
                          {days.map((d) => {
                            const cell = cellFor(d, hour);
                            const isSelected = selectedCell?.getTime() === cell.startsAt.getTime();
                            if (cell.blockedLabel) {
                              return (
                                <td key={d.toISOString()} className="rounded-lg bg-gray-100 p-1.5 text-center text-[11px] text-gray-400" title={cell.blockedLabel}>
                                  {cell.blockedLabel}
                                </td>
                              );
                            }
                            if (!cell.bookable) {
                              return <td key={d.toISOString()} className="rounded-lg p-1.5" />;
                            }
                            // Every cell in the grid renders the same visible
                            // "Book"/"Selected" text, so a screen reader
                            // stepping through a row of identical buttons has
                            // no way to tell them apart without this - the
                            // full date and time, not just the hour, since
                            // that's what's actually being booked (Copilot
                            // review finding on PR #54).
                            const cellLabel = `${isSelected ? 'Selected: ' : 'Book '}${cell.startsAt.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`;
                            return (
                              <td key={d.toISOString()} className="p-0.5">
                                <button
                                  type="button"
                                  onClick={() => setStartsAt(cell.startsAt.toISOString())}
                                  aria-pressed={isSelected}
                                  aria-label={cellLabel}
                                  className={`w-full rounded-lg border py-1.5 text-xs transition-colors ${
                                    isSelected ? 'border-primary-600 bg-primary-50 font-semibold text-primary-700' : 'border-gray-200 hover:border-primary-300'
                                  }`}
                                >
                                  Book
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-gray-100" /> Blocked by the teacher</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded border border-primary-600 bg-primary-50" /> Selected</span>
                  </p>
                </div>
              )}
            </section>
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5" />Lesson details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs uppercase text-gray-500">Duration</p>
                  <p className="mt-1 font-semibold">60 minutes</p>
                </div>
                <label className="rounded-xl border border-gray-200 p-4 text-sm">
                  <span className="flex items-center gap-2 font-medium">{format === 'ONLINE' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}Format</span>
                  <select className="input mt-2 w-full" value={format} onChange={(e) => setFormat(e.target.value)}>
                    {availableFormats.map((f: string) => (
                      <option key={f} value={f}>{FORMAT_LABELS[f] ?? f}</option>
                    ))}
                  </select>
                </label>
              </div>
              {teacher.hourlyRate ? (
                <p className="mt-4 text-sm text-gray-600">
                  Price: {teacher.currency} {Number(teacher.hourlyRate).toFixed(2)} for one hour - you&rsquo;ll pay by card on the next step.
                </p>
              ) : (
                <p className="mt-4 text-sm text-gray-600">This teacher offers free lessons.</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                Bookable up to {leadDays === 0 ? 'the end of the day before the lesson' : `${leadDays} day${leadDays === 1 ? '' : 's'} in advance`}.
                {teacher.cancellationDays ? ` Free cancellation up to ${teacher.cancellationDays} days before - after that, the lesson still counts as taken.` : ''}
              </p>
              {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
              {checkoutError && <p className="mt-4 text-sm text-red-600">{checkoutError}</p>}
              <button disabled={saving || checkingOut || !startsAt} className="btn-primary mt-5 rounded-lg px-5 py-2.5 disabled:opacity-50">
                {saving ? 'Booking…' : checkingOut ? 'Redirecting to payment…' : requiresPayment ? 'Continue to payment' : 'Request this lesson'}
              </button>
            </section>
          </form>
        </>
      )}
    </main>
  );
}
