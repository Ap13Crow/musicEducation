import Link from 'next/link';

const teachers = [
  {
    name: 'Anna Keller',
    instrument: 'Piano',
    experience: '12 years teaching',
    specialty: 'Romantic repertoire and exam preparation',
  },
  {
    name: 'Marco De Luca',
    instrument: 'Violin',
    experience: '9 years teaching',
    specialty: 'Technique foundations and orchestral audition prep',
  },
  {
    name: 'Elise Moreau',
    instrument: 'Voice',
    experience: '15 years teaching',
    specialty: 'Bel canto and stage confidence coaching',
  },
];

export default function TeachersPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          Practice Pillar
        </p>
        <h1 className="mb-4 text-4xl font-bold">Find Your Teacher</h1>
        <p className="mb-10 max-w-3xl text-gray-600">
          Choose from certified instructors for piano, strings, voice, and theory. Book online lessons or in-person sessions.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <article key={teacher.name} className="card p-5">
              <h2 className="text-xl font-semibold">{teacher.name}</h2>
              <p className="mt-1 text-sm text-primary-700">{teacher.instrument}</p>
              <p className="mt-4 text-sm text-gray-500">{teacher.experience}</p>
              <p className="mt-2 text-sm text-gray-600">{teacher.specialty}</p>
              <button className="btn-primary mt-6 w-full">Book Intro Lesson</button>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gray-50 p-6">
          <h3 className="text-xl font-semibold">Need help choosing?</h3>
          <p className="mt-2 text-sm text-gray-600">
            Take the onboarding assessment and get AI recommendations for teachers matched to your level and goals.
          </p>
          <Link href="/onboarding" className="btn-secondary mt-4">
            Take Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
