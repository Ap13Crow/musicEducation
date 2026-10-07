'use client';

// Gallica's own embeddable player - the iframe BnF offers under "share >
// embed" on every document. Scores/books get page navigation, recordings a
// player with track navigation, and BnF's credit is built in.
export function GallicaEmbed({ url, title, audio }: { url: string; title: string; audio: boolean }) {
  return (
    <section className="card overflow-hidden p-0" data-testid="gallica-embed">
      <iframe
        src={url}
        title={`${title} - Gallica`}
        loading="lazy"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        className={`block w-full border-0 ${audio ? 'h-36' : 'h-[75vh] min-h-[32rem]'}`}
      />
    </section>
  );
}
