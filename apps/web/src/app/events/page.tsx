'use client';

import { useState } from 'react';
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
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <main className="px-6 py-16">
      {/* Checkout Modal Placeholder */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            <p className="text-gray-600 mb-6">
              Reserving seat for <span className="font-semibold">{selectedEvent}</span>.
              <br />
              <span className="text-sm mt-2 block">(This process calls Pretix API in the background instead of redirecting)</span>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
              <button onClick={() => setSelectedEvent(null)} className="btn-primary px-4 py-2">Confirm Purchase</button>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={() => setSelectedEvent(eventItem.title)} className="btn-primary mt-4 sm:mt-0">Buy Ticket</button>
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
