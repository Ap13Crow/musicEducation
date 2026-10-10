'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, ExternalLink, Folder, FolderOpen, Globe, Library, MoreHorizontal, Plus, Star, Trash2, X,
} from 'lucide-react';
import { childFolders, folderPath, isDescendant, useLibraryCollections, type LibraryFolder } from './LibraryCollections';
import { CopyLinkButton, QrCodePanel, useIsAdmin } from './ShareBar';

export type LibraryView = { kind: 'all' } | { kind: 'favorites' } | { kind: 'folder'; id: string };

// Drag payloads: a Library card carries its item id, a folder row its folder id.
export const ITEM_DRAG_TYPE = 'application/x-library-item';
const FOLDER_DRAG_TYPE = 'application/x-library-folder';

function NameForm({ initial, onSubmit, onCancel, placeholder }: {
  initial?: string;
  placeholder: string;
  onSubmit(name: string): void;
  onCancel(): void;
}) {
  const [name, setName] = useState(initial ?? '');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) onSubmit(name.trim());
      }}
      className="flex items-center gap-1 py-1"
    >
      <input
        autoFocus
        value={name}
        maxLength={80}
        placeholder={placeholder}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onCancel()}
        className="input min-w-0 flex-1 px-2 py-1 text-sm"
      />
      <button type="button" onClick={onCancel} aria-label="Cancel" className="p-1 text-gray-400 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}

// Everything you can do with one folder, in a proper dialog (a bottom sheet
// on phones) - the sidebar is too narrow for forms, and a QR code shown
// inside it got trapped there. Rendered at the end of <body>.
export function FolderDialog({ folder, onClose, onOpenFolder }: { folder: LibraryFolder; onClose(): void; onOpenFolder(id: string): void }) {
  const { folders, renameFolder, createFolder, moveFolder, deleteFolder, setFolderPublic } = useLibraryCollections();
  const isAdmin = useIsAdmin();
  const [name, setName] = useState(folder.name);
  const [subfolder, setSubfolder] = useState('');
  const [busy, setBusy] = useState(false);
  const moveTargets = folders.filter((target) => target.id !== folder.id && !isDescendant(folders, folder.id, target.id));
  const path = folderPath(folders, folder.id).map((part) => part.name).join(' / ');

  useEffect(() => {
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', escape);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', escape);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  const sectionTitle = 'mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500';
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`Folder ${folder.name}`}
        className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Folder className="h-5 w-5 shrink-0 text-primary-600" /> <span className="truncate">{folder.name}</span>
              {folder.isPublic && <Globe className="h-4 w-4 shrink-0 text-green-600" aria-label="Public" />}
            </h2>
            <p className="truncate text-sm text-gray-500">{path} · {folder.itemCount} {folder.itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
          <button type="button" onClick={() => { onOpenFolder(folder.id); onClose(); }} className="btn-primary inline-flex w-full items-center justify-center gap-2">
            <FolderOpen className="h-4 w-4" /> Open folder
          </button>

          <section>
            <h3 className={sectionTitle}>Name</h3>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim() && name.trim() !== folder.name) void act(() => renameFolder(folder.id, name.trim()));
              }}
            >
              <input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} aria-label="Folder name" className="input min-w-0 flex-1 text-base sm:text-sm" />
              <button type="submit" disabled={busy || !name.trim() || name.trim() === folder.name} className="rounded-lg border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50">Rename</button>
            </form>
          </section>

          <section>
            <h3 className={sectionTitle}>New subfolder</h3>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const value = subfolder.trim();
                if (value) void act(async () => { await createFolder(value, folder.id); setSubfolder(''); });
              }}
            >
              <input value={subfolder} maxLength={80} placeholder="Subfolder name" onChange={(event) => setSubfolder(event.target.value)} aria-label="Subfolder name" className="input min-w-0 flex-1 text-base sm:text-sm" />
              <button type="submit" disabled={busy || !subfolder.trim()} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50">
                <Plus className="h-4 w-4" /> Create
              </button>
            </form>
          </section>

          <section>
            <h3 className={sectionTitle}>Move to</h3>
            <select
              className="input w-full text-base sm:text-sm"
              value={folder.parentId ?? ''}
              aria-label="Move folder to"
              onChange={(event) => void act(() => moveFolder(folder.id, event.target.value || null))}
            >
              <option value="">Top level</option>
              {moveTargets.map((target) => (
                <option key={target.id} value={target.id}>{folderPath(folders, target.id).map((part) => part.name).join(' / ')}</option>
              ))}
            </select>
          </section>

          {isAdmin && (
            <section>
              <h3 className={sectionTitle}>Sharing</h3>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={folder.isPublic}
                  disabled={busy}
                  onChange={() => void act(() => setFolderPublic(folder.id, !folder.isPublic))}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300"
                />
                <span className="text-sm">
                  <span className="font-medium">Public folder</span>
                  <span className="block text-xs text-gray-500">Anyone with the link can see this folder and its subfolders, without signing in.</span>
                </span>
              </label>
              {folder.isPublic && folder.shareUrl && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <CopyLinkButton url={folder.shareUrl} label="Copy link" />
                    <Link href={folder.shareUrl} target="_blank" className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700">
                      <ExternalLink className="h-4 w-4" /> Open public page
                    </Link>
                  </div>
                  <QrCodePanel qrBase={`/api/library/folders/${folder.id}/qr`} shareUrl={folder.shareUrl} />
                </div>
              )}
            </section>
          )}

          <section className="border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Delete "${folder.name}" and its subfolders? The library items themselves stay.`)) {
                  void act(() => deleteFolder(folder.id)).then(onClose);
                }
              }}
              className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete folder
            </button>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FolderRow({ folder, depth, view, onSelect }: { folder: LibraryFolder; depth: number; view: LibraryView; onSelect(view: LibraryView): void }) {
  const { folders, addToFolder, moveFolder } = useLibraryCollections();
  const children = childFolders(folders, folder.id);
  const selected = view.kind === 'folder' && view.id === folder.id;
  const containsSelection = view.kind === 'folder' && isDescendant(folders, folder.id, view.id);
  const [expanded, setExpanded] = useState(containsSelection);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    if (containsSelection) setExpanded(true);
  }, [containsSelection]);

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDropActive(false);
    const itemId = event.dataTransfer.getData(ITEM_DRAG_TYPE);
    const folderId = event.dataTransfer.getData(FOLDER_DRAG_TYPE);
    if (itemId) void addToFolder(folder.id, itemId);
    else if (folderId && folderId !== folder.id && !isDescendant(folders, folderId, folder.id)) void moveFolder(folderId, folder.id);
  }

  return (
    <li>
      <div
          draggable
          onDragStart={(event) => event.dataTransfer.setData(FOLDER_DRAG_TYPE, folder.id)}
          onDragOver={(event) => { event.preventDefault(); setDropActive(true); }}
          onDragLeave={() => setDropActive(false)}
          onDrop={onDrop}
          className={`group relative flex items-center rounded-lg pr-1 ${
            selected ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-100'
          } ${dropActive ? 'ring-2 ring-primary-400' : ''}`}
          style={{ paddingLeft: `${depth * 0.75}rem` }}
        >
          <button
            type="button"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((value) => !value)}
            className={`flex h-9 w-6 shrink-0 items-center justify-center text-gray-400 ${children.length === 0 ? 'invisible' : ''}`}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => onSelect({ kind: 'folder', id: folder.id })} className="flex min-h-[2.5rem] min-w-0 flex-1 items-center gap-2 text-left text-sm">
            {selected ? <FolderOpen className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />}
            <span className="truncate">{folder.name}</span>
            {folder.isPublic && <Globe className="h-3.5 w-3.5 shrink-0 text-green-600" aria-label="Public" />}
            <span className="ml-auto pl-1 text-xs text-gray-400">{folder.itemCount || ''}</span>
          </button>
          <button
            type="button"
            aria-label={`Folder settings for ${folder.name}`}
            aria-haspopup="dialog"
            onClick={() => setDialogOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      {expanded && children.length > 0 && (
        <ul>
          {children.map((child) => <FolderRow key={child.id} folder={child} depth={depth + 1} view={view} onSelect={onSelect} />)}
        </ul>
      )}
      {dialogOpen && (
        <FolderDialog
          folder={folder}
          onClose={() => setDialogOpen(false)}
          onOpenFolder={(id) => {
            setExpanded(true);
            onSelect({ kind: 'folder', id });
          }}
        />
      )}
    </li>
  );
}

