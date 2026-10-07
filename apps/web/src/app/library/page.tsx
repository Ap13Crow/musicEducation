'use client';

import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { BookOpen, ExternalLink, Library, Music, Search, Volume2 } from 'lucide-react';

const PAGE_SIZE = 24;

const GET_LIBRARY_ITEMS = gql`
  query GetLibraryItems($filter: LibraryItemFilterInput, $page: Int, $limit: Int) {
    libraryItems(filter: $filter, page: $page, limit: $limit) {
      nodes {
        id category title creator date permalink thumbnailUrl isPublicDomainWork
      }
      pageInfo { hasNextPage hasPreviousPage totalCount }
    }
  }
`;

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'SHEET_MUSIC', label: 'Sheet music' },
  { value: 'AUDIO_RECORDING', label: 'Recordings' },
  { value: 'BOOK', label: 'Books' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label]),
);

function CategoryIcon({ category }: { category: string }) {
  const className = 'h-10 w-10 text-primary-300';
  if (category === 'SHEET_MUSIC') return <Music className={className} />;
  if (category === 'AUDIO_RECORDING') return <Volume2 className={className} />;
  return <BookOpen className={className} />;
}

function LibraryCard({ item }: { item: any }) {
  return (
    <article className="card flex flex-col overflow-hidden p-0">
      {/* thumbnailUrl is only ever our own storage or null - never a
          gallica.bnf.fr URL (Gallica 429s hotlinked images). */}
      {item.thumbnailUrl ? (
        <img src={item.thumbnailUrl} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-primary-50">
          <CategoryIcon category={item.category} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 inline-block w-fit rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <h3 className="line-clamp-3 font-semibold leading-snug">{item.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{[item.creator, item.date].filter(Boolean).join(' · ')}</p>
        <a
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          View on Gallica <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="pt-1 text-xs text-gray-400">Source: gallica.bnf.fr / Bibliothèque nationale de France</p>
      </div>
    </article>
  );
}

export default function LibraryPage() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useQuery(GET_LIBRARY_ITEMS, {
    variables: {
      filter: { query: query || undefined, category: category || undefined },
      page,
      limit: PAGE_SIZE,
    },
    skip: !liveApiEnabled,
  });

  const items: any[] = data?.libraryItems?.nodes ?? [];
  const pageInfo = data?.libraryItems?.pageInfo;
  const hasActiveFilters = Boolean(query || category);

  // Search on submit, not per keystroke - the catalogue is server-side and
  // there's no reason to fire a query for every letter typed.
  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setQuery(searchInput.trim());
    setPage(1);
  }

  function selectCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function clearFilters() {
    setSearchInput(''); setQuery(''); setCategory(''); setPage(1);
  }

  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Library Pillar
        </p>
        <h1 className="mb-4 text-4xl font-bold">Sheet Music, Recordings and Books</h1>
        <p className="mb-10 max-w-3xl text-gray-600">
          Browse historical scores, recordings and music literature digitized by the Bibliothèque nationale de
          France. Every item opens on Gallica, the BnF&rsquo;s own digital library.
        </p>

        {!liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Live API is disabled in this environment, so the library catalogue can&rsquo;t be loaded.
          </p>
        )}
        {error && liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            The library catalogue is currently unavailable. Please try again shortly.
          </p>
        )}

        {liveApiEnabled && (
          <div className="mb-8">
            <form onSubmit={submitSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or composer..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <button type="submit" className="btn-primary">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value || 'all'}
                  onClick={() => selectCategory(c.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    category === c.value
                      ? 'border-primary-500 bg-primary-50 font-medium text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : items.length > 0 ? (
          <>
            {pageInfo && (
              <p className="mb-4 text-sm text-gray-500">
                {pageInfo.totalCount} {pageInfo.totalCount === 1 ? 'item' : 'items'}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => <LibraryCard key={item.id} item={item} />)}
            </div>
            {pageInfo && (pageInfo.hasPreviousPage || pageInfo.hasNextPage) && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pageInfo.hasPreviousPage}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pageInfo.hasNextPage}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : liveApiEnabled && !error ? (
          <div className="py-16 text-center">
            <Library className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">
              {hasActiveFilters ? 'No library items match your search.' : 'The library is being filled — check back soon.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm text-primary-600 hover:text-primary-800">
                Clear filters
              </button>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
