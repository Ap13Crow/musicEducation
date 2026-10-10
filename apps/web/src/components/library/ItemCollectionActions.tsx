'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signIn } from 'next-auth/react';
import { Check, ChevronRight, FolderPlus, Plus, Star, X } from 'lucide-react';
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
          className="flex min-h-[2.75rem] w-full items-center gap-2 rounded-md px-2 text-left text-base hover:bg-gray-50 sm:min-h-[2.5rem] sm:text-sm"
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

const PANEL_WIDTH = 288;
const GAP = 8;

// Where the desktop popover goes: under the button, right-aligned with it,
// kept inside the viewport - or above the button when there's no room below.
type PanelPosition = { left: number; top?: number; bottom?: number; maxHeight: number };

function placePanel(button: DOMRect): PanelPosition {
  const width = Math.min(PANEL_WIDTH, window.innerWidth - 2 * GAP);
  const left = Math.min(Math.max(GAP, button.right - width), window.innerWidth - width - GAP);
  const below = window.innerHeight - button.bottom - 2 * GAP;
  const above = button.top - 2 * GAP;
  if (below >= 260 || below >= above) return { left, top: button.bottom + GAP, maxHeight: below };
  return { left, bottom: window.innerHeight - button.top + GAP, maxHeight: above };
}

export function AddToFolderButton({ itemId, compact = false }: { itemId: string; compact?: boolean }) {
  const { signedIn, folders, states, createFolder, addToFolder } = useLibraryCollections();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [sheet, setSheet] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const count = states[itemId]?.folderIds.length ?? 0;
  const close = useCallback(() => setOpen(false), []);

  // Phones get a bottom sheet; wider screens a popover next to the button.
  // Either way it is rendered at the end of <body>, so a card's
  // overflow-hidden or the screen edge can't cut it off.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const small = window.matchMedia('(max-width: 639px)').matches;
    setSheet(small);
    if (!small) setPosition(placePanel(buttonRef.current.getBoundingClientRect()));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && close();
    // A popover pinned to the button would drift away on scroll/resize.
    const reposition = () => buttonRef.current && setPosition(placePanel(buttonRef.current.getBoundingClientRect()));
    document.addEventListener('mousedown', outside);
    document.addEventListener('touchstart', outside, { passive: true });
    document.addEventListener('keydown', escape);
    if (!sheet) {
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
    }
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('touchstart', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, sheet, close]);

  // No page scrolling behind the sheet.
  useEffect(() => {
    if (!open || !sheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, sheet]);

  async function createAndAdd(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const folder = await createFolder(name, null);
    if (folder) await addToFolder(folder.id, itemId);
    setNewName('');
  }

  const content = (
    <>
      <div className="flex items-center justify-between px-2 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Save to folder</p>
        {sheet && (
          <button type="button" onClick={close} aria-label="Close" className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {folders.length === 0 ? (
        <p className="px-2 py-2 text-sm text-gray-500">No folders yet - create your first one below.</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {childFolders(folders, null).map((folder) => (
            <FolderOption key={folder.id} folder={folder} depth={0} itemId={itemId} />
          ))}
        </ul>
      )}
      <form onSubmit={createAndAdd} className="mt-2 flex shrink-0 gap-2 border-t border-gray-100 pt-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New folder"
          aria-label="New folder name"
          maxLength={80}
          // 16 px on phones - iOS zooms into smaller inputs.
          className="input min-w-0 flex-1 py-2 text-base sm:py-1.5 sm:text-sm"
        />
        <button type="submit" className="btn-primary px-3 py-1.5 text-sm" aria-label="Create folder">
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </>
  );

  const panel =
    open && typeof document !== 'undefined'
      ? createPortal(
          sheet ? (
            <div className="fixed inset-0 z-50" onClick={(event) => event.stopPropagation()}>
              <div className="absolute inset-0 bg-black/30" aria-hidden onClick={close} />
              <div
                ref={panelRef}
                role="dialog"
                aria-label="Save to folder"
                className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-2xl bg-white p-3 shadow-2xl"
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
              >
                <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-gray-300" aria-hidden />
                {content}
              </div>
            </div>
          ) : position ? (
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Save to folder"
              className="fixed z-50 flex flex-col rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
              style={{
                left: position.left,
                top: position.top,
                bottom: position.bottom,
                width: Math.min(PANEL_WIDTH, window.innerWidth - 2 * GAP),
                maxHeight: Math.max(200, Math.min(position.maxHeight, 420)),
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {content}
            </div>
          ) : null,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
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
      {panel}
    </>
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
