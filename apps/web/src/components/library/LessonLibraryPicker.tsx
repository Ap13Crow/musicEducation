'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { ArrowDown, ArrowUp, Folder, Library, Plus, Search, Star, Trash2, X } from 'lucide-react';

// Course builder: attach Library items or whole folders to a lesson as
// references (API: resolvers/lessonLibrary.ts). Search the Library, or pick
// from your own folders and favorites; each reference can carry a note
// ("Play bars 1-16 slowly").

export type LessonLibraryRef = {
  id: string;
  note: string | null;
  order: number;
  item: { id: string; title: string; creator: string | null; source: string } | null;
  folder: { id: string; name: string; items: { id: string }[] } | null;
};

export const LESSON_LIBRARY_REFERENCE_FIELDS = 'id note order item{id title creator source} folder{id name items{id}}';

const SEARCH = gql`
  query LessonPickerSearch($input: LibrarySearchInput!) {
    searchLibrary(input: $input) { totalCount nodes { id title creator date source category availableHere } }
  }
`;
const MINE = gql`
  query LessonPickerMine {
    myLibraryFolders { id name parentId itemCount }
    myLibraryFavorites(limit: 50) { nodes { id title creator date source category availableHere } }
  }
`;
const ADD = gql`
  mutation AddLessonLibraryReference($input: AddLessonLibraryReferenceInput!) {
    addLessonLibraryReference(input: $input) { id }
  }
`;
const UPDATE = gql`
  mutation UpdateLessonLibraryReference($id: ID!, $note: String) {
    updateLessonLibraryReference(id: $id, note: $note) { id note }
  }
`;
const REMOVE = gql`
  mutation RemoveLessonLibraryReference($id: ID!) { removeLessonLibraryReference(id: $id) }
`;
const REORDER = gql`
  mutation ReorderLessonLibraryReferences($lessonId: ID!, $ids: [ID!]!) {
    reorderLessonLibraryReferences(lessonId: $lessonId, ids: $ids) { id order }
  }
`;

type Tab = 'search' | 'folders' | 'favorites';

function ItemRow({ item, attached, onAdd }: { item: any; attached: boolean; onAdd(): void }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <div className="min-w-0 flex-1">
        <Link href={`/library/${item.id}`} target="_blank" className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-primary-700">{item.title}</Link>
        <p className="text-xs text-gray-500">
          {[item.creator, item.date].filter(Boolean).join(' · ')}
          {item.availableHere === false && ' · opens at the source for now'}
        </p>
      </div>
      <button
        type="button"
        disabled={attached}
        onClick={onAdd}
        className="inline-flex min-h-[2.5rem] shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {attached ? 'Added' : <><Plus className="h-4 w-4" /> Add</>}
      </button>
    </li>
  );
}

