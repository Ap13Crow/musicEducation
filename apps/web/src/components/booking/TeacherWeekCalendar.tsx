'use client';

type ScheduleItem = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  detail?: string | null;
  kind: 'OPEN' | 'BOOKING' | 'UNAVAILABLE' | 'APPOINTMENT';
};

type Props = {
  weekStart: Date;
  items: ScheduleItem[];
};

const KIND_STYLES: Record<ScheduleItem['kind'], string> = {
  OPEN: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  BOOKING: 'border-blue-200 bg-blue-50 text-blue-800',
  UNAVAILABLE: 'border-amber-200 bg-amber-50 text-amber-800',
  APPOINTMENT: 'border-violet-200 bg-violet-50 text-violet-800',
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function TeacherWeekCalendar({ weekStart, items }: Props) {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + offset);
    return date;
  });

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[840px] grid-cols-7 gap-2">
        {days.map((day) => {
          const key = dayKey(day);
          const dayItems = items
            .filter((item) => dayKey(new Date(item.startsAt)) === key)
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
          return (
            <section key={key} className="min-h-48 rounded-xl border border-gray-200 bg-white p-2.5">
              <header className="mb-2 border-b border-gray-100 pb-2 text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className="font-semibold">{day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
              </header>
              <div className="space-y-1.5">
                {dayItems.map((item) => (
                  <div key={`${item.kind}-${item.id}-${item.startsAt}`} className={`rounded-lg border px-2 py-1.5 text-xs ${KIND_STYLES[item.kind]}`}>
                    <div className="font-semibold">{new Date(item.startsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {item.label}</div>
                    {item.detail && <div className="mt-0.5 opacity-80">{item.detail}</div>}
                  </div>
                ))}
                {dayItems.length === 0 && <p className="py-4 text-center text-xs text-gray-400">Nothing scheduled</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export type { ScheduleItem };
