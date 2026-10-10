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

// Gallica (behind Cloudflare) sometimes blocks our server's IP outright
// (HTTP 403 on every request) while visitors' browsers are served normally.
// Then the browser reads the IIIF manifest itself - IIIF manifests are served
// with open CORS - and plays/shows Gallica's files directly, the same way
// Gallica's own embed would, so our player and page viewer stay in use.
const CANVAS_PAGE_PATTERN = /\/canvas\/f(\d+)$/i;

async function loadPagesFromGallica(ark: string, audio: boolean): Promise<GallicaPage[]> {
  const response = await fetch(`https://gallica.bnf.fr/iiif/ark:/12148/${encodeURIComponent(ark)}/manifest.json`);
  if (!response.ok) throw new Error(String(response.status));
  const manifest = await response.json();
  const canvases: any[] = manifest?.sequences?.[0]?.canvases ?? [];
  return canvases.flatMap((canvas, index) => {
    const pageNumber = Number(canvas?.['@id']?.match(CANVAS_PAGE_PATTERN)?.[1]) || index + 1;
    const imageUrl: string | undefined = canvas?.images?.[0]?.resource?.['@id'];
    if (!imageUrl) return [];
    return [{
      pageNumber,
      label: canvas?.label && canvas.label !== 'null' ? String(canvas.label) : null,
      // BnF caps IIIF images wider than 1000 px at 5 calls/minute per IP
      // (api.bnf.fr) - 1000 px keeps quick page turning under that cap.
      imageUrl: imageUrl.replace('/full/full/', '/full/1000,/'),
      audioUrl: audio ? `https://gallica.bnf.fr/ark:/12148/${ark}/f${pageNumber}.audio` : null,
    }];
  });
}

// Our own viewer for Gallica scans (sheet music, books) and recordings,
// served through our cached /api/library routes. One page or track at a
// time on purpose - every uncached page is an upstream Gallica request and
// Gallica rate-limits bursts; only the next page is prefetched. When our
// route can't reach Gallica, the browser loads Gallica directly (above);
// Gallica's own embed player is the last resort.
export function GallicaViewer({
  pagesUrl,
  ark,
  title,
  audio,
  fallbackEmbedUrl,
  onProgress,
}: {
  pagesUrl?: string | null;
  ark?: string | null;
  title: string;
  audio: boolean;
  fallbackEmbedUrl?: string | null;
  // Furthest page / playback position, for library XP.
  onProgress?: (update: { progress: number; length: number; playing?: boolean }) => void;
}) {
  const [pages, setPages] = useState<GallicaPage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPages(null);
    setFailed(false);
    setIndex(0);
    (pagesUrl ? fetch(pagesUrl) : Promise.reject(new Error('no pagesUrl')))
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => data.pages ?? [])
      .catch(() => (ark ? loadPagesFromGallica(ark, audio) : Promise.reject(new Error('no ark'))))
      .then((loaded: GallicaPage[]) => !cancelled && setPages(loaded))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [pagesUrl, ark, audio]);

  if (failed) {
    return fallbackEmbedUrl ? (
      <GallicaEmbed url={fallbackEmbedUrl} title={title} audio={audio} />
    ) : (
      <p className="card px-4 py-10 text-center text-sm text-gray-700">
        Gallica isn&rsquo;t answering right now (it limits how many requests it accepts).{' '}
        {ark && (
          <a href={`https://gallica.bnf.fr/ark:/12148/${ark}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 underline">
            Open it on gallica.bnf.fr
          </a>
        )}
      </p>
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
        onProgress={onProgress}
      />
    );
  }

  return <PageViewer pages={pages} title={title} index={index} setIndex={setIndex} onProgress={onProgress} />;
}

function PageViewer({
  pages,
  title,
  index,
  setIndex,
  onProgress,
}: {
  pages: GallicaPage[];
  title: string;
  index: number;
  setIndex: (index: number) => void;
  onProgress?: (update: { progress: number; length: number }) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState<Zoom>(null);
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [fullscreen, setFullscreen] = useState(false);
  const [jump, setJump] = useState('');
  const page = pages[index];

  const go = useCallback((next: number) => setIndex(Math.max(0, Math.min(pages.length - 1, next))), [pages.length, setIndex]);

  useEffect(() => setImageState('loading'), [page.imageUrl]);

  // A page counts as read once its image is actually shown.
  useEffect(() => {
    if (imageState === 'ready') onProgress?.({ progress: (index + 1) / pages.length, length: pages.length });
  }, [imageState, index, pages.length, onProgress]);

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
