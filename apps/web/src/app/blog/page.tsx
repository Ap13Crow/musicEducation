const posts = [
  {
    title: 'How to Structure a 45-Minute Daily Practice Session',
    category: 'Practice Tips',
  },
  {
    title: 'Choosing the Right Repertoire for Your Current Level',
    category: 'Learning Strategy',
  },
  {
    title: 'Preparing for Your First Masterclass: A Checklist',
    category: 'Performance',
  },
];

export default function BlogPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">MusicEdu Blog</h1>
        <p className="mb-10 text-gray-600">
          Practical advice, teacher insights, and classical music learning strategies.
        </p>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.title} className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{post.category}</p>
              <h2 className="mt-2 text-2xl font-semibold">{post.title}</h2>
              <p className="mt-3 text-sm text-gray-600">Article preview coming soon.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
