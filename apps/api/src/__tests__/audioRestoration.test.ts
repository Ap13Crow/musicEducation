import { archiveIdentifier, ffmpegArguments, masterUrl, RESTORATION_FILTERS } from '../lib/audioRestoration';

describe('78 rpm restoration', () => {
  it('decodes once and renders the three strengths at the same loudness', () => {
    const args = ffmpegArguments('/tmp/master.flac', { MILD: '/tmp/mild.mp3', MEDIUM: '/tmp/medium.mp3', STRONG: '/tmp/strong.mp3' });
    expect(args.filter((arg) => arg === '-i')).toHaveLength(1);
    const graph = args[args.indexOf('-filter_complex') + 1];
    expect(graph).toContain('asplit=3[s0][s1][s2]');
    expect(graph.match(/loudnorm=I=-18/g)).toHaveLength(3);
    expect(graph).toContain(RESTORATION_FILTERS.STRONG);
    expect(args.slice(-1)[0]).toBe('/tmp/strong.mp3');
    expect(args.filter((arg) => arg === 'libmp3lame')).toHaveLength(3);
  });

  it('keeps Mild in stereo and sums Medium and Strong to mono', () => {
    expect(RESTORATION_FILTERS.MILD).not.toContain('pan=mono');
    expect(RESTORATION_FILTERS.MEDIUM).toContain('pan=mono');
    expect(RESTORATION_FILTERS.STRONG).toContain('adeclick=t=1.5');
  });

  it('reads the Internet Archive identifier from a download URL', () => {
    expect(archiveIdentifier('https://archive.org/download/78_quartet-in-d_gbia0504542b/QUARTET%20IN%20D.mp3')).toBe('78_quartet-in-d_gbia0504542b');
    expect(archiveIdentifier('https://example.org/a.mp3')).toBeNull();
  });

  it('prefers the original FLAC master and falls back to the MP3', async () => {
    const mp3 = 'https://archive.org/download/78_x_gbia1/Side%20A.mp3';
    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [
        { name: 'Side A.mp3', format: 'VBR MP3', source: 'derivative' },
        { name: 'Side A.flac', format: '24bit Flac', source: 'original' },
      ] }),
    } as any);
    expect(await masterUrl(mp3)).toBe('https://archive.org/download/78_x_gbia1/Side%20A.flac');
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ name: 'Side A.mp3', format: 'VBR MP3' }] }) } as any);
    expect(await masterUrl(mp3)).toBe(mp3);
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect(await masterUrl(mp3)).toBe(mp3);
    fetchMock.mockRestore();
  });
});