export function LibrarySidebar({ view, onSelect }: { view: LibraryView; onSelect(view: LibraryView): void }) {
  const { folders, createFolder, error, clearError } = useLibraryCollections();
  const [adding, setAdding] = useState(false);
  const topLevel = childFolders(folders, null);
  const navClass = (active: boolean) =>
    `flex min-h-[2.5rem] w-full items-center gap-2 rounded-lg px-2 text-left text-sm ${active ? 'bg-primary-50 font-medium text-primary-800' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <nav aria-label="My library" className="space-y-1">
      <button type="button" className={navClass(view.kind === 'all')} onClick={() => onSelect({ kind: 'all' })}>
        <Library className="h-4 w-4" /> All library
      </button>
      <button type="button" className={navClass(view.kind === 'favorites')} onClick={() => onSelect({ kind: 'favorites' })}>
        <Star className="h-4 w-4" /> Favorites
      </button>

      <div className="flex items-center justify-between px-2 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">My folders</span>
        <button type="button" onClick={() => setAdding(true)} aria-label="New folder" title="New folder" className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p className="flex items-start justify-between gap-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
          {error}
          <button type="button" onClick={clearError} aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
        </p>
      )}
      {adding && (
        <div className="px-1">
          <NameForm placeholder="Folder name" onCancel={() => setAdding(false)} onSubmit={(name) => { setAdding(false); void createFolder(name, null); }} />
        </div>
      )}
      {topLevel.length === 0 && !adding ? (
        <p className="px-2 text-xs text-gray-500">Create folders to keep scores and recordings together. Drag a card onto a folder to add it.</p>
      ) : (
        <ul>
          {topLevel.map((folder) => <FolderRow key={folder.id} folder={folder} depth={0} view={view} onSelect={onSelect} />)}
        </ul>
      )}
    </nav>
  );
}
