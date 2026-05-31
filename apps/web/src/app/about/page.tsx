export default function AboutPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold">About MusicEdu</h1>
        <p className="mb-6 text-gray-700">
          MusicEdu is an open-source education platform dedicated to classical music learning through three connected pillars:
          theory, practice, and performance.
        </p>
        <p className="mb-6 text-gray-700">
          Our goal is to make high-quality music education accessible with structured courses, trusted teacher discovery,
          and real-world performance opportunities.
        </p>
        <div className="card p-6">
          <h2 className="text-2xl font-semibold">What makes us different</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
            <li>AI-based assessment to personalize learning paths</li>
            <li>Integrated booking and event ecosystem</li>
            <li>Community-driven and fully open-source roadmap</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
