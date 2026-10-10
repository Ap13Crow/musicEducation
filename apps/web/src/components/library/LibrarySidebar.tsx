'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown, ChevronRight, Folder, FolderOpen, Globe, Library, MoreHorizontal, Pencil, Plus, Star, Trash2, X,
} from 'lucide-react';
import { childFolders, folderPath, isDescendant, useLibraryCollections, type LibraryFolder } from './LibraryCollections';
import { CopyLinkButton, QrCodeButton, useIsAdmin } from './ShareBar';

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

function FolderMenu({ folder, onClose, onRename, onNewSubfolder }: {
  folder: LibraryFolder;
  onClose(): void;
  onRename(): void;
  onNewSubfolder(): void;
}) {
  const { folders, moveFolder, deleteFolder, setFolderPublic } = useLibraryCollections();
  const isAdmin = useIsAdmin();
  const ref = useRef<HTMLDivElement>(null);
  const moveTargets = folders.filter((target) => target.id !== folder.id && !isDescendant(folders, folder.id, target.id));

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [onClose]);

  const itemClass = 'flex min-h-[2.5rem] w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-gray-50';
  return (
    <div ref={ref} className="absolute right-0 top-full z-40 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
      <button type="button" className={itemClass} onClick={() => { onClose(); onNewSubfolder(); }}>
        <Plus className="h-4 w-4" /> New subfolder
      </button>
      <button type="button" className={itemClass} onClick={() => { onClose(); onRename(); }}>
        <Pencil className="h-4 w-4" /> Rename
      </button>
      <label className="block px-2 py-1 text-xs text-gray-500">
        Move to
        <select
          className="input mt-1 w-full py-1 text-sm"
          value={folder.parentId ?? ''}
          onChange={(event) => { void moveFolder(folder.id, event.target.value || null); onClose(); }}
        >
          <option value="">Top level</option>
          {moveTargets.map((target) => (
            <option key={target.id} value={target.id}>
              {folderPath(folders, target.id).map((part) => part.name).join(' / ')}
            </option>
          ))}
        </select>
      </label>
      {isAdmin && (
        <div className="mt-1 border-t border-gray-100 pt-1">
          <button type="button" className={itemClass} onClick={() => void setFolderPublic(folder.id, !folder.isPublic)}>
            <Globe className="h-4 w-4" /> {folder.isPublic ? 'Make private' : 'Make public (share link)'}
          </button>
          {folder.isPublic && folder.shareUrl && (
            <div className="flex flex-wrap gap-2 px-2 py-1">
              <CopyLinkButton url={folder.shareUrl} label="Copy link" />
              <QrCodeButton qrBase={`/api/library/folders/${folder.id}/qr`} shareUrl={folder.shareUrl} title={folder.name} />
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        className={`${itemClass} mt-1 border-t border-gray-100 text-red-600`}
        onClick={() => {
          if (window.confirm(`Delete "${folder.name}" and its subfolders? The library items themselves stay.`)) void deleteFolder(folder.id);
          onClose();
        }}
      >
        <Trash2 className="h-4 w-4" /> Delete folder
      </button>
    </div>
  );
}

function FolderRow({ folder, depth, view, onSelect }: { folder: LibraryFolder; depth: number; view: LibraryView; onSelect(view: LibraryView): void }) {
  const { folders, renameFolder, createFolder, addToFolder, moveFolder } = useLibraryCollections();
  const children = childFolders(folders, folder.id);
  const selected = view.kind === 'folder' && view.id === folder.id;
  const containsSelection = view.kind === 'folder' && isDescendant(folders, folder.id, view.id);
  const [expanded, setExpanded] = useState(containsSelection);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
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
      {renaming ? (
        <div style={{ paddingLeft: `${depth * 0.75 + 1.5}rem` }}>
          <NameForm initial={folder.name} placeholder="Folder name" onCancel={() => setRenaming(false)} onSubmit={(name) => { setRenaming(false); void renameFolder(folder.id, name); }} />
        </div>
      ) : (
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
            aria-label={`Folder actions for ${folder.name}`}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-9 w-8 shrink-0 items-center justify-center rounded text-gray-400 hover:text-gray-800 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <FolderMenu
              folder={folder}
              onClose={() => setMenuOpen(false)}
              onRename={() => setRenaming(true)}
              onNewSubfolder={() => { setExpanded(true); setAddingChild(true); }}
            />
          )}
        </div>
      )}
      {(expanded || addingChild) && (
        <ul>
          {expanded && children.map((child) => <FolderRow key={child.id} folder={child} depth={depth + 1} view={view} onSelect={onSelect} />)}
          {addingChild && (
            <li style={{ paddingLeft: `${(depth + 1) * 0.75 + 1.5}rem` }}>
              <NameForm
                placeholder="Subfolder name"
                onCancel={() => setAddingChild(false)}
                onSubmit={(name) => { setAddingChild(false); void createFolder(name, folder.id); }}
              />
            </li>
          )}
        </ul>
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
