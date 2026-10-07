'use client';

import { Volume2 } from 'lucide-react';

// Player for library recordings. Only ever given a URL we're allowed to
// serve (LibraryItem.audioUrl - our own storage or an openly licensed
// source), never a Gallica master. Native controls keep keyboard, media-key
// and screen-reader support for free.
export function AudioPlayer({ url, title, attribution }: { url: string; title: string; attribution?: string | null }) {
  return (
    <section className="card p-4" aria-label={`Recording: ${title}`} data-testid="audio-player">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800">
        <Volume2 className="h-4 w-4 text-primary-600" /> Listen
      </p>
      <audio controls preload="metadata" src={url} className="w-full">
        Your browser can&rsquo;t play this recording.
      </audio>
      {attribution && <p className="mt-2 text-xs text-gray-400">{attribution}</p>}
    </section>
  );
}
