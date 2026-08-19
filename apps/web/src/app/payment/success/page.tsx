'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { CheckCircle, Loader2 } from 'lucide-react';

// The redirect here only means Stripe collected payment - the webhook
// (checkout.session.completed), not this page load, is what actually grants
// the enrollment/booking/event confirmation (see apps/api/src/resolvers/
// payments.ts). Polling briefly for that instead of assuming success on
// arrival covers the normal case where the webhook lands a second or two
// after the browser redirect.
const GET_ENROLLMENT = gql`
  query PaymentSuccessEnrollment($courseId: ID!) {
    myEnrollment(courseId: $courseId) { id }
    course(id: $courseId) { title slug }
  }
`;
const GET_BOOKING = gql`
  query PaymentSuccessBooking($id: ID!) {
    booking(id: $id) { id status }
  }
`;
const GET_EVENT_BOOKINGS = gql`
  query PaymentSuccessEventBookings($eventId: ID) {
    myEventBookings(limit: 50) { id eventId status }
    event(id: $eventId) { title slug }
  }
`;

const MAX_POLLS = 6;
const POLL_INTERVAL_MS = 2000;

function useQueryParams() {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return params;
}

function CourseConfirmation({ courseId }: { courseId: string }) {
  const { data, startPolling, stopPolling } = useQuery(GET_ENROLLMENT, { variables: { courseId } });
  const [attempts, setAttempts] = useState(0);
  const confirmed = Boolean(data?.myEnrollment);
  useEffect(() => {
    if (confirmed || attempts >= MAX_POLLS) {
      stopPolling();
      return;
    }
    startPolling(POLL_INTERVAL_MS);
    const t = setTimeout(() => setAttempts((a) => a + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [confirmed, attempts, startPolling, stopPolling]);

  return (
    <Confirmation
      confirmed={confirmed}
      pending={!confirmed && attempts < MAX_POLLS}
      confirmedText={`You're enrolled in ${data?.course?.title ?? 'the course'}.`}
      link={data?.course?.slug ? `/courses/${data.course.slug}/learn` : '/dashboard'}
      linkLabel="Start learning"
    />
  );
}

function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const { data, startPolling, stopPolling } = useQuery(GET_BOOKING, { variables: { id: bookingId } });
  const [attempts, setAttempts] = useState(0);
  const confirmed = data?.booking?.status === 'CONFIRMED';
  useEffect(() => {
    if (confirmed || attempts >= MAX_POLLS) {
      stopPolling();
      return;
    }
    startPolling(POLL_INTERVAL_MS);
    const t = setTimeout(() => setAttempts((a) => a + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [confirmed, attempts, startPolling, stopPolling]);

  return (
    <Confirmation
      confirmed={confirmed}
      pending={!confirmed && attempts < MAX_POLLS}
      confirmedText="Your lesson booking is confirmed."
      link="/dashboard"
      linkLabel="Go to my dashboard"
    />
  );
}

function EventConfirmation({ eventId }: { eventId: string }) {
  const { data, startPolling, stopPolling } = useQuery(GET_EVENT_BOOKINGS, { variables: { eventId } });
  const [attempts, setAttempts] = useState(0);
  const confirmed = (data?.myEventBookings ?? []).some((b: any) => b.eventId === eventId && b.status === 'CONFIRMED');
  useEffect(() => {
    if (confirmed || attempts >= MAX_POLLS) {
      stopPolling();
      return;
    }
    startPolling(POLL_INTERVAL_MS);
    const t = setTimeout(() => setAttempts((a) => a + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [confirmed, attempts, startPolling, stopPolling]);

  return (
    <Confirmation
      confirmed={confirmed}
      pending={!confirmed && attempts < MAX_POLLS}
      confirmedText={`Your ticket for ${data?.event?.title ?? 'the event'} is confirmed.`}
      link={data?.event?.slug ? `/events/${data.event.slug}` : '/events'}
      linkLabel="View event"
    />
  );
}

function Confirmation({
  confirmed,
  pending,
  confirmedText,
  link,
  linkLabel,
}: {
  confirmed: boolean;
  pending: boolean;
  confirmedText: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      {confirmed ? (
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-600" />
      ) : (
        <Loader2 className="mx-auto mb-4 h-14 w-14 animate-spin text-primary-600" />
      )}
      <h1 className="text-2xl font-bold">{confirmed ? 'Payment successful' : 'Payment received'}</h1>
      <p className="mt-3 text-gray-600">
        {confirmed
          ? confirmedText
          : pending
            ? 'Finishing up — this usually takes just a few seconds…'
            : "Still processing. This can occasionally take a bit longer — check your dashboard shortly, or contact us if it doesn't show up."}
      </p>
      <Link href={link} className="btn-primary mt-6 inline-block rounded-lg px-6 py-3">
        {linkLabel}
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const params = useQueryParams();
  if (!params) return <main className="px-6 py-20"><p className="text-center text-gray-500">Loading…</p></main>;

  const type = params.get('type');
  const ref = params.get('ref');

  return (
    <main className="px-6 py-20">
      {!type || !ref ? (
        <Confirmation confirmed pending={false} confirmedText="Payment received." link="/dashboard" linkLabel="Go to my dashboard" />
      ) : type === 'course' ? (
        <CourseConfirmation courseId={ref} />
      ) : type === 'booking' ? (
        <BookingConfirmation bookingId={ref} />
      ) : type === 'event' ? (
        <EventConfirmation eventId={ref} />
      ) : (
        <Confirmation confirmed pending={false} confirmedText="Payment received." link="/dashboard" linkLabel="Go to my dashboard" />
      )}
    </main>
  );
}
