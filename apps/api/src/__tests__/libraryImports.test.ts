// Background imports of open Library sources - status bookkeeping in
// AdminSetting, conflict on a live run, failure recorded.

jest.mock('../lib/openscore', () => ({ ingestOpenScoreCorpus: jest.fn() }));
jest.mock('../lib/openSources', () => ({ fetchMusopenRecords: jest.fn(), fetchMutopiaRecords: jest.fn(), upsertOpenSourceRecords: jest.fn() }));
jest.mock('../utils/logger', () => ({ logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() } }));

import { fetchMusopenRecords, upsertOpenSourceRecords } from '../lib/openSources';
import { getLibraryImportStatus, startLibraryImport } from '../lib/libraryImports';

function fakeSettingsPrisma() {
  const rows = new Map<string, string>();
  return {
    rows,
    adminSetting: {
      findUnique: jest.fn(async ({ where }: any) => (rows.has(where.key) ? { key: where.key, value: rows.get(where.key) } : null)),
      upsert: jest.fn(async ({ where, create, update }: any) => {
        rows.set(where.key, rows.has(where.key) ? update.value : create.value);
      }),
    },
  } as any;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('startLibraryImport', () => {
  afterEach(() => jest.resetAllMocks());

  it('reports idle before any run', async () => {
    await expect(getLibraryImportStatus(fakeSettingsPrisma(), 'MUSOPEN')).resolves.toMatchObject({ state: 'idle', done: 0 });
  });

  it('runs in the background, records completion, and refuses a second concurrent start', async () => {
    let finish!: (records: any[]) => void;
    (fetchMusopenRecords as jest.Mock).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    (upsertOpenSourceRecords as jest.Mock).mockResolvedValue(2);
    const prisma = fakeSettingsPrisma();

    await expect(startLibraryImport(prisma, 'MUSOPEN')).resolves.toMatchObject({ state: 'running' });
    await expect(startLibraryImport(prisma, 'MUSOPEN')).resolves.toBeNull();

    finish([{ files: [{}, {}] }, { files: [{}] }]);
    await flush();
    await flush();
    await expect(getLibraryImportStatus(prisma, 'MUSOPEN')).resolves.toMatchObject({ state: 'done', total: 2, upserted: 2 });
    expect((await getLibraryImportStatus(prisma, 'MUSOPEN')).message).toContain('3 tracks');
  });

  it('records a failure so the admin sees why', async () => {
    (fetchMusopenRecords as jest.Mock).mockRejectedValue(new Error('archive.org down'));
    const prisma = fakeSettingsPrisma();
    await startLibraryImport(prisma, 'MUSOPEN');
    await flush();
    await flush();
    await expect(getLibraryImportStatus(prisma, 'MUSOPEN')).resolves.toMatchObject({ state: 'failed', message: 'archive.org down' });
  });
});
