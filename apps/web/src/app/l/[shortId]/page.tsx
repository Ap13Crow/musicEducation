import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Library } from 'lucide-react';
import { serverGraphql } from '@/lib/serverGraphql';

const PERMALINK = `
  query LibraryPermalink($shortId: String!) {
    libraryPermalink(shortId: $shortId) { itemId title available }
  }
`;

// Permanent share link /l/<shortId> (printed QR codes, links shared outside
// mymusic.coach). It never breaks: a hidden item gets a notice, not a 404.
export default async function LibraryPermalinkPage({ params }: { params: { shortId: string } }) {
  const data = await serverGraphql<{ libraryPermalink: { itemId: string; title: string; available: boolean } | null }>(
    PERMALINK,
    { shortId: params.shortId },
  );
  const permalink = data?.libraryPermalink;
  if (!permalink) notFound();
  if (permalink.available) redirect(`/library/${permalink.itemId}`);

  return (
    <main className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <Library className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h1 className="text-2xl font-bold">{permalink.title}</h1>
        <p className="mt-3 text-gray-600">This item is no longer available in the library.</p>
        <Link href="/library" className="btn-primary mt-6 inline-block">Browse the library</Link>
      </div>
    </main>
  );
}
