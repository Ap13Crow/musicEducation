'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { LibraryThumbnail } from './LibraryThumbnail';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { ExternalLink, Folder, Library, PanelLeft, Search, Star } from 'lucide-react';
import { SOURCE_LABELS } from './sources';
import { childFolders, folderPath, useItemStates, useLibraryCollections } from '@/components/library/LibraryCollections';
import { AddToFolderButton, FavoriteButton, FolderBreadcrumb } from '@/components/library/ItemCollectionActions';
import { ITEM_DRAG_TYPE, LibrarySidebar, type LibraryView } from '@/components/library/LibrarySidebar';

const PAGE_SIZE = 24;

const CARD_FIELDS = `
  id source category title creator date permalink thumbnailUrl isPublicDomainWork scoreUrl pagesUrl embedUrl audioUrl
  files { contentType }
`;

const GET_LIBRARY_ITEMS = gql`
  query GetLibraryItems($filter: LibraryItemFilterInput, $page: Int, $limit: Int) {
    libraryItems(filter: $filter, page: $page, limit: $limit) {
      nodes { ${CARD_FIELDS} }
      pageInfo { hasNextPage hasPreviousPage totalCount }
    }
  }
`;

const GET_FAVORITES = gql`
  query MyLibraryFavorites($page: Int, $limit: Int) {
    myLibraryFavorites(page: $page, limit: $limit) {
      nodes { ${CARD_FIELDS} }
      pageInfo { hasNextPage hasPreviousPage totalCount }
    }
  }
`;

