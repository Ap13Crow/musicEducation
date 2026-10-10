'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Folder, Library } from 'lucide-react';

// The Library pieces a teacher attached to a lesson, as students see them in
// the lesson player. Each opens in the Library (where reading and listening
// to the end earns library XP); a folder lists its current items.

type Item = { id: string; title: string; creator: string | null; category: string };
type Reference = {
  id: string;
  note: string | null;
  item: Item | null;
  folder: { id: string; name: string; items: Item[] } | null;
};

export const LESSON_LIBRARY_LIST_FIELDS = 'libraryReferences { id note order item { id title creator category } folder { id name items { id title creator category } } }';

const KIND: Record<string, string> = { SHEET_MUSIC: 'Score', AUDIO_RECORDING: 'Recording', BOOK: 'Book', OTHER: 'Item' };

function ItemLink({ item }: { item: Item }) {
  return (
    <Link href={`/library/${item.id}`} className="group flex min-h-[2.75rem] items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
      <span className="mt-0.5 shrink-0 rounded bg-primary-50 px-1.5 py-0.5 text-[11px] font-medium text-primary-700">{KIND[item.category] ?? 'Item'}</span>
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary-700">{item.title}</span>
        {item.creator && <span className="block text-xs text-gray-500">{item.creator}</span>}
      </span>
    </Link>
  );
}

function FolderReference({ reference }: { reference: Reference }) {
  const [open, setOpen] = useState(false);
  const folder = reference.folder!;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-[2.75rem] w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-gray-50"
      >
        <Folder className="h-4 w-4 shrink-0 text-primary-600" />
        <span className="flex-1 text-sm font-medium">{folder.name}</span>
        <span className="text-xs text-gray-500">{folder.items.length} items</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-4 border-l border-gray-100 pl-2">
          {folder.items.length === 0 ? <p className="px-2 py-1 text-xs text-gray-500">This folder is empty.</p> : folder.items.map((item) => <ItemLink key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

export function LessonLibraryList({ references }: { references: Reference[] }) {
  if (!references?.length) return null;
  return (
    <section className="mt-6 rounded-xl border border-gray-200 p-4" aria-labelledby="lesson-library">
      <h3 id="lesson-library" className="mb-1 flex items-center gap-2 font-semibold">
        <Library className="h-4 w-4 text-primary-600" /> From the Library
      </h3>
      <p className="mb-2 text-xs text-gray-500">Read or listen to the end to earn library XP.</p>
      <ul className="space-y-1">
        {references.map((reference) => (
          <li key={reference.id}>
            {reference.folder ? (
              <FolderReference reference={reference} />
            ) : reference.item ? (
              <ItemLink item={reference.item} />
            ) : (
              <p className="px-2 py-1 text-sm text-gray-500">This piece is no longer in the Library.</p>
            )}
            {reference.note && <p className="ml-2 mt-0.5 border-l-2 border-amber-300 pl-2 text-xs text-gray-700">{reference.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
