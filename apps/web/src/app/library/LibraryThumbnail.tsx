'use client';

import { useState } from 'react';
import { BookOpen, Music, Volume2 } from 'lucide-react';

// Muted tones that keep white serif text readable (all >= 4.5:1).
const TILE_COLORS = ['#3b4a6b', '#5b3a55', '#2f5d50', '#6b4a2f', '#4a4f8c', '#7a3e3e', '#35606f', '#58526b'];

// "Bach, Johann Sebastian (1685-1750). Compositeur" (Gallica), "J. S. Bach"
// (Mutopia), "Johann Sebastian Bach" (Musopen) -> "Bach".
export function composerSurname(creator: string | null | undefined): string | null {
  if (!creator) return null;
  const name = creator.includes(',') ? creator.split(',')[0] : creator.replace(/\s*\(.*$/, '').trim().split(/\s+/).pop()!;
  return name.replace(/[.;:]+$/, '').trim() || null;
}

function tileColor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return TILE_COLORS[Math.abs(hash) % TILE_COLORS.length];
}

function CategoryIcon({ category, className }: { category: string; className: string }) {
  if (category === 'SHEET_MUSIC') return <Music className={className} />;
  if (category === 'AUDIO_RECORDING') return <Volume2 className={className} />;
  return <BookOpen className={className} />;
}

// Card image: the item's stored thumbnail (page 1 / opening bars, anchored
// to the top so titles and first systems show), or - for recordings and
// anything without one - a composer tile coloured by the composer's name.
export function LibraryThumbnail({ item }: { item: { thumbnailUrl?: string | null; creator?: string | null; title: string; category: string } }) {
  const [failed, setFailed] = useState(false);
  if (item.thumbnailUrl && !failed) {
    return (
      <div className="h-40 w-full overflow-hidden border-b border-gray-100 bg-white">
        <img
          src={item.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }
  const surname = composerSurname(item.creator);
  return (
    <div
      className="relative flex h-40 w-full flex-col items-center justify-center overflow-hidden px-4 text-center text-white"
      style={{ backgroundColor: tileColor(surname ?? item.title) }}
      aria-hidden="true"
    >
      <CategoryIcon category={item.category} className="absolute right-3 top-3 h-4 w-4 opacity-70" />
      <CategoryIcon category={item.category} className="absolute -bottom-6 -left-6 h-28 w-28 opacity-10" />
      {surname ? (
        <span className="line-clamp-2 font-serif text-2xl font-semibold leading-tight tracking-wide">{surname}</span>
      ) : (
        <CategoryIcon category={item.category} className="h-10 w-10 opacity-80" />
      )}
    </div>
  );
}
