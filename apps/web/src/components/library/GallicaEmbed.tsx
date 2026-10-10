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
        // web-share/clipboard-write: the player's own share button calls the
        // native share sheet (iOS) or copies a link - both throw inside a
        // cross-origin frame unless delegated here. Popups (e.g. "open on
        // Gallica") must escape the sandbox or the opened page breaks.
        allow="autoplay; fullscreen; web-share; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
        className={`block w-full border-0 ${audio ? 'h-36' : 'h-[75vh] min-h-[32rem]'}`}
      />
    </section>
  );
}
