'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Clock, Plus, Trash2, Save, ChevronLeft, CheckCircle } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const GET_MY_AVAILABILITY = gql`
  query GetMyAvailability {
    myAvailability {
      id
      dayOfWeek
      startTime
      endTime
      timezone
    }
  }
`;

const SET_STUDENT_AVAILABILITY = gql`
  mutation SetStudentAvailability($slots: [AvailabilitySlotInput!]!) {
    setStudentAvailability(slots: $slots) {
      id
      dayOfWeek
      startTime
      endTime
      timezone
    }
  }
`;

interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

function timeOptions(): string[] {
  const opts: string[] = [];
  for (let h = 6; h <= 22; h++) {
    opts.push(`${String(h).padStart(2, '0')}:00`);
    opts.push(`${String(h).padStart(2, '0')}:30`);
  }
  return opts;
}
const TIMES = timeOptions();

export default function AvailabilityPage() {
  const { data, loading } = useQuery(GET_MY_AVAILABILITY);
  const [save, { loading: saving }] = useMutation(SET_STUDENT_AVAILABILITY, {
    refetchQueries: [GET_MY_AVAILABILITY],
  });
  const [saved, setSaved] = useState(false);

  const initialSlots = (): Slot[] =>
    (data?.myAvailability ?? []).map((s: any) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      timezone: s.timezone ?? 'Europe/Zurich',
    }));

  const [slots, setSlots] = useState<Slot[] | null>(null);
  const working: Slot[] = slots ?? initialSlots();

  function addSlot(day: number) {
    const cur = slots ?? initialSlots();
    setSlots([...cur, { dayOfWeek: day, startTime: '09:00', endTime: '11:00', timezone: 'Europe/Zurich' }]);
    setSaved(false);
  }

  function removeSlot(idx: number) {
    const cur = slots ?? initialSlots();
    setSlots(cur.filter((_, i) => i !== idx));
    setSaved(false);
  }

  function updateSlot(idx: number, field: 'startTime' | 'endTime', value: string) {
    const cur = slots ?? initialSlots();
    setSlots(cur.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
    setSaved(false);
  }

  async function handleSave() {
    await save({ variables: { slots: working } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          <h1 className="text-xl font-semibold text-gray-900">My Availability</h1>
        </div>
      </div>

      <p className="mb-6 text-sm text-gray-500">
        Declare which times you're generally available for lessons. Your teacher and admin can use
        this to suggest suitable lesson slots. This is a self-declaration — no booking is made here.
      </p>

      <div className="space-y-4">
        {DAYS.map((dayName, dayIdx) => {
          const daySlots = working
            .map((s, i) => ({ ...s, idx: i }))
            .filter((s) => s.dayOfWeek === dayIdx);

          return (
            <div key={dayIdx} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">{dayName}</h3>
                <button
                  onClick={() => addSlot(dayIdx)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add slot
                </button>
              </div>

              {daySlots.length === 0 ? (
                <p className="mt-2 text-xs text-gray-400">Not available</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {daySlots.map(({ idx }) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={working[idx].startTime}
                        onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      >
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-xs text-gray-400">to</span>
                      <select
                        value={working[idx].endTime}
                        onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      >
                        {TIMES.filter((t) => t > working[idx].startTime).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button
                        onClick={() => removeSlot(idx)}
                        className="ml-auto text-gray-300 hover:text-red-400"
                        aria-label="Remove slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save availability
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
