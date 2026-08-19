import { isValidYouTubeUrl, toYouTubeEmbedUrl } from '../lib/youtube.js';

describe('toYouTubeEmbedUrl / isValidYouTubeUrl', () => {
  it('accepts a bare 11-character video id', () => {
    expect(toYouTubeEmbedUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(isValidYouTubeUrl('dQw4w9WgXcQ')).toBe(true);
  });

  it('accepts a watch URL', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('accepts a youtu.be short link', () => {
    expect(toYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('accepts a shorts link', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('accepts an embed URL and re-derives it from the id (drops any extra query params)', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ?start=30')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('rejects a non-YouTube URL', () => {
    expect(toYouTubeEmbedUrl('https://vimeo.com/12345')).toBeNull();
    expect(isValidYouTubeUrl('https://vimeo.com/12345')).toBe(false);
  });

  it('rejects lookalike hostnames that merely end with "youtube.com"', () => {
    // A naive `hostname.endsWith('youtube.com')` check would wrongly accept
    // all of these and let them be embedded as if they were trusted.
    expect(toYouTubeEmbedUrl('https://evilyoutube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(toYouTubeEmbedUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(toYouTubeEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
  });

  it('accepts a real youtube.com subdomain', () => {
    expect(toYouTubeEmbedUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('rejects a video id that is not exactly 11 characters', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/watch?v=short')).toBeNull();
    expect(toYouTubeEmbedUrl('https://youtu.be/toolongvideoid123')).toBeNull();
  });

  it('rejects garbage input', () => {
    expect(toYouTubeEmbedUrl('not a url at all')).toBeNull();
    expect(isValidYouTubeUrl('')).toBe(false);
    expect(isValidYouTubeUrl(null)).toBe(false);
    expect(isValidYouTubeUrl(undefined)).toBe(false);
  });
});
