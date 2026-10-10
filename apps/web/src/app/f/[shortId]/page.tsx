import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Folder } from 'lucide-react';
import { LibraryThumbnail } from '../../library/LibraryThumbnail';
import { SOURCE_LABELS } from '../../library/sources';
import { serverGraphql } from '@/lib/serverGraphql';

const PUBLIC_FOLDER = `
  query PublicLibraryFolder($shortId: String!) {
    publicLibraryFolder(shortId: $shortId) {
      shortId name shareUrl
      subfolders { shortId name itemCount }
      items { id source category title creator date thumbnailUrl }
    }
  }
`;

type PublicFolder = {
  shortId: string;
  name: string;
  shareUrl: string;
  subfolders: { shortId: string; name: string; itemCount: number }[];
  items: any[];
};

async function loadFolder(shortId: string): Promise<PublicFolder | null> {
  return (await serverGraphql<{ publicLibraryFolder: PublicFolder | null }>(PUBLIC_FOLDER, { shortId }))?.publicLibraryFolder ?? null;
}

export async function generateMetadata({ params }: { params: { shortId: string } }): Promise<Metadata> {
  const folder = await loadFolder(params.shortId);
  if (!folder) return { title: 'Library folder' };
  const description = `${folder.items.length} scores and recordings from the My Music Coach library`;
  return {
    title: folder.name,
    description,
    alternates: { canonical: folder.shareUrl },
    openGraph: { title: folder.name, description, url: folder.shareUrl, siteName: 'My Music Coach' },
  };
}

// A folder an admin has made public - readable by anyone, no login, at a
// permanent /f/<shortId> link (shareable and printable as a QR code).
export default async function PublicFolderPage({ params }: { params: { shortId: string } }) {
  const folder = await loadFolder(params.shortId);
  if (!folder) notFound();

  return (
    <main className="px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Folder className="h-3.5 w-3.5" /> Library collection
        </p>
        <h1 className="mb-6 text-3xl font-bold">{folder.name}</h1>

        {folder.subfolders.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {folder.subfolders.map((sub) => (
              <Link
                key={sub.shortId}
                href={`/f/${sub.shortId}`}
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:border-primary-300"
              >
                <Folder className="h-4 w-4" /> {sub.name} <span className="text-xs text-gray-400">{sub.itemCount}</span>
              </Link>
            ))}
          </div>
        )}

        {folder.items.length === 0 ? (
          <p className="text-gray-500">This collection is empty.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folder.items.map((item) => (
              <Link key={item.id} href={`/library/${item.id}`} className="card flex flex-col overflow-hidden p-0 hover:border-primary-300">
                <LibraryThumbnail item={item} />
                <div className="p-4">
                  <h2 className="line-clamp-3 font-semibold leading-snug">{item.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">{[item.creator, item.date].filter(Boolean).join(' · ')}</p>
                  <p className="pt-2 text-xs text-gray-400">{(SOURCE_LABELS[item.source] ?? SOURCE_LABELS.BNF).credit}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
