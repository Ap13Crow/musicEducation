'use client';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { CalendarX } from 'lucide-react';

const GET_EVENTS = gql`
  query GetEvents {
    events(page: 1, limit: 20) {
      nodes {
        id slug title description type format
        city country startsAt endsAt price currency thumbnailUrl
        instruments musicStyles skillLevels
      }
    }
    externalEvents(page: 1, limit: 12) {
      nodes {
        id provider title url imageUrl startsAt venueName city country
        minPrice maxPrice currency classifications attribution
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

const PROVIDER_LABELS: Record<string, string> = {
  TICKETMASTER: 'Ticketmaster',
  CLASSICTIC: 'Classictic',
};

function formatPriceRange(minPrice: number | null, maxPrice: number | null, currency: string | null) {
  if (minPrice == null && maxPrice == null) return null;
  const cur = currency ?? '';
  const amount =
    minPrice != null && maxPrice != null && minPrice !== maxPrice ? `${minPrice}–${maxPrice}` : `${minPrice ?? maxPrice}`;
  return cur ? `${cur} ${amount}` : amount;
}

export default function EventsPage() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
  const { data, loading, error } = useQuery(GET_EVENTS, { skip: !liveApiEnabled });

  // Fallback demo data is only for when the live API genuinely can't be
  // reached (disabled in this environment, or the query errored) - a
  // successful query that legitimately found zero published events must
  // render an honest empty state below, not three fake events with a real
  // "Buy Ticket" button.
  const usingFallback = !liveApiEnabled || Boolean(error);
  const events: any[] = usingFallback ? fallbackEvents : data?.events?.nodes ?? [];
  const externalEvents: any[] = data?.externalEvents?.nodes ?? [];

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

        {!liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Live API is disabled in this environment. Showing sample event data.
          </p>
        )}

        {error && liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Live API is currently unavailable. Showing sample event data.
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 w-2/3 rounded bg-gray-200 mb-2" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
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
        ) : (
          <div className="py-16 text-center">
            <CalendarX className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No upcoming events published yet — check back soon.</p>
          </div>
        )}

        {externalEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-2 text-2xl font-bold">More concerts nearby</h2>
            <p className="mb-6 max-w-3xl text-sm text-gray-600">
              Discovered from external listings — purchase happens on the provider&rsquo;s own site.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {externalEvents.map((ext) => (
                <a
                  key={ext.id}
                  href={ext.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-primary-300"
                >
                  {ext.imageUrl && (
                    <img src={ext.imageUrl} alt="" className="h-36 w-full object-cover" />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-1 inline-block w-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      via {PROVIDER_LABELS[ext.provider] ?? ext.provider}
                    </span>
                    <h3 className="font-semibold leading-snug">{ext.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {[ext.city ?? ext.venueName, formatDate(ext.startsAt)].filter(Boolean).join(' · ')}
                    </p>
                    {formatPriceRange(ext.minPrice, ext.maxPrice, ext.currency) && (
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatPriceRange(ext.minPrice, ext.maxPrice, ext.currency)}
                      </p>
                    )}
                    <p className="mt-auto pt-3 text-xs text-gray-400">{ext.attribution}</p>
                  </div>
                </a>
              ))}
            </div>
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
