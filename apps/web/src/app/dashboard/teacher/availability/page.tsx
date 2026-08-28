'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Clock3, Plus, Repeat2, X } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';
import TeacherWeekCalendar, { type ScheduleItem } from '@/components/booking/TeacherWeekCalendar';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const START_TIMES = Array.from({ length: 69 }, (_, index) => {
  const value = 6 * 60 + index * 15;
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
});
const END_TIMES = Array.from({ length: 69 }, (_, index) => {
  const value = 7 * 60 + index * 15;
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}).filter((value) => value < '24:00');

const GET = gql`
  query TeacherSchedule($from: DateTime!, $to: DateTime!) {
    me {
      profile { timezone }
      teacherProfile {
        id
        availability { id dayOfWeek startTime endTime timezone }
        bookableSlots(from: $from, to: $to, limit: 300) { startsAt endsAt timezone }
      }
    }
    myBookings(page: 1, limit: 100, from: $from, to: $to) {
      id teacherProfileId startsAt endsAt status instrument
      student { displayName }
    }
    myAppointments(from: $from, to: $to) { id title startsAt endsAt notes }
  }
`;
const GET_UNAVAILABILITY = gql`
  query TeacherUnavailabilityBlocks($teacherProfileId: ID!, $from: DateTime!, $to: DateTime!) {
    teacherUnavailability(teacherProfileId: $teacherProfileId, from: $from, to: $to) {
      id startsAt endsAt label note
    }
  }
`;
const PROVISION = gql`mutation ProvisionTeacher { applyAsTeacher { id } }`;
const SAVE = gql`
  mutation SaveTeacherSlots($slots: [AvailabilitySlotInput!]!) {
    setAvailability(slots: $slots) { id dayOfWeek startTime endTime timezone }
  }
`;
const CREATE_UNAVAILABILITY = gql`
  mutation CreateUnavailabilityBlock($startsAt: DateTime!, $endsAt: DateTime!, $label: UnavailabilityLabel!, $note: String) {
    createUnavailability(startsAt: $startsAt, endsAt: $endsAt, label: $label, note: $note) { id }
  }
`;
const DELETE_UNAVAILABILITY = gql`mutation DeleteUnavailabilityBlock($id: ID!) { deleteUnavailability(id: $id) }`;

type Rule = { dayOfWeek: number; startTime: string; endTime: string; timezone: string };

const UNAVAILABILITY_LABELS = [
  { value: 'UNAVAILABLE', label: 'Unavailable' },
  { value: 'PRIVATE_APPOINTMENT', label: 'Private appointment' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'VACATION', label: 'Vacation' },
  { value: 'OTHER_UNAVAILABLE', label: 'Other' },
];

function toMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function endTimeOptions(start: string): string[] {
  return END_TIMES.filter((value) => toMinutes(value) >= toMinutes(start) + 60);
}

function startOfWeek(value: Date): Date {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return day;
}

