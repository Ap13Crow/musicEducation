/**
 * Turns whatever a teacher pastes into the YouTube lesson-content field —
 * a watch URL, a youtu.be short link, an embed URL, or a bare video ID —
 * into an embeddable https://www.youtube.com/embed/<id> URL.
 * Returns null when nothing resembling a video ID can be found, so callers
 * can fall back to an error state instead of rendering a broken iframe.
 */
export function toYouTubeEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  // Bare 11-character video ID, no URL at all.
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
