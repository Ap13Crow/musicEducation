import type { PrismaClient } from '@my-music-coach/database';
import { refreshArchiveFiles } from './archive78.js';
import { europeanaPeopleFromRecord, fetchEuropeanaDetails } from './europeana.js';

// Back-fills what the duplicate check (lib/recordingDuplicates.ts) needs on
// recordings imported before it existed: performers and lengths for
// Europeana records, matrix numbers and lengths for Internet Archive 78s.
// New imports carry them already. Without `apply` nothing is written.

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function refreshRecordingDetails(
  prisma: PrismaClient,
  options: { source: 'EUROPEANA' | 'INTERNET_ARCHIVE'; apply: boolean; limit?: number; onProgress?: (done: number, total: number) => void },
): Promise<{ checked: number; changed: number; samples: string[] }> {
  const items = await prisma.libraryItem.findMany({
    where: { source: options.source as any, category: 'AUDIO_RECORDING', hiddenAt: null },
    select: { id: true, ark: true, creator: true, documentType: true, files: true },
    orderBy: { ingestedAt: 'asc' },
    ...(options.limit ? { take: options.limit } : {}),
  });
  let changed = 0;
  const samples: string[] = [];
  for (const [index, item] of items.entries()) {
    const files: any[] = Array.isArray(item.files) ? (item.files as any[]) : [];
    let data: Record<string, unknown> | null = null;
    if (options.source === 'INTERNET_ARCHIVE') {
      if (files.length && files.every((file) => file?.durationSeconds && file?.matrix)) continue;
      const next = await refreshArchiveFiles(files);
      if (next) data = { files: next };
    } else {
      const details = await fetchEuropeanaDetails(item.ark, files[0]?.sourceUrl);
      await sleep(150);
      if (details) {
        const { composers, performers } = europeanaPeopleFromRecord(details.record);
        const creator = composers.length ? composers.join('; ') : item.creator;
        const documentType = `Sound recording${performers.length ? ` · ${performers.join('; ')}` : ''}`;
        const nextFiles = files.map((file, position) => (position === 0 && details.durationSeconds && !file.durationSeconds ? { ...file, durationSeconds: details.durationSeconds } : file));
        if (creator !== item.creator || documentType !== item.documentType || JSON.stringify(nextFiles) !== JSON.stringify(files)) {
          data = { creator, documentType, files: nextFiles };
        }
      }
    }
    if (data) {
      changed += 1;
      if (samples.length < 15) samples.push(`${item.id} ${JSON.stringify(data).slice(0, 240)}`);
      if (options.apply) await prisma.libraryItem.update({ where: { id: item.id }, data: data as any });
    }
    options.onProgress?.(index + 1, items.length);
  }
  return { checked: items.length, changed, samples };
}
