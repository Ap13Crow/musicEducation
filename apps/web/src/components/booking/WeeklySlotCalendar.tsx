'use client';

export type CalendarSlot = {
  startsAt: string;
  endsAt: string;
  timezone?: string | null;
};

export type CalendarBlock = {
  startsAt: string;
  endsAt: string;
  label?: string | null;
};

type Props = {
  weekStart: Date;
  slots: CalendarSlot[];
  blocks?: CalendarBlock[];
  selectedStartsAt?: string;
  onSelect?: (slot: CalendarSlot) => void;
  emptyLabel?: string;
  compact?: boolean;
};

const BLOCK_LABELS: Record<string, string> = {
  UNAVAILABLE: 'Unavailable',
  PRIVATE_APPOINTMENT: 'Unavailable',
  HOLIDAY: 'Holiday',
  VACATION: 'Vacation',
  OTHER_UNAVAILABLE: 'Unavailable',
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysOfWeek(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + offset);
    return date;
  });
}

export default function WeeklySlotCalendar({
  weekStart,
  slots,
  blocks = [],
  selectedStartsAt,
  onSelect,
  emptyLabel = 'No openings',
  compact = false,
}: Props) {
  const days = daysOfWeek(weekStart);
  const slotsByDay = new Map<string, CalendarSlot[]>();
  for (const slot of slots) {
    const key = dayKey(new Date(slot.startsAt));
    slotsByDay.set(key, [...(slotsByDay.get(key) ?? []), slot]);
  }

  const blockByDay = new Map<string, CalendarBlock>();
  for (const block of blocks) {
    const start = new Date(block.startsAt);
    const end = new Date(block.endsAt);
    for (const day of days) {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      if (start < dayEnd && end > dayStart) blockByDay.set(dayKey(day), block);
    }
  }

  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain pb-2" data-testid="weekly-slot-calendar-scroll">
      <div className={`grid min-w-[720px] grid-cols-7 gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        {days.map((day) => {
          const key = dayKey(day);
          const daySlots = (slotsByDay.get(key) ?? []).sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
          );
          const block = blockByDay.get(key);
          return (
            <section key={key} className="min-h-32 rounded-xl border border-gray-200 bg-white p-2.5">
              <header className="mb-2 border-b border-gray-100 pb-2 text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className="font-semibold text-gray-900">
                  {day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </div>
              </header>
              <div className="space-y-1.5">
                {daySlots.map((slot) => {
                  const selected = selectedStartsAt === slot.startsAt;
                  const label = new Date(slot.startsAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return onSelect ? (
                    <button
                      key={slot.startsAt}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${selected ? 'Selected' : 'Book'} ${day.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} at ${label}`}
                      onClick={() => onSelect(slot)}
                      className={`w-full rounded-lg border px-2 py-2 font-medium transition-colors ${
                        selected
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-primary-200 bg-white text-primary-700 hover:border-primary-500 hover:bg-primary-50'
                      }`}
                    >
                      {label}
                    </button>
                  ) : (
                    <div key={slot.startsAt} className="rounded-lg bg-emerald-50 px-2 py-1.5 text-center font-medium text-emerald-700">
                      {label}
                    </div>
                  );
                })}
                {daySlots.length === 0 && (
                  <p className="py-3 text-center text-xs text-gray-400">
                    {block ? BLOCK_LABELS[block.label ?? ''] ?? 'Unavailable' : emptyLabel}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
