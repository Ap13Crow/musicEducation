'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { ArrowRight } from 'lucide-react';
import { PILLARS } from '@/lib/pillars';

const GET_PLATFORM_STATS = gql`
  query HomepagePlatformStats {
    platformStats { totalCourses totalEvents totalScores totalRecordings }
  }
`;

// Teachers and Students stay off the homepage until those numbers are
// large enough to be useful social proof.
const STAT_FIELDS = [
  { key: 'totalCourses', label: 'Courses', one: 'Course', href: '/courses' },
  { key: 'totalEvents', label: 'Events', one: 'Event', href: '/events' },
  { key: 'totalScores', label: 'Scores', one: 'Score', href: '/library' },
  { key: 'totalRecordings', label: 'Recordings', one: 'Recording', href: '/library' },
] as const;

const footerGroups = [
  {
    title: 'Learn',
    links: [
      { href: '/courses', label: 'Courses' },
      { href: '/teachers', label: 'Find a Teacher' },
      { href: '/events', label: 'Events' },
      { href: '/library', label: 'Library' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { href: '/about', label: 'About' },
      { href: '/become-teacher', label: 'Become a Teacher' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/feed', label: 'Feed' },
      { href: '/discuss', label: 'Discussions' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
];

export default function HomePage() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
  const { data } = useQuery(GET_PLATFORM_STATS, { skip: !liveApiEnabled });
  const platformStats = data?.platformStats;
  // Only stats with something to show - a "0 Courses" tile reads as an
  // empty platform, so zero (or not-yet-loaded) values are hidden.
  const stats = STAT_FIELDS.flatMap((field) => {
    const value = platformStats?.[field.key];
    return typeof value === 'number' && value > 0
      ? [{ ...field, label: value === 1 ? field.one : field.label, value: value.toLocaleString('en-US') }]
      : [];
  });

  return (
    <main className="text-ink">
      {/* Hero - one royal-blue banner, no buttons: the four pillars below are
          the equal entry points. */}
      <section className="bg-primary-600 px-6 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold sm:text-[13px]">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Make music part of your life.
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-[60px]">
            Your world of music,
            <br />
            <span className="text-gold">all in one place.</span>
          </h1>
          <p className="mt-6 max-w-[640px] text-base leading-relaxed text-[#e8edff] sm:text-[17px]">
            Find your teacher, explore music courses and resources, discover inspiring events, and connect
            with musicians around the world.
          </p>
        </div>
      </section>

      {/* Four pillars */}
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-[31px] font-bold leading-tight text-ink sm:text-[38px]">
            Everything you need to grow as a musician
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-[15px] text-muted sm:text-base">
            Find the right teacher, learn at your own pace, discover inspiring events and explore trusted musical
            resources.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                className="group flex flex-col rounded-xl border border-line bg-white p-6 transition hover:border-primary-100 hover:shadow-md"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full ${p.iconClass}`}>
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink group-hover:text-primary-600 sm:text-xl">{p.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted sm:text-[15px]">{p.description}</p>
                <ArrowRight className="mt-auto h-5 w-5 self-end text-primary-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="min-h-[7rem] bg-surface px-6 py-8" data-testid="platform-stats">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-y-6 sm:flex sm:justify-center sm:divide-x sm:divide-line">
          {stats.map((stat) => (
            <Link key={stat.key} href={stat.href} className="text-center transition-opacity hover:opacity-80 sm:flex-1">
              <div className="text-2xl font-bold tabular-nums text-primary-600 sm:text-[28px]">{stat.value}</div>
              <div className="mt-1 text-[13px] text-muted sm:text-sm">{stat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Personalised guidance - optional, deliberately quieter than the hero */}
      <section className="bg-white px-6 pt-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Personalised for you</p>
            <h2 className="mb-2 text-2xl font-bold text-ink">Not sure where to start?</h2>
            <p className="max-w-xl text-muted">
              Discover your musical profile and get personalised recommendations for courses, teachers and events.
            </p>
          </div>
          <Link href="/onboarding" className="btn-primary gap-2 self-start px-6 py-3 sm:self-center">
            Explore your musical profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Community - the social link between the four pillars */}
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span aria-hidden="true" className="mx-auto mb-5 block h-px w-10 bg-secondary-500" />
          <h2 className="mb-4 text-3xl font-bold text-ink">Music is better together</h2>
          <p className="leading-relaxed text-muted">
            Join a global community of musicians, teachers and music lovers. Share your journey, discover new
            perspectives and be part of a more musical world.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-3 font-semibold text-ink">{group.title}</h4>
                <ul className="space-y-2 text-sm text-muted">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-primary-600">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted">
            © {new Date().getFullYear()} My Music Coach · mymusic.coach. Open-source · Built with ❤️ for musicians.
          </p>
        </div>
      </footer>
    </main>
  );
}
