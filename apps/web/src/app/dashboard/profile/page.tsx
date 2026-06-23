'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProfileDashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="p-8">Loading profile...</div>;
  }

  if (!session) {
    return <div className="p-8">Please sign in to view your profile.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">User Profile</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Learning (Moodle) */}
        <section className="card p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">My Learning</h2>
          <p className="text-gray-600 mb-4">View your enrolled courses, progress, and certificates.</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Course data will be fetched from Moodle via internal API.</p>
            <Link href="/courses" className="btn-primary inline-block rounded bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
              Browse Courses
            </Link>
          </div>
        </section>

        {/* Bookings (LibreBooking) */}
        <section className="card p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">1-on-1 Lessons</h2>
          <p className="text-gray-600 mb-4">Manage your physical lesson bookings and schedule.</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Booking data will be fetched from LibreBooking via internal API.</p>
            <button className="btn-secondary rounded border border-gray-300 px-4 py-2 hover:bg-gray-50">
              Book a Lesson
            </button>
          </div>
        </section>

        {/* Events/Tickets (Pretix) */}
        <section className="card p-6 bg-white border rounded-lg shadow-sm md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Events & Tickets</h2>
          <p className="text-gray-600 mb-4">View your event tickets and purchase history.</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Ticket data will be fetched from Pretix via internal API.</p>
            <button className="btn-secondary rounded border border-gray-300 px-4 py-2 hover:bg-gray-50">
              Buy Ticket
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