export function LessonLibraryPicker({
  lessonId,
  lessonTitle,
  references,
  onChanged,
  onClose,
}: {
  lessonId: string;
  lessonTitle: string;
  references: LessonLibraryRef[];
  onChanged(): Promise<unknown> | void;
  onClose(): void;
}) {
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [runSearch, { data: searchData, loading: searching }] = useLazyQuery(SEARCH, { fetchPolicy: 'network-only' });
  const { data: mine } = useQuery(MINE, { fetchPolicy: 'cache-and-network' });
  const [add] = useMutation(ADD);
  const [update] = useMutation(UPDATE);
  const [remove] = useMutation(REMOVE);
  const [reorder] = useMutation(REORDER);

  const sorted = [...references].sort((a, b) => a.order - b.order);
  const attachedItems = new Set(sorted.map((ref) => ref.item?.id).filter(Boolean));
  const attachedFolders = new Set(sorted.map((ref) => ref.folder?.id).filter(Boolean));

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (failure: any) {
      setError(failure?.message ?? 'That did not work - please try again.');
    }
  }

  const attachItem = (itemId: string) => run(() => add({ variables: { input: { lessonId, itemId } } }));
  const attachFolder = (folderId: string) => run(() => add({ variables: { input: { lessonId, folderId } } }));
  const move = (index: number, direction: -1 | 1) => {
    const ids = sorted.map((ref) => ref.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    return run(() => reorder({ variables: { lessonId, ids } }));
  };

  const folders: any[] = mine?.myLibraryFolders ?? [];
  const favorites: any[] = mine?.myLibraryFavorites?.nodes ?? [];
  const results: any[] = searchData?.searchLibrary?.nodes ?? [];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" role="dialog" aria-label={`Library references for ${lessonTitle}`}>
      <div className="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Library className="h-5 w-5 text-primary-600" /> Library references</h2>
            <p className="text-sm text-gray-500">{lessonTitle} - students open these in the Library and earn XP for reading and listening.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">In this lesson</h3>
          {sorted.length === 0 ? (
            <p className="mb-4 text-sm text-gray-500">Nothing attached yet - add scores, recordings or a whole folder below.</p>
          ) : (
            <ul className="mb-5 space-y-2" data-testid="lesson-library-references">
              {sorted.map((ref, index) => (
                <li key={ref.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start gap-2">
                    {ref.folder ? <Folder className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /> : <Library className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />}
                    <div className="min-w-0 flex-1">
                      {ref.item ? (
                        <Link href={`/library/${ref.item.id}`} target="_blank" className="line-clamp-2 text-sm font-medium hover:text-primary-700">{ref.item.title}</Link>
                      ) : ref.folder ? (
                        <p className="text-sm font-medium">{ref.folder.name} <span className="font-normal text-gray-500">· folder, {ref.folder.items.length} items</span></p>
                      ) : (
                        <p className="text-sm text-gray-500">No longer in the Library</p>
                      )}
                      {ref.item?.creator && <p className="text-xs text-gray-500">{ref.item.creator}</p>}
                    </div>
                    <div className="flex shrink-0 items-center">
                      <button type="button" disabled={index === 0} onClick={() => void move(index, -1)} aria-label="Move up" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" disabled={index === sorted.length - 1} onClick={() => void move(index, 1)} aria-label="Move down" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" onClick={() => void run(() => remove({ variables: { id: ref.id } }))} aria-label="Remove" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <input
                    defaultValue={ref.note ?? ''}
                    placeholder="Note for students (optional), e.g. “Play bars 1–16 slowly”"
                    aria-label="Note for students"
                    maxLength={500}
                    onBlur={(event) => {
                      const note = event.target.value.trim();
                      if (note !== (ref.note ?? '')) void run(() => update({ variables: { id: ref.id, note: note || null } }));
                    }}
                    className="input mt-2 w-full py-1.5 text-base sm:text-sm"
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mb-3 flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
            {([
              ['search', 'Search', Search],
              ['folders', 'My folders', Folder],
              ['favorites', 'Favorites', Star],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 ${tab === key ? 'bg-white font-medium shadow-sm' : 'text-gray-600'}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {tab === 'search' && (
            <>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (query.trim()) void runSearch({ variables: { input: { query: query.trim(), availableOnly: false, limit: 30 } } });
                }}
              >
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, composer…" aria-label="Search the Library" className="input min-w-0 flex-1 text-base sm:text-sm" />
                <button type="submit" className="btn-primary">{searching ? '…' : 'Search'}</button>
              </form>
              {searchData && (
                results.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">Nothing found.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-gray-100">
                    {results.map((item) => <ItemRow key={item.id} item={item} attached={attachedItems.has(item.id)} onAdd={() => void attachItem(item.id)} />)}
                  </ul>
                )
              )}
            </>
          )}

          {tab === 'folders' && (
            folders.length === 0 ? (
              <p className="text-sm text-gray-500">
                You have no folders yet. In the <Link href="/library" target="_blank" className="text-primary-700 underline">Library</Link>, use “Save to folder” to collect pieces for your lessons.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {folders.map((folder) => (
                  <li key={folder.id} className="flex items-center gap-3 py-2">
                    <Folder className="h-4 w-4 shrink-0 text-primary-600" />
                    <p className="min-w-0 flex-1 truncate text-sm">
                      {folder.name} <span className="text-xs text-gray-500">· {folder.itemCount} items{folder.parentId ? ' · subfolder' : ''}</span>
                    </p>
                    <button
                      type="button"
                      disabled={attachedFolders.has(folder.id)}
                      onClick={() => void attachFolder(folder.id)}
                      className="inline-flex min-h-[2.5rem] shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {attachedFolders.has(folder.id) ? 'Added' : <><Plus className="h-4 w-4" /> Add folder</>}
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === 'favorites' && (
            favorites.length === 0 ? (
              <p className="text-sm text-gray-500">No favorites yet - star pieces in the Library to find them here.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {favorites.map((item) => <ItemRow key={item.id} item={item} attached={attachedItems.has(item.id)} onAdd={() => void attachItem(item.id)} />)}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
