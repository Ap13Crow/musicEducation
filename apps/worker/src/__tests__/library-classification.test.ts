import { classifyLibraryRows, parseLibraryTags } from '../jobs/library-classification';
import { aiChat } from '../lib/ai';

jest.mock('../lib/ai', () => ({ aiChat: jest.fn(), aiConfigured: () => true }));

describe('parseLibraryTags', () => {
  it('keeps vocabulary values and drops the rest', () => {
    const reply = '```json\n[{"instruments":["Piano","Kazoo","Piano"],"musicStyles":["Romantic","Dubstep"],"skillLevels":["ADVANCED","EXPERT"]}]\n```';
    expect(parseLibraryTags(reply, 1)).toEqual([{ instruments: ['Piano'], musicStyles: ['Romantic'], skillLevels: ['ADVANCED'] }]);
  });

  it('accepts a missing skillLevels key', () => {
    expect(parseLibraryTags('[{"instruments":[],"musicStyles":[]}]', 1)).toEqual([{ instruments: [], musicStyles: [], skillLevels: [] }]);
  });

  it('rejects replies that are not one object per item', () => {
    expect(parseLibraryTags('[{"instruments":[],"musicStyles":[]}]', 2)).toBeNull();
    expect(parseLibraryTags('not json', 1)).toBeNull();
    expect(parseLibraryTags('[{"instruments":"Piano","musicStyles":[]}]', 1)).toBeNull();
  });
});

describe('classifyLibraryRows', () => {
  const row = (id: string) => ({ id, title: 'Nocturne', creator: 'Chopin', date: '1835', category: 'SHEET_MUSIC', documentType: null, description: null });

  it('writes tags and leaves a failed batch for the next run', async () => {
    (aiChat as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(Array.from({ length: 10 }, () => ({ instruments: ['Piano'], musicStyles: ['Romantic'], skillLevels: [] }))))
      .mockResolvedValueOnce(null);
    const update = jest.fn(async () => ({}));
    const prisma = { libraryItem: { update } } as any;
    const rows = Array.from({ length: 12 }, (_, index) => row(`i${index}`));
    expect(await classifyLibraryRows(prisma, rows)).toEqual({ classified: 10, failed: 2 });
    expect(update).toHaveBeenCalledTimes(10);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'i0' },
      data: expect.objectContaining({ instruments: ['Piano'], musicStyles: ['Romantic'], skillLevels: [], classifiedAt: expect.any(Date) }),
    });
  });
});
