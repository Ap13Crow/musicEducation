import { duplicateGroups, rankForKeeping, recordingParts, samePerson, sameRecording, type RecordingFacts } from '../lib/recordingDuplicates';

let n = 0;
const rec = (overrides: Partial<RecordingFacts>): RecordingFacts => ({
  id: `item${++n}`,
  source: 'INTERNET_ARCHIVE',
  title: 'Ave Maria',
  creator: 'Bach; Gounod',
  date: '1915',
  documentType: '78 rpm record · Edison · Marie Rappold',
  files: [{ durationSeconds: 276 }],
  sha256s: [],
  uses: 0,
  mirrored: false,
  ingestedAt: new Date('2026-10-10T10:00:00Z'),
  ...overrides,
});

describe('duplicate recordings (Ave Maria)', () => {
  it('reads label and performers from the document type', () => {
    expect(recordingParts(rec({ documentType: '78 rpm record · Edison · Marie Rappoli; Albert Spalding' }))).toEqual({ label: 'Edison', performers: ['Marie Rappoli', 'Albert Spalding'] });
    expect(recordingParts(rec({ documentType: '78 rpm record · Edison' }))).toEqual({ label: 'Edison', performers: [] });
    expect(recordingParts(rec({ source: 'EUROPEANA', documentType: 'Sound recording · Ada Benefelde; Verners Taube' }))).toEqual({ label: null, performers: ['Ada Benefelde', 'Verners Taube'] });
  });

  it('matches names despite typos, diacritics and word order', () => {
    expect(samePerson('MARIE RAPPOLD', 'Marie Rappoli')).toBe(true);
    expect(samePerson('Kārkliņa-Olava, Marina', 'Marina Karklina-Olava')).toBe(true);
    expect(samePerson('Mischa Elman', 'Jascha Heifetz')).toBe(false);
  });

  it('one matrix is one recording - two transfers, or two issues on different labels', () => {
    const heifetz = (matrix: string, duration?: number) => rec({ date: '1924', documentType: "78 rpm record · His Master's Voice · Jascha Heifetz", creator: 'Schubert; Wilhelmj', files: [{ matrix, ...(duration ? { durationSeconds: duration } : {}) }] });
    expect(sameRecording(heifetz('2-07980', 279), heifetz('2-07980'))).toBe(true);
    const elman1913 = rec({ date: '1913', documentType: '78 rpm record · Schallplatte "Grammophon" · Mischa Elman', creator: 'Schubert', files: [{ matrix: '07995', durationSeconds: 284 }] });
    const elman1924 = rec({ date: '1924', documentType: "78 rpm record · His Master's Voice · Mischa Elman", creator: 'Schubert', files: [{ matrix: '07995', durationSeconds: 284 }] });
    const elmanTypo = rec({ date: '1924', documentType: "78 rpm record · His Master's Voice · Mischa Elman", creator: 'Schubert', files: [{ matrix: '075995', durationSeconds: 283 }] });
    expect(sameRecording(elman1913, elman1924)).toBe(true);
    expect(sameRecording(elman1924, elmanTypo)).toBe(true);
    expect(duplicateGroups([elman1913, elman1924, elmanTypo])).toHaveLength(1);
  });

  it('keeps different takes of one session apart', () => {
    const takeA = rec({ documentType: '78 rpm record · Edison · Marie Rappoli; Albert Spalding', files: [{ matrix: '3815-A-2-127', durationSeconds: 287 }] });
    const takeC = rec({ files: [{ matrix: '3815-C-13', durationSeconds: 276 }] });
    expect(sameRecording(takeA, takeC)).toBe(false);
  });

  it('without matrix numbers needs the same performers and the same length', () => {
    const lndb = (performers: string, durationSeconds: number | null, title = 'Ave Maria') =>
      rec({ source: 'EUROPEANA', title, date: null, creator: 'Johann Sebastian Bach; Charles Gounod', documentType: `Sound recording${performers ? ` · ${performers}` : ''}`, files: [durationSeconds ? { durationSeconds } : {}] });
    // Marina Kārkliņa-Olava catalogued twice: 162.8 s and 162.1 s.
    expect(sameRecording(lndb('Marina Kārkliņa-Olava', 163), lndb('Marina Kārkliņa-Olava', 162, 'Ave Maria : meditācija'))).toBe(true);
    // Ada Benefelde's two recordings (166 s, and 214 s with Verners Taube).
    expect(sameRecording(lndb('Ada Benefelde', 166), lndb('Ada Benefelde; Verners Taube', 214))).toBe(false);
    // No performer named, or no length: not enough to merge.
    expect(sameRecording(lndb('', 165), lndb('Ada Benefelde', 166))).toBe(false);
    expect(sameRecording(lndb('Ada Benefelde', null), lndb('Ada Benefelde', 166))).toBe(false);
  });

  it('identical stored audio is always the same recording', () => {
    expect(sameRecording(rec({ title: 'Ave Maria', sha256s: ['abc'] }), rec({ title: 'Hail Mary', sha256s: ['abc'] }))).toBe(true);
  });

  it('keeps the copy people use, then the stored one, then the most detailed', () => {
    const plain = rec({ documentType: '78 rpm record · Edison' });
    const stored = rec({ mirrored: true });
    const favourite = rec({ uses: 1 });
    expect(rankForKeeping([plain, stored, favourite])[0]).toBe(favourite);
    expect(rankForKeeping([plain, stored])[0]).toBe(stored);
  });
});
