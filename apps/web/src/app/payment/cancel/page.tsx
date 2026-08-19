'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { XCircle } from 'lucide-react';

const GET_COURSE_SLUG = gql`
  query PaymentCancelCourse($id: ID) {
    course(id: $id) { slug }
  }
`;
const GET_EVENT_SLUG = gql`
  query PaymentCancelEvent($id: ID) {
    event(id: $id) { slug }
  }
`;

function useQueryParams() {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return params;
}

function RetryLink({ type, ref }: { type: string | null; ref: string | null }) {
  const { data: courseData } = useQuery(GET_COURSE_SLUG, { variables: { id: ref }, skip: type !== 'course' || !ref });
  const { data: eventData } = useQuery(GET_EVENT_SLUG, { variables: { id: ref }, skip: type !== 'event' || !ref });

  const href =
    type === 'course' && courseData?.course?.slug
      ? `/courses/${courseData.course.slug}`
      : type === 'event' && eventData?.event?.slug
        ? `/events/${eventData.event.slug}`
        : type === 'booking'
          ? '/teachers'
          : null;

  return (
    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      {href && (
        <Link href={href} className="btn-primary rounded-lg px-6 py-3">
          Try again
        </Link>
      )}
      <Link href="/dashboard" className="btn-secondary rounded-lg px-6 py-3">
        Go to my dashboard
      </Link>
    </div>
  );
}

export default function PaymentCancelPage() {
  const params = useQueryParams();
  const type = params?.get('type') ?? null;
  const ref = params?.get('ref') ?? null;

  return (
    <main className="px-6 py-20">
      <div className="card mx-auto max-w-md p-8 text-center">
        <XCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="mt-3 text-gray-600">
          No charge was made — you can pick up right where you left off whenever you&rsquo;re ready.
        </p>
        {params && <RetryLink type={type} ref={ref} />}
      </div>
    </main>
  );
}
