export default function AboutPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold">About My Music Coach</h1>
        <p className="mb-6 text-gray-700">
          My Music Coach is an open-source, international music platform for every instrument, style and level. It brings
          four things together: finding a teacher, exploring courses, discovering events and browsing a library of scores
          and recordings - connected by a community of musicians.
        </p>
        <p className="mb-6 text-gray-700">
          Our goal is simple: help you make music part of your life, whether you are picking up an instrument for the first
          time or have played for years.
        </p>
        <div className="card p-6">
          <h2 className="text-2xl font-semibold">What makes us different</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
            <li>Optional personalised guidance to help you find where to start</li>
            <li>Teachers, courses, events and library in one place</li>
            <li>Community-driven and fully open-source roadmap</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
