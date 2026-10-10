'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { Folder, PanelLeft, Settings2, Star } from 'lucide-react';
import { childFolders, folderPath, useLibraryCollections } from '@/components/library/LibraryCollections';
import { FolderBreadcrumb } from '@/components/library/ItemCollectionActions';
import { FolderDialog, LibrarySidebar, type LibraryView } from '@/components/library/LibrarySidebar';
import { CARD_FIELDS, ItemGrid, LoadingGrid } from '@/components/library/LibraryCards';
import { LibrarySearchView } from '@/components/library/LibrarySearchView';
import { LibraryRecommendations } from '@/components/library/LibraryRecommendations';

const PAGE_SIZE = 24;

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
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      <div className="mb-4 mt-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">{folder?.name ?? 'Folder'}</h2>
        {folder && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700"
          >
            <Settings2 className="h-4 w-4" /> Folder settings{folder.isPublic ? ' · public' : ''}
          </button>
        )}
      </div>
      {settingsOpen && folder && <FolderDialog folder={folder} onClose={() => setSettingsOpen(false)} onOpenFolder={select} />}
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
          Browse historical scores, recordings and music literature from the Bibliothèque nationale de France, the
          Deutsche Nationalbibliothek and openly licensed collections.
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
              <>
                {/* Only on the plain catalogue - not over a search. */}
                {signedIn && liveApiEnabled && !searchParams.get('q') && !searchParams.get('page') && <LibraryRecommendations />}
                <LibrarySearchView liveApiEnabled={liveApiEnabled} />
              </>
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
