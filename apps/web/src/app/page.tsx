import Link from 'next/link';
import { BookOpen, Music, Calendar, Star, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Theory Courses',
    description: 'Structured video courses from beginner to professional — learn harmony, counterpoint, ear training and more.',
    href: '/courses',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Music,
    title: 'Live Practice',
    description: 'Book online video lessons via Zoom or in-person sessions with certified teachers near you.',
    href: '/teachers',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Calendar,
    title: 'Performances & Events',
    description: 'Discover concerts, masterclasses and workshops, or publish your own event.',
    href: '/events',
    color: 'bg-amber-50 text-amber-600',
  },
];

const stats = [
  { value: '500+', label: 'Courses' },
  { value: '200+', label: 'Certified Teachers' },
  { value: '1,000+', label: 'Events' },
  { value: '50,000+', label: 'Students' },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
            Your Classical Music
            <br />
            <span className="text-secondary-500">Education Platform</span>
          </h1>
          <p className="mb-10 text-xl text-primary-100">
            Theory courses, live lessons, and live performances — all in one place.
            Start your personalised music journey today.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/onboarding" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 text-base">
              Start Assessment — Free
            </Link>
            <Link href="/courses" className="btn-secondary border-white bg-transparent text-white hover:bg-primary-500 px-8 py-3 text-base">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-1 text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Three pillars */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Three Pillars of Musical Excellence</h2>
          <p className="mb-12 text-center text-gray-500">Everything you need to grow as a musician.</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <Link key={f.title} href={f.href} className="card group p-6 hover:border-primary-300 transition-colors">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold group-hover:text-primary-600">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <TrendingUp className="mx-auto mb-4 h-12 w-12 opacity-80" />
          <h2 className="mb-4 text-3xl font-bold">Get Your Personalised Learning Path</h2>
          <p className="mb-8 text-amber-100">
            Take our 15-minute music knowledge assessment — theory, ear training and cultural knowledge —
            and let our AI recommend the perfect courses, teachers and events for your level.
          </p>
          <Link href="/onboarding" className="btn-primary bg-white text-amber-700 hover:bg-amber-50 px-8 py-3 text-base">
            Take the Assessment
          </Link>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="mb-4 text-xl text-gray-700">
            &ldquo;The AI assessment recommended exactly the right teacher and courses for my level.
            Within three months I went from struggling with scales to performing a Chopin nocturne.&rdquo;
          </blockquote>
          <cite className="text-sm text-gray-500">— Sarah K., Piano Student</cite>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 grid gap-8 sm:grid-cols-4">
            <div>
              <h4 className="mb-3 font-semibold">Learn</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/courses" className="hover:text-primary-600">Courses</Link></li>
                <li><Link href="/teachers" className="hover:text-primary-600">Find a Teacher</Link></li>
                <li><Link href="/events" className="hover:text-primary-600">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/about" className="hover:text-primary-600">About</Link></li>
                <li><Link href="/become-teacher" className="hover:text-primary-600">Become a Teacher</Link></li>
                <li><Link href="/blog" className="hover:text-primary-600">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Community</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/feed" className="hover:text-primary-600">Feed</Link></li>
                <li><Link href="/discuss" className="hover:text-primary-600">Discussions</Link></li>
              </ul>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MusicEdu. Open-source · Built with ❤️ for musicians.
          </p>
        </div>
      </footer>
    </main>
  );
}
