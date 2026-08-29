'use client';

import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { Award, BookOpen, CalendarDays, ChevronLeft, ChevronRight, CreditCard, MapPin, MessageSquare, Music, Star, UserRound, Users as UsersIcon } from 'lucide-react';
import { toYouTubeEmbedUrl } from '@/lib/youtube';
import { membershipLabel } from '@/lib/membership';
import WeeklySlotCalendar from '@/components/booking/WeeklySlotCalendar';

const GET_TEACHER = gql`
  query PublicTeacher($id: ID!, $courseFilter: CourseFilterInput, $from: DateTime!, $to: DateTime!) {
    teacher(id: $id) {
      id userId headline teachingBio hourlyRate currency instruments specializations
      teachingFormats isAvailable avgRating totalReviews yearsExperience introVideoUrl
      locationCity locationCountry publicImageUrl memberSince distinctStudentCount publishedResourceCount
      certifications { id title issuingBody issuedYear }
      availability { id dayOfWeek startTime endTime timezone }
      instrumentCapacities { id instrument maxActiveStudents activeStudentCount remainingCapacity }
      bookableSlots(from: $from, to: $to, limit: 100) { startsAt endsAt timezone }
      user {
        id email displayName
        eventsPublished(page: 1, limit: 12) {
          nodes { id slug title startsAt city format isPublished }
        }
      }
    }
    courses(filter: $courseFilter, page: 1, limit: 12) {
      nodes { id slug title shortSummary level price currency status }
    }
    reviews(teacherProfileId: $id, page: 1, limit: 6) {
      nodes { id rating comment createdAt author { displayName } }
      pageInfo { totalCount }
    }
    teacherPackageOffers(teacherProfileId: $id) {
      id instrument lessonCount pricePerPackage pricePerLesson currency isPublished
    }
    teacherSubscriptionOffers(teacherProfileId: $id) {
      id includedHoursPerMonth termMonths monthlyPrice currency upfrontDiscountPct upfrontTotal undiscountedTotal isPublished
    }
  }
`;
const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateTeacherOfferCheckoutSession($type: String!, $refId: ID!) {
    createCheckoutSession(type: $type, refId: $refId) { checkoutUrl }
  }
