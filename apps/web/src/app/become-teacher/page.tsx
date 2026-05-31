export default function BecomeTeacherPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Become a Teacher</h1>
        <p className="mb-8 text-gray-600">
          Join MusicEdu as a verified instructor and teach motivated students online or in person.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          <article className="card p-5">
            <h2 className="text-lg font-semibold">1. Apply</h2>
            <p className="mt-2 text-sm text-gray-600">Share your profile, experience, certifications, and teaching focus.</p>
          </article>
          <article className="card p-5">
            <h2 className="text-lg font-semibold">2. Verify</h2>
            <p className="mt-2 text-sm text-gray-600">Our team reviews credentials and class quality standards.</p>
          </article>
          <article className="card p-5">
            <h2 className="text-lg font-semibold">3. Teach</h2>
            <p className="mt-2 text-sm text-gray-600">Set availability, publish your offer, and start onboarding students.</p>
          </article>
        </div>

        <div className="mt-10">
          <button className="btn-primary">Start Application</button>
        </div>
      </section>
    </main>
  );
}
