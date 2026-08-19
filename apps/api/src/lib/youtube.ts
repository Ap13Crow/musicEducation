// Server-side copy of apps/web/src/lib/youtube.ts's toYouTubeEmbedUrl -
// kept in sync deliberately rather than shared, same pattern as
// apps/worker/src/lib/ai.ts mirroring apps/api/src/lib/ai.ts. Used to
// validate a teacher application's required presentation-video link
// without storing an arbitrary/unplayable URL.
export function toYouTubeEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  if (/^[\w-]{11}$/.test(value)) {
    return `https://www.youtube.com/embed/${value}`;
  }

  try {
    const url = new URL(value);
    // Exact host or a real subdomain only - `endsWith('youtube.com')` would
    // also match a lookalike like evilyoutube.com, which would then get
    // persisted as a "verified" presentation video and later embedded.
    const isYouTubeHost = url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com');
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return isVideoId(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (isYouTubeHost) {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return isVideoId(id) ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.slice('/embed/'.length);
        return isVideoId(id) ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2];
        return isVideoId(id) ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isVideoId(id: string | null | undefined): id is string {
  return typeof id === 'string' && /^[\w-]{11}$/.test(id);
}

export function isValidYouTubeUrl(input: string | null | undefined): boolean {
  return toYouTubeEmbedUrl(input) !== null;
}
