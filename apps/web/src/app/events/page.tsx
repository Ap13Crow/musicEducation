'use client';

import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Calendar, CalendarX, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

// Same vocabulary the onboarding assessment and profile use, and what the
// worker's event-classification job is instructed to tag external events
// with - a filter here only works if it matches what can actually get set.
const INSTRUMENTS = ['Piano', 'Violin', 'Viola', 'Cello', 'Double Bass', 'Flute', 'Oboe', 'Clarinet', 'Bassoon', 'Horn', 'Trumpet', 'Trombone', 'Guitar', 'Harp', 'Voice'];
const STYLES = ['Baroque', 'Classical', 'Romantic', 'Contemporary', 'Opera', 'Chamber Music', 'Orchestral', 'Solo Piano', 'Early Music'];
const SKILL_LEVELS = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];
const SKILL_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner', ELEMENTARY: 'Elementary', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced', PROFESSIONAL: 'Professional',
};

const GET_EVENTS = gql`
  query GetEvents($filter: EventFilterInput, $extFilter: ExternalEventFilterInput) {
    events(filter: $filter, page: 1, limit: 20) {
      nodes {
        id slug title description type format
        city country startsAt endsAt price currency thumbnailUrl
        instruments musicStyles skillLevels
      }
    }
    externalEvents(filter: $extFilter, page: 1, limit: 12) {
      nodes {
        id provider title url imageUrl startsAt venueName city country
        minPrice maxPrice currency classifications attribution
        instruments musicStyles skillLevels
      }
    }
  }
`;

