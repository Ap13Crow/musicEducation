'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Check, ChevronRight, FolderPlus, Plus, Star } from 'lucide-react';
import { childFolders, useLibraryCollections, type LibraryFolder } from './LibraryCollections';

// Star + "add to folder" controls for one Library item. Signed-out visitors
// see the star too; clicking it asks them to sign in.
export function FavoriteButton({ itemId, size = 'md' }: { itemId: string; size?: 'sm' | 'md' }) {
  const { signedIn, states, toggleFavorite } = useLibraryCollections();
  const active = Boolean(states[itemId]?.isFavorite);
  const dimension = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!signedIn) return void signIn('keycloak');
        void toggleFavorite(itemId);
      }}
      className={`inline-flex ${dimension} items-center justify-center rounded-full border bg-white/95 shadow-sm transition-colors ${
        active ? 'border-amber-300 text-amber-500' : 'border-gray-200 text-gray-500 hover:text-amber-500'
      }`}
    >
      <Star className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
    </button>
  );
}

function FolderOption({ folder, depth, itemId }: { folder: LibraryFolder; depth: number; itemId: string }) {
  const { folders, states, toggleInFolder } = useLibraryCollections();
  const included = (states[itemId]?.folderIds ?? []).includes(folder.id);
  return (
    <>
      <li>
        <button
          type="button"
          onClick={() => void toggleInFolder(folder.id, itemId)}
          className="flex min-h-[2.5rem] w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-gray-50"
          style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
        >
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${included ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
            {included && <Check className="h-3 w-3" />}
          </span>
          <span className="truncate">{folder.name}</span>
        </button>
      </li>
      {childFolders(folders, folder.id).map((child) => (
        <FolderOption key={child.id} folder={child} depth={depth + 1} itemId={itemId} />
      ))}
    </>
  );
}

export function AddToFolderButton({ itemId, compact = false }: { itemId: string; compact?: boolean }) {
  const { signedIn, folders, states, createFolder, addToFolder } = useLibraryCollections();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const count = states[itemId]?.folderIds.length ?? 0;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  async function createAndAdd(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const folder = await createFolder(name, null);
    if (folder) await addToFolder(folder.id, itemId);
    setNewName('');
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        title="Save to folder"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!signedIn) return void signIn('keycloak');
          setOpen((value) => !value);
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full border bg-white/95 shadow-sm ${
          compact ? 'h-9 w-9' : 'min-h-[2.75rem] px-3 text-sm'
        } ${count > 0 ? 'border-primary-300 text-primary-700' : 'border-gray-200 text-gray-600 hover:text-primary-700'}`}
      >
        <FolderPlus className="h-5 w-5" />
        {!compact && (count > 0 ? `In ${count} folder${count === 1 ? '' : 's'}` : 'Save to folder')}
      </button>
      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Save to folder</p>
          {folders.length === 0 ? (
            <p className="px-2 py-2 text-sm text-gray-500">No folders yet - create your first one below.</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {childFolders(folders, null).map((folder) => (
                <FolderOption key={folder.id} folder={folder} depth={0} itemId={itemId} />
              ))}
            </ul>
          )}
          <form onSubmit={createAndAdd} className="mt-2 flex gap-2 border-t border-gray-100 pt-2">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="New folder"
              maxLength={80}
              className="input min-w-0 flex-1 py-1.5 text-sm"
            />
            <button type="submit" className="btn-primary px-3 py-1.5 text-sm" aria-label="Create folder">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function FolderBreadcrumb({ path, onSelect }: { path: LibraryFolder[]; onSelect(id: string | null): void }) {
  return (
    <nav aria-label="Folder path" className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
      <button type="button" onClick={() => onSelect(null)} className="hover:text-primary-700">My folders</button>
      {path.map((folder) => (
        <span key={folder.id} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          <button type="button" onClick={() => onSelect(folder.id)} className="hover:text-primary-700">{folder.name}</button>
        </span>
      ))}
    </nav>
  );
}