const GET_FOLDER_ITEMS = gql`
  query MyLibraryFolderItems($folderId: ID!, $page: Int, $limit: Int) {
    myLibraryFolderItems(folderId: $folderId, page: $page, limit: $limit) {
      nodes { ${CARD_FIELDS} }
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

function LibraryCard({ item }: { item: any }) {
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
          {(item.pagesUrl || item.embedUrl) && (
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

function ItemGrid({ items, pageInfo, page, setPage }: { items: any[]; pageInfo: any; page: number; setPage(page: number): void }) {
  useItemStates(items.map((item) => item.id));
  return (
    <>
      {pageInfo && (
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

function LoadingGrid() {
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

function CatalogueView({ liveApiEnabled }: { liveApiEnabled: boolean }) {
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
    <>
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
        <LoadingGrid />
      ) : items.length > 0 ? (
        <ItemGrid items={items} pageInfo={pageInfo} page={page} setPage={setPage} />
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
    </>
  );
}

function FavoritesView() {
  const { favoritesVersion } = useLibraryCollections();
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useQuery(GET_FAVORITES, { variables: { page, limit: PAGE_SIZE }, fetchPolicy: 'cache-and-network' });
  const items: any[] = data?.myLibraryFavorites?.nodes ?? [];
  // A star toggled anywhere on the page refreshes this list.
  const firstVersion = useRef(favoritesVersion);
  useEffect(() => {
    if (favoritesVersion !== firstVersion.current) void refetch();
  }, [favoritesVersion, refetch]);
  return (
    <>
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><Star className="h-6 w-6 text-amber-500" /> Favorites</h2>
      {loading && !data ? (
        <LoadingGrid />
      ) : items.length > 0 ? (
        <ItemGrid items={items} pageInfo={data?.myLibraryFavorites?.pageInfo} page={page} setPage={setPage} />
      ) : (
        <p className="py-12 text-center text-gray-500">No favorites yet - tap the star on any score or recording.</p>
      )}
    </>
  );
}

function FolderView({ folderId, onSelect }: { folderId: string; onSelect(view: LibraryView): void }) {
  const { folders } = useLibraryCollections();
  const [page, setPage] = useState(1);
  const folder = folders.find((candidate) => candidate.id === folderId);
  const { data, loading, error } = useQuery(GET_FOLDER_ITEMS, {
    variables: { folderId, page, limit: PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  });
  const items: any[] = data?.myLibraryFolderItems?.nodes ?? [];
  const subfolders = childFolders(folders, folderId);
  const select = (id: string | null) => onSelect(id ? { kind: 'folder', id } : { kind: 'all' });

  if (error) return <p className="py-12 text-center text-gray-500">This folder no longer exists.</p>;
  return (
    <>
      <FolderBreadcrumb path={folderPath(folders, folderId)} onSelect={select} />
      <h2 className="mb-4 mt-1 text-2xl font-bold">{folder?.name ?? 'Folder'}</h2>
      {subfolders.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {subfolders.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => select(child.id)}
              className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:border-primary-300"
            >
              <Folder className="h-4 w-4" /> {child.name}
              <span className="text-xs text-gray-400">{child.itemCount}</span>
            </button>
          ))}
        </div>
      )}
      {loading && !data ? (
        <LoadingGrid />
      ) : items.length > 0 ? (
        <ItemGrid items={items} pageInfo={data?.myLibraryFolderItems?.pageInfo} page={page} setPage={setPage} />
      ) : (
        <p className="py-12 text-center text-gray-500">
          This folder is empty. Use the folder button on any card - or drag a card onto the folder in the sidebar.
        </p>
      )}
    </>
  );
}

function viewFromParams(params: URLSearchParams): LibraryView {
  const folder = params.get('folder');
  if (folder) return { kind: 'folder', id: folder };
  if (params.get('view') === 'favorites') return { kind: 'favorites' };
  return { kind: 'all' };
}

function LibraryPageContent() {
  const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
  const { signedIn } = useLibraryCollections();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = signedIn ? viewFromParams(searchParams) : { kind: 'all' as const };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The view lives in the URL so back/forward and reloads keep it.
  const selectView = useCallback(
    (next: LibraryView) => {
      const params = new URLSearchParams();
      if (next.kind === 'favorites') params.set('view', 'favorites');
      if (next.kind === 'folder') params.set('folder', next.id);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      setSidebarOpen(false);
    },
    [pathname, router],
  );

  return (
    <main className="px-4 py-12 sm:px-6 sm:py-16">
      <section className={`mx-auto ${signedIn ? 'max-w-7xl' : 'max-w-5xl'}`}>
        <p className="mb-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Library Pillar
        </p>
        <h1 className="mb-4 text-4xl font-bold">Sheet Music, Recordings and Books</h1>
        <p className="mb-8 max-w-3xl text-gray-600">
          Browse historical scores, recordings and music literature from the Bibliothèque nationale de France and
          openly licensed collections.
          {signedIn ? ' Star what you like and keep it in your own folders.' : ' Sign in to keep favorites and folders.'}
        </p>

        {!liveApiEnabled && (
          <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Live API is disabled in this environment, so the library catalogue can&rsquo;t be loaded.
          </p>
        )}

        <div className={signedIn ? 'lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8' : ''}>
          {signedIn && (
            <aside className="mb-6 lg:mb-0">
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                aria-expanded={sidebarOpen}
                className="mb-3 inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 lg:hidden"
              >
                <PanelLeft className="h-4 w-4" /> Favorites &amp; folders
              </button>
              <div className={`${sidebarOpen ? 'block' : 'hidden'} rounded-xl border border-gray-200 p-2 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}>
                <LibrarySidebar view={view} onSelect={selectView} />
              </div>
            </aside>
          )}
          <div className="min-w-0">
            {view.kind === 'favorites' ? (
              <FavoritesView />
            ) : view.kind === 'folder' ? (
              <FolderView key={view.id} folderId={view.id} onSelect={selectView} />
            ) : (
              <CatalogueView liveApiEnabled={liveApiEnabled} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LibraryPage() {
  // useSearchParams needs a Suspense boundary for the static build.
  return (
    <Suspense fallback={null}>
      <LibraryPageContent />
    </Suspense>
  );
}