export default function TeacherAvailabilityPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [rulesDraft, setRulesDraft] = useState<Rule[] | null>(null);
  const [repeatDraft, setRepeatDraft] = useState({ days: [1] as number[], startTime: '09:00', endTime: '13:00' });
  const [blockDraft, setBlockDraft] = useState({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', label: 'UNAVAILABLE', note: '' });
  const [blockFormError, setBlockFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
  const variables = { from: weekStart.toISOString(), to: rangeEnd.toISOString() };

  const { data, loading, refetch } = useQuery(GET, { variables, fetchPolicy: 'cache-and-network' });
  const teacherProfile = data?.me?.teacherProfile;
  const timezone = data?.me?.profile?.timezone ?? 'Europe/Zurich';
  const { data: unavailableData, refetch: refetchUnavailable } = useQuery(GET_UNAVAILABILITY, {
    variables: { teacherProfileId: teacherProfile?.id ?? '', ...variables },
    skip: !teacherProfile?.id,
    fetchPolicy: 'cache-and-network',
  });
  const [provision, { loading: provisioning }] = useMutation(PROVISION);
  const [save, { loading: saving, error }] = useMutation(SAVE);
  const [createBlock, { loading: creatingBlock, error: blockError }] = useMutation(CREATE_UNAVAILABILITY);
  const [removeBlock] = useMutation(DELETE_UNAVAILABILITY);

  const currentRules: Rule[] = rulesDraft ?? (teacherProfile?.availability ?? []).map((rule: any) => ({
    dayOfWeek: rule.dayOfWeek,
    startTime: rule.startTime,
    endTime: rule.endTime,
    timezone: rule.timezone || timezone,
  }));

  const scheduleItems: ScheduleItem[] = useMemo(() => {
    if (!teacherProfile) return [];
    const openings = (teacherProfile.bookableSlots ?? []).map((slot: any) => ({
      id: slot.startsAt,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      label: 'Open',
      detail: 'Student can book',
      kind: 'OPEN' as const,
    }));
    const bookings = (data?.myBookings ?? [])
      .filter((booking: any) => booking.teacherProfileId === teacherProfile.id && booking.status !== 'CANCELLED')
      .map((booking: any) => ({
        id: booking.id,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        label: booking.status === 'PENDING' ? 'Held' : 'Lesson',
        detail: [booking.instrument, booking.student?.displayName, booking.status].filter(Boolean).join(' · '),
        kind: 'BOOKING' as const,
      }));
    const unavailable = (unavailableData?.teacherUnavailability ?? []).map((block: any) => ({
      id: block.id,
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      label: UNAVAILABILITY_LABELS.find((item) => item.value === block.label)?.label ?? 'Unavailable',
      detail: block.note,
      kind: 'UNAVAILABLE' as const,
    }));
    const appointments = (data?.myAppointments ?? []).map((appointment: any) => ({
      id: appointment.id,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      label: appointment.title,
      detail: 'Private appointment',
      kind: 'APPOINTMENT' as const,
    }));
    return [...openings, ...bookings, ...unavailable, ...appointments];
  }, [data?.myAppointments, data?.myBookings, teacherProfile, unavailableData?.teacherUnavailability]);

  async function ensureProfile() {
    await provision();
    await refetch();
  }

  function toggleRepeatDay(day: number) {
    setRepeatDraft((draft) => ({
      ...draft,
      days: draft.days.includes(day) ? draft.days.filter((value) => value !== day) : [...draft.days, day].sort(),
    }));
  }

  function addRecurringInterval() {
    if (!repeatDraft.days.length) return;
    setSaved(false);
    setRulesDraft([
      ...currentRules,
      ...repeatDraft.days.map((dayOfWeek) => ({
        dayOfWeek,
        startTime: repeatDraft.startTime,
        endTime: repeatDraft.endTime,
        timezone,
      })),
    ]);
  }

  function changeRule(index: number, key: 'dayOfWeek' | 'startTime' | 'endTime', value: string | number) {
    setSaved(false);
    setRulesDraft(currentRules.map((rule, ruleIndex) => {
      if (ruleIndex !== index) return rule;
      const updated = { ...rule, [key]: value } as Rule;
      if (key === 'startTime' && toMinutes(String(value)) + 60 > toMinutes(rule.endTime)) {
        updated.endTime = endTimeOptions(String(value))[0] ?? rule.endTime;
      }
      return updated;
    }));
  }

  async function publishRules() {
    await save({ variables: { slots: currentRules.map(({ dayOfWeek, startTime, endTime, timezone: ruleTimezone }) => ({ dayOfWeek, startTime, endTime, timezone: ruleTimezone })) } });
    setRulesDraft(null);
    setSaved(true);
    await refetch();
  }

  async function addBlock(event: React.FormEvent) {
    event.preventDefault();
    if (!blockDraft.startDate) return;
    const endDate = blockDraft.endDate || blockDraft.startDate;
    const start = new Date(`${blockDraft.startDate}T${blockDraft.startTime}:00`);
    const end = new Date(`${endDate}T${blockDraft.endTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setBlockFormError('The time off end must be after the start.');
      return;
    }
    setBlockFormError(null);
    const startsAt = start.toISOString();
    const endsAt = end.toISOString();
    await createBlock({ variables: { startsAt, endsAt, label: blockDraft.label, note: blockDraft.note.trim() || null } });
    setBlockDraft((draft) => ({ ...draft, note: '' }));
    await Promise.all([refetchUnavailable(), refetch()]);
  }

  async function deleteBlock(id: string) {
    await removeBlock({ variables: { id } });
    await Promise.all([refetchUnavailable(), refetch()]);
  }

  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher/availability">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Availability and calendar</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">Publish recurring weekly intervals once. MyMusicCoach turns them into bookable openings, then removes bookings, holds, time off and private calendar conflicts automatically.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">Schedule timezone: {timezone}</span>
        </div>

        {loading && !teacherProfile ? <p className="mt-8">Loading…</p> : !teacherProfile ? (
          <button className="btn-primary mt-8 rounded-lg px-4 py-2" disabled={provisioning} onClick={() => void ensureProfile()}>{provisioning ? 'Preparing…' : 'Initialize teacher workspace'}</button>
        ) : (
          <>
            <section className="card mt-8 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarRange className="h-5 w-5" />Weekly calendar</h2>
                  <p className="mt-1 text-sm text-gray-500">Green is bookable; blue is held/booked; amber and violet are blocked.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setWeekOffset((value) => Math.max(-4, value - 1))} disabled={weekOffset <= -4} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Previous calendar week"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="min-w-28 text-center text-sm text-gray-600">{weekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {new Date(rangeEnd.getTime() - 1).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                  <button type="button" onClick={() => setWeekOffset((value) => Math.min(12, value + 1))} disabled={weekOffset >= 12} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Next calendar week"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-5"><TeacherWeekCalendar weekStart={weekStart} items={scheduleItems} /></div>
            </section>

            <section className="card mt-8 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Repeat2 className="h-5 w-5" />Recurring lesson hours</h2>
              <p className="mt-1 text-sm text-gray-500">Choose several weekdays to add the same interval in one step. Lessons repeat weekly until you remove the rule.</p>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="flex flex-wrap gap-2">{SHORT_DAYS.map((day, index) => <button key={day} type="button" onClick={() => toggleRepeatDay(index)} className={`rounded-full border px-3 py-1.5 text-sm ${repeatDraft.days.includes(index) ? 'border-primary-500 bg-primary-50 font-medium text-primary-700' : 'border-gray-200 bg-white text-gray-600'}`}>{day}</button>)}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <label className="text-sm font-medium">Starts<select className="input mt-1 w-full" value={repeatDraft.startTime} onChange={(event) => { const startTime = event.target.value; setRepeatDraft((draft) => ({ ...draft, startTime, endTime: toMinutes(draft.endTime) >= toMinutes(startTime) + 60 ? draft.endTime : endTimeOptions(startTime)[0] ?? draft.endTime })); }}>{START_TIMES.map((time) => <option key={time}>{time}</option>)}</select></label>
                  <label className="text-sm font-medium">Ends<select className="input mt-1 w-full" value={repeatDraft.endTime} onChange={(event) => setRepeatDraft((draft) => ({ ...draft, endTime: event.target.value }))}>{endTimeOptions(repeatDraft.startTime).map((time) => <option key={time}>{time}</option>)}</select></label>
                  <button type="button" onClick={addRecurringInterval} className="btn-secondary self-end rounded-lg px-4 py-2"><Plus className="mr-1 inline h-4 w-4" />Add weekly interval</button>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {currentRules.map((rule, index) => <div key={`${rule.dayOfWeek}-${rule.startTime}-${index}`} className="grid items-end gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <label className="text-sm font-medium">Day<select className="input mt-1 w-full" value={rule.dayOfWeek} onChange={(event) => changeRule(index, 'dayOfWeek', Number(event.target.value))}>{DAYS.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}</select></label>
                  <label className="text-sm font-medium">Starts<select className="input mt-1 w-full" value={rule.startTime} onChange={(event) => changeRule(index, 'startTime', event.target.value)}>{START_TIMES.map((time) => <option key={time}>{time}</option>)}</select></label>
                  <label className="text-sm font-medium">Ends<select className="input mt-1 w-full" value={rule.endTime} onChange={(event) => changeRule(index, 'endTime', event.target.value)}>{endTimeOptions(rule.startTime).map((time) => <option key={time}>{time}</option>)}</select></label>
                  <button type="button" className="mb-2 flex items-center gap-1 text-sm text-red-600" onClick={() => { setSaved(false); setRulesDraft(currentRules.filter((_, ruleIndex) => ruleIndex !== index)); }}><X className="h-4 w-4" />Remove</button>
                </div>)}
                {currentRules.length === 0 && <p className="rounded-xl border border-dashed p-6 text-sm text-gray-500">No recurring lesson hours yet.</p>}
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
              {saved && <p className="mt-4 text-sm font-medium text-emerald-700">Published. Students now see the updated openings.</p>}
              <button className="btn-primary mt-5 rounded-lg px-5 py-2.5" disabled={saving} onClick={() => void publishRules()}>{saving ? 'Publishing…' : 'Publish availability'}</button>
            </section>

            <section className="card mt-8 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Clock3 className="h-5 w-5" />Time off and exceptions</h2>
              <p className="mt-1 text-sm text-gray-500">A one-time block overrides the recurring schedule immediately. Private notes are never shown to students.</p>
              <div className="mt-4 space-y-2">
                {(unavailableData?.teacherUnavailability ?? []).map((block: any) => <div key={block.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"><span>{new Date(block.startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} – {new Date(block.endsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · {UNAVAILABILITY_LABELS.find((item) => item.value === block.label)?.label ?? block.label}{block.note ? ` · ${block.note}` : ''}</span><button type="button" className="text-red-600" onClick={() => void deleteBlock(block.id)}>Remove</button></div>)}
                {(unavailableData?.teacherUnavailability ?? []).length === 0 && <p className="text-sm text-gray-500">No blocks in this displayed week.</p>}
              </div>
              <form onSubmit={addBlock} className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-6">
                <label className="text-sm font-medium">Start date<input type="date" required className="input mt-1 w-full" value={blockDraft.startDate} onChange={(event) => setBlockDraft({ ...blockDraft, startDate: event.target.value, endDate: blockDraft.endDate || event.target.value })} /></label>
                <label className="text-sm font-medium">End date<input type="date" required className="input mt-1 w-full" value={blockDraft.endDate || blockDraft.startDate} min={blockDraft.startDate || undefined} onChange={(event) => setBlockDraft({ ...blockDraft, endDate: event.target.value })} /></label>
                <label className="text-sm font-medium">From<input type="time" step="900" className="input mt-1 w-full" value={blockDraft.startTime} onChange={(event) => setBlockDraft({ ...blockDraft, startTime: event.target.value })} /></label>
                <label className="text-sm font-medium">To<input type="time" step="900" className="input mt-1 w-full" value={blockDraft.endTime} onChange={(event) => setBlockDraft({ ...blockDraft, endTime: event.target.value })} /></label>
                <label className="text-sm font-medium">Label<select className="input mt-1 w-full" value={blockDraft.label} onChange={(event) => setBlockDraft({ ...blockDraft, label: event.target.value })}>{UNAVAILABILITY_LABELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label className="text-sm font-medium">Private note<input className="input mt-1 w-full" value={blockDraft.note} onChange={(event) => setBlockDraft({ ...blockDraft, note: event.target.value })} placeholder="Optional" /></label>
                <div className="sm:col-span-6">{(blockFormError || blockError) && <p className="mb-2 text-sm text-red-600">{blockFormError ?? blockError?.message}</p>}<button disabled={creatingBlock} className="btn-secondary rounded-lg px-4 py-2 text-sm">{creatingBlock ? 'Adding…' : 'Add time off'}</button></div>
              </form>
            </section>
          </>
        )}
      </main>
    </RoleGate>
  );
}
