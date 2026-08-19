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
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.pathname.startsWith('/embed/')) {
        return url.toString();
      }
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidYouTubeUrl(input: string | null | undefined): boolean {
  return toYouTubeEmbedUrl(input) !== null;
}
