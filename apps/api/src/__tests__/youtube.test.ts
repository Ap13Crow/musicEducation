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

  it('rejects a non-YouTube URL', () => {
    expect(toYouTubeEmbedUrl('https://vimeo.com/12345')).toBeNull();
    expect(isValidYouTubeUrl('https://vimeo.com/12345')).toBe(false);
  });

  it('rejects garbage input', () => {
    expect(toYouTubeEmbedUrl('not a url at all')).toBeNull();
    expect(isValidYouTubeUrl('')).toBe(false);
    expect(isValidYouTubeUrl(null)).toBe(false);
    expect(isValidYouTubeUrl(undefined)).toBe(false);
  });
});
