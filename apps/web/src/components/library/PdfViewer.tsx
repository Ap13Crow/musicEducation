'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Minus, Plus } from 'lucide-react';

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

// PDF scores (OpenScore quartets, Mutopia, DNB) rendered with pdf.js - the
// same on every device (iOS Safari shows only page 1 of an embedded PDF),
// and it knows which pages the reader has actually seen, for library XP.
// Pages are drawn only as they approach the viewport.
export function PdfViewer({
  url,
  title,
  onProgress,
}: {
  url: string;
  title: string;
  onProgress?: (update: { progress: number; length: number }) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [aspect, setAspect] = useState(1.414);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [zoomIndex, setZoomIndex] = useState(1);
  const furthest = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    furthest.current = 0;
    (async () => {
      try {
        // pdf.js touches browser globals on import - load it here only.
        const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
        // Served as a static file (scripts/copy-pdf-worker.mjs), not bundled.
        pdfjs.GlobalWorkerOptions.workerSrc = `/_next/static/pdfjs/pdf.worker-${pdfjs.version}.min.mjs`;
        // isEvalSupported: false - no font code is ever eval'd.
        const doc = await pdfjs.getDocument({ url, isEvalSupported: false }).promise;
        if (cancelled) return void doc.destroy();
        const first = await doc.getPage(1);
        const viewport = first.getViewport({ scale: 1 });
        docRef.current = doc;
        setAspect(viewport.height / viewport.width);
        setPageCount(doc.numPages);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      docRef.current?.destroy();
      docRef.current = null;
    };
  }, [url]);

  // Draw pages as they come near, and record the furthest one seen.
  useEffect(() => {
    if (status !== 'ready' || !scrollRef.current) return;
    const drawn = new Set<number>();

    async function drawPage(holder: HTMLDivElement, pageNumber: number) {
      const doc = docRef.current;
      if (!doc) return;
      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const ratio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: (holder.clientWidth / base.width) * ratio });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.className = 'block h-auto w-full';
      canvas.setAttribute('aria-label', `${title} - page ${pageNumber}`);
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      holder.replaceChildren(canvas);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const holder = entry.target as HTMLDivElement;
          const pageNumber = Number(holder.dataset.page);
          if (entry.isIntersecting && !drawn.has(pageNumber)) {
            drawn.add(pageNumber);
            void drawPage(holder, pageNumber);
          }
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && pageNumber > furthest.current) {
            furthest.current = pageNumber;
            onProgress?.({ progress: pageNumber / pageCount, length: pageCount });
          }
        }
      },
      { root: scrollRef.current, rootMargin: '600px 0px', threshold: [0, 0.5] },
    );
    scrollRef.current.querySelectorAll('[data-page]').forEach((holder) => observer.observe(holder));
    return () => observer.disconnect();
  }, [status, pageCount, zoomIndex, onProgress, title]);

  const zoom = ZOOMS[zoomIndex];
  return (
    <section className="card overflow-hidden p-0" data-testid="pdf-viewer" aria-label={`Score: ${title}`}>
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomIndex((value) => Math.max(0, value - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-gray-500">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomIndex((value) => Math.min(ZOOMS.length - 1, value + 1))}
            disabled={zoomIndex === ZOOMS.length - 1}
            aria-label="Zoom in"
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
          {pageCount > 0 && <span className="ml-2 text-xs text-gray-500">{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>}
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-800">
          Open PDF <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      {status === 'loading' && <p className="px-4 py-10 text-center text-sm text-gray-500">Loading score…</p>}
      {status === 'error' && (
        <p className="px-4 py-10 text-center text-sm text-red-700">
          This score couldn&rsquo;t be displayed here.{' '}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
            Open the PDF
          </a>{' '}
          instead.
        </p>
      )}
      {status === 'ready' && (
        <div ref={scrollRef} className="max-h-[85vh] overflow-auto bg-gray-100 p-2 sm:p-4">
          <div key={zoomIndex} className="mx-auto space-y-3" style={{ width: `${zoom * 100}%`, maxWidth: zoom <= 1 ? '56rem' : undefined }}>
            {Array.from({ length: pageCount }, (_, index) => (
              <div key={index} data-page={index + 1} className="w-full bg-white shadow-sm" style={{ aspectRatio: `1 / ${aspect}` }} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
