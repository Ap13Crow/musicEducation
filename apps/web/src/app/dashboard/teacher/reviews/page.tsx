'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { Star, User } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';

// Direct user feedback: "I need other information about my students,
// upcoming bookings, course or class review to finish from the online
// courses I manage." Review is written per-course/event/booking (see
// schema), with no field anywhere aggregating "everything a teacher has
// been reviewed on" - a teacher had to open each course individually to see
// what students said about it. This page pulls Course.reviews and
// Event.reviews across every course/event the teacher owns and merges them
// into one feed, newest first. No backend changes: both connections already
// exist and are already teacher-readable.
const GET = gql`
  query TeacherReviewsFeed {
    myCourses(page: 1, limit: 50) {
      nodes {
        id
        title
        reviews(page: 1, limit: 20) {
          nodes { id rating comment createdAt author { id displayName avatarUrl } }
        }
      }
    }
    myEvents(page: 1, limit: 50) {
      nodes {
        id
        title
        reviews(page: 1, limit: 20) {
          nodes { id rating comment createdAt author { id displayName avatarUrl } }
        }
      }
    }
  }
`;

interface FeedItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; displayName: string; avatarUrl: string | null } | null;
  itemTitle: string;
  itemKind: 'Course' | 'Event';
}

function buildFeed(courses: any[], events: any[]): FeedItem[] {
  const feed: FeedItem[] = [];
  for (const c of courses) {
    for (const r of c.reviews?.nodes ?? []) {
      feed.push({ ...r, itemTitle: c.title, itemKind: 'Course' });
    }
  }
  for (const e of events) {
    for (const r of e.reviews?.nodes ?? []) {
      feed.push({ ...r, itemTitle: e.title, itemKind: 'Event' });
    }
  }
  return feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </span>
  );
}

function ReviewsFeed() {
  const { data, loading, error } = useQuery(GET, { fetchPolicy: 'cache-and-network' });
  const feed = buildFeed(data?.myCourses?.nodes ?? [], data?.myEvents?.nodes ?? []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">Reviews</h1>
      <p className="mt-2 text-sm text-gray-600">
        What students have said about your courses and events, newest first - up to 20 reviews per item across your
        {' '}{'≤'}50 most recent courses and events.
      </p>

      {loading && <p className="mt-8 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">Failed to load reviews: {error.message}</p>}
      {!loading && !error && feed.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed p-6 text-sm text-gray-500">
          No reviews yet. They&rsquo;ll show up here as soon as a student rates one of your courses or events.
        </p>
      )}

      <div className="mt-8 space-y-3">
        {feed.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-purple-600">
                {r.author?.avatarUrl ? <img src={r.author.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{r.author?.displayName ?? 'A student'}</p>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {r.itemKind} · {r.itemTitle} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// Same pattern as dashboard/teacher/students/page.tsx: the query only fires
// once RoleGate has actually rendered this as its children, never before.
export default function TeacherReviewsPage() {
  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher/reviews">
      <ReviewsFeed />
    </RoleGate>
  );
}