const GET_RECOMMENDED = gql`
  query GetRecommendedExternalEvents {
    recommendedExternalEvents(limit: 4) {
      id provider title url imageUrl startsAt venueName city country
      minPrice maxPrice currency classifications attribution
      instruments musicStyles skillLevels
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

function ExternalEventCard({ ext }: { ext: any }) {
  return (
    <a
      href={ext.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-primary-300"
    >
      {ext.imageUrl && <img src={ext.imageUrl} alt="" className="h-36 w-full object-cover" />}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 inline-block w-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          via {PROVIDER_LABELS[ext.provider] ?? ext.provider}
        </span>
        <h3 className="font-semibold leading-snug">{ext.title}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {[ext.city ?? ext.venueName, formatDate(ext.startsAt)].filter(Boolean).join(' · ')}
        </p>
        {(ext.instruments?.length > 0 || ext.musicStyles?.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[...(ext.instruments ?? []), ...(ext.musicStyles ?? [])].slice(0, 3).map((tag: string) => (
              <span key={tag} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">{tag}</span>
            ))}
          </div>
        )}
        {formatPriceRange(ext.minPrice, ext.maxPrice, ext.currency) && (
          <p className="mt-1 text-sm font-medium text-gray-800">{formatPriceRange(ext.minPrice, ext.maxPrice, ext.currency)}</p>
        )}
        <p className="mt-auto pt-3 text-xs text-gray-400">{ext.attribution}</p>
      </div>
    </a>
  );
}

export default function EventsPage() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
  const { data: session } = useSession();

  const [search, setSearch] = useState('');
  const [instrument, setInstrument] = useState('');
  const [musicStyle, setMusicStyle] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Computed once per page load, not on every render: `new Date()` differs
  // by milliseconds each call, which Apollo would otherwise see as changed
  // query variables on every render and refetch accordingly.
  const [now] = useState(() => new Date().toISOString());

  const hasActiveFilters = Boolean(search || instrument || musicStyle || skillLevel || fromDate);
  const minDate = fromDate ? new Date(fromDate).toISOString() : now;
  const sharedFilter = {
    search: search || undefined,
    instrument: instrument || undefined,
    musicStyle: musicStyle || undefined,
    skillLevel: skillLevel || undefined,
    minDate,
  };

  const { data, loading, error } = useQuery(GET_EVENTS, {
    variables: { filter: sharedFilter, extFilter: sharedFilter },
    skip: !liveApiEnabled,
  });
  const { data: recommendedData } = useQuery(GET_RECOMMENDED, { skip: !liveApiEnabled || !session });

  // Fallback demo data is only for when the live API genuinely can't be
  // reached (disabled in this environment, or the query errored) - a
  // successful query that legitimately found zero published events must
  // render an honest empty state below, not three fake events with a real
  // "Buy Ticket" button.
  const usingFallback = !liveApiEnabled || Boolean(error);
  const events: any[] = usingFallback ? fallbackEvents : data?.events?.nodes ?? [];
  const externalEvents: any[] = data?.externalEvents?.nodes ?? [];
  const recommended: any[] = recommendedData?.recommendedExternalEvents ?? [];

  function clearFilters() {
    setSearch(''); setInstrument(''); setMusicStyle(''); setSkillLevel(''); setFromDate('');
  }

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

        {/* Recommended for you */}
        {recommended.length > 0 && (
          <div className="mb-12">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <h2 className="text-2xl font-bold">Recommended for you</h2>
            </div>
            <p className="mb-6 max-w-3xl text-sm text-gray-600">
              Matched to your instruments and music styles.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((ext) => <ExternalEventCard key={ext.id} ext={ext} />)}
            </div>
          </div>
        )}

        {/* Search + filters */}
        {!usingFallback && (
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              {/* A bare <input type="date"> shows no hint of its purpose
                  until it's clicked open in some browsers (no visible
                  placeholder text for date inputs) - a permanent "From"
                  label removes the guesswork instead of relying on that. */}
              <div className="flex w-48 shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="shrink-0 text-gray-500">From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-gray-900 focus:outline-none focus:ring-0"
                  aria-label="From date"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  showFilters ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {hasActiveFilters && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                    {[instrument, musicStyle, skillLevel, fromDate].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Instrument</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setInstrument('')} className={`rounded-full border px-3 py-1 text-sm transition-colors ${!instrument ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>All</button>
                    {INSTRUMENTS.map((inst) => (
                      <button key={inst} onClick={() => setInstrument(instrument === inst ? '' : inst)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${instrument === inst ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>{inst}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Category of music</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setMusicStyle('')} className={`rounded-full border px-3 py-1 text-sm transition-colors ${!musicStyle ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>All</button>
                    {STYLES.map((style) => (
                      <button key={style} onClick={() => setMusicStyle(musicStyle === style ? '' : style)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${musicStyle === style ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>{style}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Level</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSkillLevel('')} className={`rounded-full border px-3 py-1 text-sm transition-colors ${!skillLevel ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>All</button>
                    {SKILL_LEVELS.map((level) => (
                      <button key={level} onClick={() => setSkillLevel(skillLevel === level ? '' : level)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${skillLevel === level ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>{SKILL_LEVEL_LABELS[level]}</button>
                    ))}
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
                    <X className="h-4 w-4" /> Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Native events on My Music Coach - skip this heading/empty-state
            entirely once loading settles with zero native events but real
            external events to show below (this dev environment has 1000+
            Ticketmaster listings and zero teacher-published native events
            yet): the external section becomes the primary "Upcoming
            Events" list instead of the page looking empty/broken behind a
            "check back soon" wall. */}
        {(loading || events.length > 0 || externalEvents.length === 0) && (
          <>
            <h2 className="mb-4 text-2xl font-bold">Upcoming Events</h2>
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
                <p className="text-gray-500">
                  {hasActiveFilters ? 'No events match your filters.' : 'No upcoming events published yet — check back soon.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-2 text-sm text-primary-600 hover:text-primary-800">Clear filters</button>
                )}
              </div>
            )}
          </>
        )}

        {externalEvents.length > 0 && (
          <div className={events.length > 0 ? 'mt-16' : ''}>
            <h2 className="mb-2 text-2xl font-bold">
              {events.length > 0 ? 'More events via external listings' : 'Upcoming Events'}
            </h2>
            <p className="mb-6 max-w-3xl text-sm text-gray-600">
              Discovered from external listings — purchase happens on the provider&rsquo;s own site.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {externalEvents.map((ext) => <ExternalEventCard key={ext.id} ext={ext} />)}
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
