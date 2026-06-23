'use client';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';

const GET_EVENTS = gql`
  query GetEvents {
    events(page: 1, limit: 20) {
      nodes {
        id slug title description type format
        city country startsAt endsAt price currency thumbnailUrl
        instruments musicStyles skillLevels
      }
    }
  }
`;

const fallbackEvents = [
  {
    id: 'e1',
    title: 'Masterclass: Chopin Nocturnes',
    city: 'Zurich',
    startsAt: '2026-06-12T18:00:00Z',
    type: 'MASTERCLASS',
  },
  {
    id: 'e2',
    title: 'Young Artists Chamber Night',
    city: 'Basel',
    startsAt: '2026-06-19T19:30:00Z',
    type: 'CONCERT',
  },
  {
    id: 'e3',
    title: 'Ear Training Intensive Weekend',
    city: 'Geneva',
    startsAt: '2026-07-02T09:00:00Z',
    type: 'WORKSHOP',
  },
];

const TYPE_LABELS: Record<string, string> = {
  MASTERCLASS: 'Masterclass',
  CONCERT: 'Performance',
  WORKSHOP: 'Workshop',
  COMPETITION: 'Competition',
  OPEN_MIC: 'Open Mic',
  LECTURE: 'Lecture',
  OTHER: 'Event',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const ticketsUrl = process.env.NEXT_PUBLIC_TICKETS_URL ?? 'https://tickets.mymusic.coach';

export default function EventsPage() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
  const { data, loading } = useQuery(GET_EVENTS, { skip: !liveApiEnabled });

  const events: any[] = data?.events?.nodes?.length ? data.events.nodes : fallbackEvents;

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

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 w-2/3 rounded bg-gray-200 mb-2" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((eventItem) => (
              <article key={eventItem.id} className="card p-6 sm:flex sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{eventItem.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {eventItem.city} · {formatDate(eventItem.startsAt)}
                  </p>
                  <p className="mt-2 inline-block rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                    {TYPE_LABELS[eventItem.type] ?? eventItem.type}
                  </p>
                </div>
                <button
                  className="btn-primary mt-4 sm:mt-0"
                  onClick={() => window.open(`${ticketsUrl}/mymusic-coach/`, '_blank', 'noopener')}
                >
                  Buy Ticket
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link href="/courses" className="btn-secondary">
            Improve Before Your Next Event
          </Link>
        </div>
      </section>
    </main>
  );
}
