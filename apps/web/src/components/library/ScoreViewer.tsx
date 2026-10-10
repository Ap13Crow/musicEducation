'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Minus, Plus } from 'lucide-react';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

// Renders a MusicXML (.xml or compressed .mxl) score as engraved notation
// with OpenSheetMusicDisplay. OSMD touches window/document on import, so it's
// loaded inside the effect, never during server rendering.
export function ScoreViewer({
  url,
  title,
  onProgress,
}: {
  url: string;
  title: string;
  // How far down the engraved score the reader has scrolled, for library XP.
  onProgress?: (update: { progress: number; length: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const [{ OpenSheetMusicDisplay }, response] = await Promise.all([import('opensheetmusicdisplay'), fetch(url)]);
        if (!response.ok) throw new Error(`Score request failed (${response.status})`);
        const blob = await response.blob();
        if (cancelled || !containerRef.current) return;
        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',
          drawTitle: true,
          drawComposer: true,
          drawPartNames: true,
        });
        await osmd.load(blob, title);
        if (cancelled) return;
        osmd.zoom = 1;
        osmd.render();
        osmdRef.current = osmd;
        setZoom(1);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      osmdRef.current?.clear();
      osmdRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [url, title]);

  // Progress = how much of the score has passed the bottom of the screen;
  // length = the score's height in A4-proportioned pages.
  useEffect(() => {
    if (status !== 'ready' || !onProgress) return;
    const measure = () => {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box || box.height <= 0) return;
      const seen = (window.innerHeight - box.top) / box.height;
      const pages = Math.max(1, Math.round(box.height / (box.width * 1.414)));
      onProgress({ progress: Math.min(1, Math.max(0, seen)), length: pages });
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [status, zoom, onProgress]);

  function changeZoom(delta: number) {
    const osmd = osmdRef.current;
    if (!osmd) return;
    const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta)) * 10) / 10;
    osmd.zoom = next;
    osmd.render();
    setZoom(next);
  }

  return (
    <section className="card p-0" aria-label={`Score: ${title}`} data-testid="score-viewer">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={status !== 'ready' || zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-gray-500">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={status !== 'ready' || zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <a href={url} download className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-800">
          <Download className="h-4 w-4" /> MusicXML
        </a>
      </div>
      {status === 'loading' && <p className="px-4 py-10 text-center text-sm text-gray-500">Engraving score…</p>}
      {status === 'error' && (
        <p className="px-4 py-10 text-center text-sm text-red-700">This score couldn&rsquo;t be displayed. Try again shortly.</p>
      )}
      <div ref={containerRef} className="overflow-x-auto px-2 pb-4" />
    </section>
  );
}
