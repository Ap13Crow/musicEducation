'use client';

import { ExternalLink } from 'lucide-react';

// Inline PDF score (OpenScore quartets, Mutopia) in the browser's own PDF
// viewer. Phones - iOS Safari especially - render an embedded PDF as a
// single static page, so on small screens this shows a clear "open" button
// instead of a cramped frame.
export function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <section className="card overflow-hidden p-0" data-testid="pdf-viewer">
      <iframe src={`${url}#view=FitH`} title={`${title} - score`} className="hidden h-[80vh] min-h-[32rem] w-full border-0 md:block" />
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 md:border-t">
        <p className="text-sm text-gray-600 md:hidden">Score (PDF)</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Open score <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
