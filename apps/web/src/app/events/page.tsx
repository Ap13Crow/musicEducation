import Link from 'next/link';

const events = [
  {
    title: 'Masterclass: Chopin Nocturnes',
    city: 'Zurich',
    date: 'June 12, 2026',
    type: 'Masterclass',
  },
  {
    title: 'Young Artists Chamber Night',
    city: 'Basel',
    date: 'June 19, 2026',
    type: 'Performance',
  },
  {
    title: 'Ear Training Intensive Weekend',
    city: 'Geneva',
    date: 'July 2, 2026',
    type: 'Workshop',
  },
];

export default function EventsPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Performance Pillar
        </p>
        <h1 className="mb-4 text-4xl font-bold">Concerts, Workshops, and Masterclasses</h1>
        <p className="mb-10 max-w-3xl text-gray-600">
          Discover upcoming classical music events near you and reserve your place directly on My Music Coach.
        </p>

        <div className="space-y-4">
          {events.map((eventItem) => (
            <article key={eventItem.title} className="card p-6 sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{eventItem.title}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {eventItem.city} · {eventItem.date}
                </p>
                <p className="mt-2 inline-block rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                  {eventItem.type}
                </p>
              </div>
              <button className="btn-primary mt-4 sm:mt-0">Reserve Seat</button>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/courses" className="btn-secondary">
            Improve Before Your Next Event
          </Link>
        </div>
      </section>
    </main>
  );
}
