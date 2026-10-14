import { archiveIdentifier, ffmpegArguments, itemSides, masterUrl, RESTORATION_FILTERS, restorationProfile } from '../lib/audioRestoration';

describe('78 rpm restoration', () => {
  it('decodes once and renders the three strengths at the same loudness', () => {
    const args = ffmpegArguments('/tmp/master.flac', { MILD: '/tmp/mild.mp3', MEDIUM: '/tmp/medium.mp3', STRONG: '/tmp/strong.mp3' });
    expect(args.filter((arg) => arg === '-i')).toHaveLength(1);
    const graph = args[args.indexOf('-filter_complex') + 1];
    expect(graph).toContain('asplit=3[s0][s1][s2]');
    expect(graph.match(/loudnorm=I=-18/g)).toHaveLength(3);
    expect(graph).toContain(RESTORATION_FILTERS.HISTORIC.STRONG);
    expect(args.slice(-1)[0]).toBe('/tmp/strong.mp3');
    expect(args.filter((arg) => arg === 'libmp3lame')).toHaveLength(3);
  });

  it('keeps Mild in stereo and sums Medium and Strong to mono', () => {
    expect(RESTORATION_FILTERS.HISTORIC.MILD).not.toContain('pan=mono');
    expect(RESTORATION_FILTERS.HISTORIC.MEDIUM).toContain('pan=mono');
    expect(RESTORATION_FILTERS.HISTORIC.STRONG).toContain('adeclick=t=1.5');
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

  it('keeps modern recordings in stereo, full bandwidth and their own dynamics', () => {
    for (const filter of Object.values(RESTORATION_FILTERS.MODERN)) {
      expect(filter).not.toContain('pan=mono');
      expect(filter).not.toContain('lowpass');
    }
    const args = ffmpegArguments('/tmp/in.mp3', { MILD: '/tmp/m.mp3', MEDIUM: '/tmp/d.mp3', STRONG: '/tmp/s.mp3' }, 'MODERN');
    const graph = args[args.indexOf('-filter_complex') + 1];
    expect(graph).not.toContain('loudnorm');
    expect(graph).toContain(`[s2]${RESTORATION_FILTERS.MODERN.STRONG}[o2]`);
  });

  it('treats 78s, Gallica, Europeana and anything before 1960 as historic', () => {
    expect(restorationProfile({ source: 'INTERNET_ARCHIVE', year: 1975 })).toBe('HISTORIC');
    expect(restorationProfile({ source: 'BNF', year: null })).toBe('HISTORIC');
    expect(restorationProfile({ source: 'EUROPEANA', year: 1968 })).toBe('MODERN');
    expect(restorationProfile({ source: 'MUSOPEN', year: null })).toBe('MODERN');
    expect(restorationProfile({ source: 'UPLOAD', year: 2024 })).toBe('MODERN');
    expect(restorationProfile({ source: 'UPLOAD', year: 1931 })).toBe('HISTORIC');
  });

  it('finds every side: audio files with their stored copy, or Gallica tracks', async () => {
    const prisma = {
      libraryItemMedia: {
        findMany: jest.fn(async () => [
          { kind: 'FILE', position: 1, sha256: 'b' },
          { kind: 'TRACK', position: 7, sha256: 't7' },
          { kind: 'TRACK', position: 3, sha256: 't3' },
        ]),
      },
    } as any;
    const files = [
      { contentType: 'application/pdf', sourceUrl: 'https://archive.org/download/x/a.pdf' },
      { contentType: 'audio/mpeg', sourceUrl: 'https://www.europeana.eu/a.mp3' },
      { contentType: 'audio/mpeg', sourceUrl: 'https://archive.org/download/78_x/b.mp3' },
      { contentType: 'audio/mpeg', sourceUrl: 'https://example.org/unreachable.mp3' },
    ];
    expect(await itemSides(prisma, { id: 'i', source: 'EUROPEANA', year: null, files })).toEqual([
      { position: 1, sourceUrl: null, storedSha256: 'b', flacMaster: false },
      { position: 2, sourceUrl: 'https://archive.org/download/78_x/b.mp3', storedSha256: null, flacMaster: false },
    ]);
    expect((await itemSides(prisma, { id: 'i', source: 'INTERNET_ARCHIVE', year: null, files }))[1].flacMaster).toBe(true);
    expect(await itemSides(prisma, { id: 'i', source: 'BNF', year: null, files: null })).toEqual([
      { position: 3, sourceUrl: null, storedSha256: 't3' },
      { position: 7, sourceUrl: null, storedSha256: 't7' },
    ]);
  });
});
