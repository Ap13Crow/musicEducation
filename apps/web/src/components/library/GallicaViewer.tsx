'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

interface GallicaPage {
  pageNumber: number;
  label: string | null;
  imageUrl: string;
  audioUrl: string | null;
}

const ATTRIBUTION = 'Source: gallica.bnf.fr / Bibliothèque nationale de France';

// Gallica scans (sheet music, books) one page at a time, and recordings as
// a track list - one image or track at a time on purpose: every uncached
// page is an upstream Gallica request, and Gallica rate-limits bursts.
export function GallicaViewer({ pagesUrl, title }: { pagesUrl: string; title: string }) {
  const [pages, setPages] = useState<GallicaPage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setPages(null);
    setFailed(false);
    setIndex(0);
    fetch(pagesUrl)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => !cancelled && setPages(data.pages ?? []))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [pagesUrl]);

  const page = pages?.[index];
  useEffect(() => setImageState('loading'), [page?.imageUrl]);

  if (failed) {
    return <p className="card px-4 py-10 text-center text-sm text-red-700">Gallica is temporarily unavailable. Try again shortly.</p>;
  }
  if (!pages) return <p className="card px-4 py-10 text-center text-sm text-gray-500">Loading from Gallica…</p>;
  if (pages.length === 0 || !page) {
    return <p className="card px-4 py-10 text-center text-sm text-gray-600">Gallica has no viewable pages for this item.</p>;
  }

  const tracks = pages.filter((p) => p.audioUrl);
  if (tracks.length > 0) {
    const current = page.audioUrl ? page : tracks[0];
    return (
      <div className="space-y-4">
        <AudioPlayer url={current.audioUrl!} title={current.label ?? `${title} - track ${current.pageNumber}`} attribution={ATTRIBUTION} />
        {tracks.length > 1 && (
          <ol className="card divide-y divide-gray-100 p-0 text-sm" data-testid="gallica-tracks">
            {tracks.map((track) => (
              <li key={track.pageNumber}>
                <button
                  type="button"
                  onClick={() => setIndex(pages.indexOf(track))}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${track === current ? 'font-semibold text-primary-700' : 'text-gray-700'}`}
                >
                  {track.pageNumber}. {track.label ?? `Track ${track.pageNumber}`}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return (
    <section className="card p-0" aria-label={`Scan: ${title}`} data-testid="gallica-viewer">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          aria-label="Previous page"
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs tabular-nums text-gray-500">
          {page.label ? `${page.label} · ` : ''}
          {index + 1} / {pages.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          disabled={index >= pages.length - 1}
          aria-label="Next page"
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex min-h-[24rem] items-start justify-center bg-gray-50 p-2">
        {imageState === 'error' ? (
          <p className="self-center text-sm text-red-700">This page couldn&rsquo;t be loaded from Gallica. Try again shortly.</p>
        ) : (
          <img
            key={page.imageUrl}
            src={page.imageUrl}
            alt={`${title}, page ${index + 1}`}
            onLoad={() => setImageState('ready')}
            onError={() => setImageState('error')}
            className={`max-w-full shadow-sm ${imageState === 'loading' ? 'opacity-40' : ''}`}
          />
        )}
      </div>
      <p className="px-4 py-2 text-xs text-gray-400">{ATTRIBUTION}</p>
    </section>
  );
}
