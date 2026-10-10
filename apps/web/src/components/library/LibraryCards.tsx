'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { LibraryThumbnail } from '@/app/library/LibraryThumbnail';
import { SOURCE_LABELS } from '@/app/library/sources';
import { useItemStates, useLibraryCollections } from './LibraryCollections';
import { AddToFolderButton, FavoriteButton } from './ItemCollectionActions';
import { ITEM_DRAG_TYPE } from './LibrarySidebar';

// Library result cards and grid - shared by the catalogue search, favorites
// and folder views on /library.

export const CARD_FIELDS = `
  id source category title creator date permalink thumbnailUrl isPublicDomainWork scoreUrl pagesUrl embedUrl audioUrl availableHere
  files { contentType }
`;

export const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'SHEET_MUSIC', label: 'Sheet music' },
  { value: 'AUDIO_RECORDING', label: 'Recordings' },
  { value: 'BOOK', label: 'Books' },
  { value: 'OTHER', label: 'Other' },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label]),
);

export function LibraryCard({ item, note }: { item: any; note?: string }) {
  const source = SOURCE_LABELS[item.source] ?? SOURCE_LABELS.BNF;
  const { signedIn } = useLibraryCollections();
  return (
    <article
      className="card flex flex-col overflow-hidden p-0"
      draggable={signedIn}
      onDragStart={(event) => event.dataTransfer.setData(ITEM_DRAG_TYPE, item.id)}
    >
      <div className="relative">
        <LibraryThumbnail item={item} />
        <div className="absolute right-2 top-2 flex gap-1.5">
          <AddToFolderButton itemId={item.id} compact />
          <FavoriteButton itemId={item.id} size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1">
          <span className="inline-block w-fit rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          {item.scoreUrl && (
            <span className="inline-block w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Score</span>
          )}
          {item.availableHere === false && (
            <span
              className="inline-block w-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
              title="We don't hold a copy of this item yet - it opens at the source."
            >
              At {item.source === 'DNB' ? 'the DNB' : item.source === 'EUROPEANA' ? 'Europeana' : 'Gallica'} only
            </span>
          )}
          {item.availableHere !== false && (item.pagesUrl || item.embedUrl) && (
            <span className="inline-block w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              {item.category === 'AUDIO_RECORDING' ? 'Listen' : 'Read online'}
            </span>
          )}
          {item.files?.some((file: any) => file.contentType.startsWith('audio/')) && (
            <span className="inline-block w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Listen</span>
          )}
          {!item.scoreUrl && item.files?.some((file: any) => file.contentType === 'application/pdf') && (
            <span className="inline-block w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">PDF</span>
          )}
          {item.audioUrl && (
            <span className="inline-block w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Audio</span>
          )}
        </div>
        <h3 className="line-clamp-3 font-semibold leading-snug">
          <Link href={`/library/${item.id}`} className="hover:text-primary-700">{item.title}</Link>
        </h3>
        <p className="mt-1 text-sm text-gray-600">{[item.creator, item.date].filter(Boolean).join(' · ')}</p>
        {note && <p className="mt-2 text-xs font-medium text-primary-700">{note}</p>}
        <a
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          {source.viewLabel} <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="pt-1 text-xs text-gray-400">{source.credit}</p>
      </div>
    </article>
  );
}

export function ItemGrid({
  items,
  pageInfo,
  page,
  setPage,
  hideCount,
}: {
  items: any[];
  pageInfo: any;
  page: number;
  setPage(page: number): void;
  hideCount?: boolean;
}) {
  useItemStates(items.map((item) => item.id));
  return (
    <>
      {pageInfo && !hideCount && (
        <p className="mb-4 text-sm text-gray-500">
          {pageInfo.totalCount} {pageInfo.totalCount === 1 ? 'item' : 'items'}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <LibraryCard key={item.id} item={item} />)}
      </div>
      {pageInfo && (pageInfo.hasPreviousPage || pageInfo.hasNextPage) && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pageInfo.hasPreviousPage}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pageInfo.hasNextPage}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card animate-pulse p-0">
          <div className="h-36 bg-gray-100" />
          <div className="p-4">
            <div className="mb-2 h-5 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