`;

function startOfWeek(value: Date): Date {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return day;
}

function money(currency: string, amount: number): string {
  return `${currency} ${Number(amount).toFixed(2)}`;
}

export default function PublicTeacherPage() {
  const { teacherProfileId } = useParams<{ teacherProfileId: string }>();
  const { data: session } = useSession();
  const [weekOffset, setWeekOffset] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');
  const weekStart = useMemo(() => {
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [weekOffset]);
  const rangeEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);
  const { data, loading, error } = useQuery(GET_TEACHER, {
    variables: { id: teacherProfileId, courseFilter: { teacherProfileId }, from: weekStart.toISOString(), to: rangeEnd.toISOString() },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const [createCheckout, { loading: checkingOut }] = useMutation(CREATE_CHECKOUT_SESSION);
  if (loading && !data?.teacher) return <main className="mx-auto max-w-5xl px-6 py-12">Loading teacher profile…</main>;
  if (error || !data?.teacher) return <main className="mx-auto max-w-5xl px-6 py-12">Teacher profile not found.</main>;

  const teacher = data.teacher;
  const isOwnProfile = session?.user?.email === teacher.user?.email;
  const courses = data.courses?.nodes ?? [];
  const events = (teacher.user?.eventsPublished?.nodes ?? []).filter((event: any) => event.isPublished);
  const recommendations = data.reviews?.nodes ?? [];
  const capacities = new Map((teacher.instrumentCapacities ?? []).map((capacity: any) => [capacity.instrument, capacity]));
  const packageOffers = (data.teacherPackageOffers ?? []).filter((offer: any) => offer.isPublished);
  const subscriptionOffers = (data.teacherSubscriptionOffers ?? []).filter((offer: any) => offer.isPublished);

  async function startOfferCheckout(type: 'package' | 'subscription', refId: string) {
    if (!session) {
      await signIn('keycloak', { callbackUrl: window.location.href });
      return;
    }
    setCheckoutError('');
    try {
      const { data: checkoutData } = await createCheckout({ variables: { type, refId } });
      const checkoutUrl = checkoutData?.createCheckoutSession?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      setCheckoutError('Could not start checkout for this offer.');
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Could not start checkout for this offer.');
    }
  }

  return <main className="min-h-screen overflow-x-hidden bg-gray-50">
    <section className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/teachers" className="text-sm font-medium text-primary-700">← All teachers</Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 gap-4 sm:gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-100 text-primary-700 sm:h-24 sm:w-24">
              {teacher.publicImageUrl ? <img src={teacher.publicImageUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10" />}
            </div>
            <div className="min-w-0">
              <h1 className="break-words font-serif text-2xl font-bold sm:text-3xl">{teacher.user?.displayName}</h1>
              <p className="mt-1 text-primary-700">{teacher.headline ?? 'Music teacher'}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                {teacher.locationCity && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{teacher.locationCity}{teacher.locationCountry ? `, ${teacher.locationCountry}` : ''}</span>}
                {teacher.avgRating > 0 && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{teacher.avgRating.toFixed(1)} ({teacher.totalReviews})</span>}
                {teacher.yearsExperience != null && <span>{teacher.yearsExperience} yr experience</span>}
                {teacher.distinctStudentCount > 0 && <span className="flex items-center gap-1"><UsersIcon className="h-4 w-4" />{teacher.distinctStudentCount} student{teacher.distinctStudentCount === 1 ? '' : 's'}</span>}
                {teacher.memberSince && <span>{membershipLabel(teacher.memberSince, { compact: true })}</span>}
              </div>
            </div>
          </div>
          {isOwnProfile ? <Link href="/dashboard/teacher/profile" className="btn-primary rounded-lg px-5 py-2.5">Manage teacher profile</Link>
            : teacher.isAvailable ? <Link href={`/book/${teacher.id}`} className="btn-primary rounded-lg px-5 py-2.5">Book a lesson</Link>
            : <span className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm text-gray-500">Not accepting bookings</span>}
        </div>
      </div>
    </section>

    <div className="mx-auto grid min-w-0 max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-6">
        {teacher.introVideoUrl && toYouTubeEmbedUrl(teacher.introVideoUrl) && (
          <section className="card min-w-0 p-0">
            <div className="aspect-video w-full bg-gray-900">
              <iframe
                className="block h-full w-full max-w-full border-0"
                src={toYouTubeEmbedUrl(teacher.introVideoUrl)!}
                title={`${teacher.user?.displayName ?? 'Teacher'} — presentation video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}
        <section className="card p-6"><h2 className="text-xl font-semibold">About</h2><p className="mt-3 whitespace-pre-line text-gray-700">{teacher.teachingBio ?? 'This teacher is preparing their profile.'}</p></section>
        <section className="card min-w-0 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="h-5 w-5" />Upcoming availability</h2>
              <p className="mt-1 text-sm text-gray-500">Live openings after bookings, holds and time off are applied.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(event) => { event.preventDefault(); setWeekOffset((value) => Math.max(0, value - 1)); }} disabled={weekOffset === 0} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Previous availability week"><ChevronLeft className="h-4 w-4" /></button>
              <span className="min-w-28 text-center text-sm text-gray-600">{weekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {new Date(rangeEnd.getTime() - 1).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
              <button type="button" onClick={(event) => { event.preventDefault(); setWeekOffset((value) => Math.min(8, value + 1)); }} disabled={weekOffset >= 8} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Next availability week"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-4" aria-busy={loading}><WeeklySlotCalendar weekStart={weekStart} slots={teacher.bookableSlots ?? []} compact /></div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">{loading ? 'Updating openings… ' : ''}Times are shown in your device timezone.</p>
            {!isOwnProfile && teacher.isAvailable && <Link href={`/book/${teacher.id}`} className="btn-primary rounded-lg px-4 py-2 text-sm">See all booking options</Link>}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><MessageSquare className="h-5 w-5" />Recommendations{data.reviews?.pageInfo?.totalCount ? ` (${data.reviews.pageInfo.totalCount})` : ''}</h2>
          {recommendations.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{recommendations.map((review:any)=><article key={review.id} className="rounded-xl border p-4"><div className="flex gap-0.5 text-amber-500">{Array.from({length:review.rating},(_,index)=><Star key={index} className="h-4 w-4 fill-current" />)}</div><p className="mt-2 text-sm text-gray-700">{review.comment || 'Recommended this teacher.'}</p><p className="mt-2 text-xs text-gray-500">{review.author?.displayName ?? 'Verified student'} · {new Date(review.createdAt).toLocaleDateString()}</p></article>)}</div> : <p className="mt-3 text-sm text-gray-500">No student recommendations yet.</p>}
        </section>
        <section className="card p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><BookOpen className="h-5 w-5" />Courses{teacher.publishedResourceCount > 0 ? ` (${teacher.publishedResourceCount})` : ''}</h2>
          {courses.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{courses.map((course:any)=><Link key={course.id} href={`/courses/${course.slug}`} className="rounded-xl border p-4 hover:border-primary-300"><strong>{course.title}</strong><p className="mt-1 text-sm text-gray-600">{course.shortSummary ?? course.level}</p></Link>)}</div> : <p className="mt-3 text-sm text-gray-500">No published courses yet.</p>}
        </section>
        <section className="card p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="h-5 w-5" />Events</h2>
          {events.length ? <div className="mt-4 space-y-3">{events.map((event:any)=><Link key={event.id} href={`/events/${event.slug}`} className="block rounded-xl border p-4 hover:border-primary-300"><strong>{event.title}</strong><p className="mt-1 text-sm text-gray-600">{new Date(event.startsAt).toLocaleDateString()} · {event.city ?? event.format}</p></Link>)}</div> : <p className="mt-3 text-sm text-gray-500">No published events yet.</p>}
        </section>
      </div>
      <aside className="min-w-0 space-y-6">
        <section className="card p-6"><h2 className="flex items-center gap-2 font-semibold"><Music className="h-4 w-4" />Teaching and places</h2><div className="mt-3 space-y-2">{teacher.instruments.map((item:string)=>{const capacity:any=capacities.get(item);return <div key={item} className="rounded-xl bg-primary-50 px-3 py-2"><span className="font-medium text-primary-800">{item}</span><span className="block text-xs text-primary-700">{capacity?.remainingCapacity == null ? 'Accepting new students' : capacity.remainingCapacity === 0 ? 'Currently full' : `${capacity.remainingCapacity} student place${capacity.remainingCapacity === 1 ? '' : 's'} left`}</span></div>})}</div>{teacher.hourlyRate && <p className="mt-4 font-semibold">{teacher.currency} {teacher.hourlyRate}/hour</p>}</section>
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" />Packages and subscriptions</h2>
          {checkoutError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{checkoutError}</p>}
          <div className="mt-3 space-y-3">
            {packageOffers.map((offer: any) => (
              <div key={offer.id} className="rounded-xl border p-3">
                <strong>{offer.lessonCount} lesson package</strong>
                <p className="mt-0.5 text-xs text-gray-500">{offer.instrument || 'Any listed instrument'} · {money(offer.currency, offer.pricePerLesson)} per lesson</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{money(offer.currency, offer.pricePerPackage)}</span>
                  {!isOwnProfile && <button type="button" onClick={() => void startOfferCheckout('package', offer.id)} disabled={checkingOut} className="btn-secondary rounded-lg px-3 py-1.5 text-xs disabled:opacity-50">{checkingOut ? 'Starting…' : 'Buy'}</button>}
                </div>
              </div>
            ))}
            {subscriptionOffers.map((offer: any) => (
              <div key={offer.id} className="rounded-xl border p-3">
                <strong>{offer.termMonths} month subscription</strong>
                <p className="mt-0.5 text-xs text-gray-500">{offer.includedHoursPerMonth} hour{offer.includedHoursPerMonth === 1 ? '' : 's'} per month · paid upfront</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{money(offer.currency, offer.upfrontTotal)}</span>
                  {!isOwnProfile && <button type="button" onClick={() => void startOfferCheckout('subscription', offer.id)} disabled={checkingOut} className="btn-secondary rounded-lg px-3 py-1.5 text-xs disabled:opacity-50">{checkingOut ? 'Starting…' : 'Buy'}</button>}
                </div>
                {offer.upfrontDiscountPct > 0 && <p className="mt-1 text-xs text-emerald-700">{offer.upfrontDiscountPct}% upfront discount</p>}
              </div>
            ))}
          </div>
          {packageOffers.length === 0 && subscriptionOffers.length === 0 && <p className="mt-3 text-sm text-gray-500">No prepaid offers are published yet.</p>}
        </section>
        <section className="card p-6"><h2 className="flex items-center gap-2 font-semibold"><Award className="h-4 w-4" />Qualifications</h2>{teacher.certifications.length ? <ul className="mt-3 space-y-3">{teacher.certifications.map((cert:any)=><li key={cert.id}><strong className="text-sm">{cert.title}</strong><p className="text-xs text-gray-500">{cert.issuingBody}{cert.issuedYear ? ` · ${cert.issuedYear}` : ''}</p></li>)}</ul> : <p className="mt-3 text-sm text-gray-500">No qualifications listed yet.</p>}</section>
      </aside>
    </div>
  </main>;
}
