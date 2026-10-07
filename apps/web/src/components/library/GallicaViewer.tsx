'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { GallicaEmbed } from './GallicaEmbed';

interface GallicaPage {
  pageNumber: number;
  label: string | null;
  imageUrl: string;
  audioUrl: string | null;
}

const ATTRIBUTION = 'Source: gallica.bnf.fr / Bibliothèque nationale de France';
// null = fit to the viewer's width; otherwise % of the 1600 px scan.
const ZOOM_STEPS = [null, 50, 75, 100, 125, 150, 200] as const;
type Zoom = (typeof ZOOM_STEPS)[number];

// Our own viewer for Gallica scans (sheet music, books) and recordings,
// served through our cached /api/library routes. One page or track at a
// time on purpose - every uncached page is an upstream Gallica request and
// Gallica rate-limits bursts; only the next page is prefetched. When our
// route can't reach Gallica, falls back to Gallica's own embed player.
export function GallicaViewer({
  pagesUrl,
  title,
  audio,
  fallbackEmbedUrl,
}: {
  pagesUrl: string;
  title: string;
  audio: boolean;
  fallbackEmbedUrl?: string | null;
}) {
  const [pages, setPages] = useState<GallicaPage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);

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

  if (failed) {
    return fallbackEmbedUrl ? (
      <GallicaEmbed url={fallbackEmbedUrl} title={title} audio={audio} />
    ) : (
      <p className="card px-4 py-10 text-center text-sm text-red-700">Gallica is temporarily unavailable. Try again shortly.</p>
    );
  }
  if (!pages) return <p className="card px-4 py-10 text-center text-sm text-gray-500">Loading from Gallica…</p>;
  if (pages.length === 0) {
    return <p className="card px-4 py-10 text-center text-sm text-gray-600">Gallica has no viewable pages for this item.</p>;
  }

  const tracks = pages.filter((page) => page.audioUrl);
  if (tracks.length > 0) {
    return (
      <AudioPlayer
        tracks={tracks.map((track, position) => ({ title: track.label ?? `Track ${position + 1}`, url: track.audioUrl! }))}
        attribution={ATTRIBUTION}
      />
    );
  }

  return <PageViewer pages={pages} title={title} index={index} setIndex={setIndex} />;
}

function PageViewer({
  pages,
  title,
  index,
  setIndex,
}: {
  pages: GallicaPage[];
  title: string;
  index: number;
  setIndex: (index: number) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState<Zoom>(null);
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [fullscreen, setFullscreen] = useState(false);
  const [jump, setJump] = useState('');
  const page = pages[index];

  const go = useCallback((next: number) => setIndex(Math.max(0, Math.min(pages.length - 1, next))), [pages.length, setIndex]);

  useEffect(() => setImageState('loading'), [page.imageUrl]);

  // Warm our server cache for the next page once this one is shown.
  useEffect(() => {
    const next = pages[index + 1];
    if (imageState === 'ready' && next) new Image().src = next.imageUrl;
  }, [imageState, index, pages]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      if (!sectionRef.current?.contains(document.activeElement) && document.fullscreenElement !== sectionRef.current) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') go(index + 1);
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') go(index - 1);
      else return;
      event.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === sectionRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void sectionRef.current?.requestFullscreen?.();
  }

  const zoomPosition = ZOOM_STEPS.indexOf(zoom);
  const imageStyle = zoom === null ? { width: '100%', maxWidth: '1600px' } : { width: `${(1600 * zoom) / 100}px`, maxWidth: 'none' };
  const button = 'rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40';

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      className={`card flex flex-col p-0 outline-none ${fullscreen ? 'h-screen rounded-none bg-white' : ''}`}
      aria-label={`Scan: ${title}`}
      data-testid="gallica-viewer"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous page" className={button}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const target = Number(jump);
              if (Number.isInteger(target)) go(target - 1);
              setJump('');
            }}
            className="flex items-center gap-1 text-xs tabular-nums text-gray-500"
          >
            <input
              value={jump}
              onChange={(event) => setJump(event.target.value.replace(/\D/g, ''))}
              placeholder={String(index + 1)}
              aria-label="Go to page"
              inputMode="numeric"
              className="w-10 rounded-md border border-gray-300 px-1 py-0.5 text-center text-xs"
            />
            / {pages.length}
          </form>
          <button type="button" onClick={() => go(index + 1)} disabled={index >= pages.length - 1} aria-label="Next page" className={button}>
            <ChevronRight className="h-4 w-4" />
          </button>
          {page.label && <span className="ml-1 hidden text-xs text-gray-400 sm:inline">{page.label}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom(ZOOM_STEPS[zoomPosition - 1])} disabled={zoomPosition <= 0} aria-label="Zoom out" className={button}>
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(null)}
            className={`w-14 rounded-md py-1 text-xs tabular-nums ${zoom === null ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {zoom === null ? 'Fit' : `${zoom}%`}
          </button>
          <button
            type="button"
            onClick={() => setZoom(ZOOM_STEPS[zoomPosition + 1])}
            disabled={zoomPosition >= ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
            className={button}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'} className={button}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className={`overflow-auto bg-gray-50 p-2 ${fullscreen ? 'flex-1' : 'max-h-[80vh] min-h-[24rem]'}`}>
        {imageState === 'error' ? (
          <p className="py-16 text-center text-sm text-red-700">This page couldn&rsquo;t be loaded from Gallica. Try again shortly.</p>
        ) : (
          <img
            key={page.imageUrl}
            src={page.imageUrl}
            alt={`${title}, page ${index + 1}`}
            onLoad={() => setImageState('ready')}
            onError={() => setImageState('error')}
            onClick={() => sectionRef.current?.focus()}
            style={imageStyle}
            className={`mx-auto block shadow-sm ${imageState === 'loading' ? 'opacity-40' : ''}`}
          />
        )}
      </div>
      <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
        {ATTRIBUTION} · ← → to turn pages
      </p>
    </section>
  );
}
