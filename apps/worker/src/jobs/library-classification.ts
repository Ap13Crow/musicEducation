import type { PrismaClient } from '@my-music-coach/database';
import { aiChat, aiConfigured } from '../lib/ai.js';
import { INSTRUMENT_VOCAB, SKILL_LEVEL_VOCAB, STYLE_VOCAB } from './event-classification.js';
import type { Job } from './types.js';

// Tags Library items (scores, recordings, books) with the same vocabulary as
// profiles, courses and events, so recommendations and the Library's
// instrument/style filters can match them (apps/api/src/lib/
// libraryRecommendations.ts). Same shape as event-classification: one AI
// call per batch, bounded rows per run, a failed batch is retried next run.

const BATCH_SIZE = 10;
// ~3,800 items at first; 300 per half-hour run catches up in an afternoon,
// and new imports are tagged within 30 minutes.
const MAX_ROWS_PER_RUN = 300;

export interface LibraryTags {
  instruments: string[];
  musicStyles: string[];
  skillLevels: string[];
}

type Row = {
  id: string;
  title: string;
  creator: string | null;
  date: string | null;
  category: string;
  documentType: string | null;
  description: string | null;
};

function systemPrompt(): string {
  return [
    'You tag items of a music library (sheet music, recordings, books about music) for a music-education platform.',
    `instruments: the instruments the work is written for or a book is about, from exactly this list: ${INSTRUMENT_VOCAB.join(', ')}. Songs and choral works include Voice; a piano accompaniment includes Piano.`,
    `musicStyles: zero or more from exactly this list: ${STYLE_VOCAB.join(', ')}. You may infer the period from a well-known composer and the date (e.g. Bach -> Baroque, Chopin -> Romantic).`,
    `skillLevels: at most two learner levels the item suits, from exactly this list: ${SKILL_LEVEL_VOCAB.join(', ')}. A method or tutor for beginners is BEGINNER; virtuoso concert works are ADVANCED or PROFESSIONAL; leave empty for recordings or when unsure.`,
    'Only tag on a reasonably confident signal from the title, composer, type or description; prefer empty arrays to guessing.',
    'Respond with ONLY a JSON array, no prose, no markdown fences, one object per item in the exact input order, shape: {"instruments":string[],"musicStyles":string[],"skillLevels":string[]}.',
  ].join('\n');
}

const keep = (values: unknown, vocabulary: string[], max: number) =>
  Array.isArray(values) ? [...new Set(values.filter((value): value is string => typeof value === 'string' && vocabulary.includes(value)))].slice(0, max) : null;

// Out-of-vocabulary values are dropped; a reply that isn't one object per
// item, in order, is rejected as a whole.
export function parseLibraryTags(reply: string, expected: number): LibraryTags[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(reply.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, ''));
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length !== expected) return null;
  const tags: LibraryTags[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') return null;
    const value = entry as Record<string, unknown>;
    const instruments = keep(value.instruments, INSTRUMENT_VOCAB, 6);
    const musicStyles = keep(value.musicStyles, STYLE_VOCAB, 4);
    const skillLevels = keep(value.skillLevels ?? [], SKILL_LEVEL_VOCAB, 2);
    if (!instruments || !musicStyles || !skillLevels) return null;
    tags.push({ instruments, musicStyles, skillLevels });
  }
  return tags;
}

const CATEGORY_NAMES: Record<string, string> = { SHEET_MUSIC: 'sheet music', AUDIO_RECORDING: 'recording', BOOK: 'book', OTHER: 'other' };

async function classifyBatch(rows: Row[]): Promise<LibraryTags[] | null> {
  const message = JSON.stringify(
    rows.map((row, index) => ({
      index,
      title: row.title.slice(0, 300),
      composerOrAuthor: row.creator,
      date: row.date,
      kind: CATEGORY_NAMES[row.category] ?? row.category,
      documentType: row.documentType,
      description: row.description?.slice(0, 400) ?? null,
    })),
  );
  const reply = await aiChat(systemPrompt(), message);
  return reply ? parseLibraryTags(reply, rows.length) : null;
}

export async function classifyLibraryRows(prisma: PrismaClient, rows: Row[]) {
  let classified = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const tags = await classifyBatch(batch);
    if (!tags) {
      failed += batch.length;
      continue;
    }
    await Promise.all(
      batch.map((row, index) =>
        prisma.libraryItem.update({ where: { id: row.id }, data: { ...tags[index], classifiedAt: new Date() } }),
      ),
    );
    classified += batch.length;
  }
  return { classified, failed };
}

export const libraryClassificationJob: Job = {
  key: 'library-classification',
  schedule: '15,45 * * * *',
  async run(ctx) {
    if (!aiConfigured()) {
      ctx.logger.info('No AI provider configured; library-classification is disabled.');
      return;
    }
    const rows = await ctx.prisma.libraryItem.findMany({
      where: { classifiedAt: null, hiddenAt: null },
      select: { id: true, title: true, creator: true, date: true, category: true, documentType: true, description: true },
      orderBy: { ingestedAt: 'desc' },
      take: MAX_ROWS_PER_RUN,
    });
    if (rows.length === 0) return;
    const { classified, failed } = await classifyLibraryRows(ctx.prisma, rows);
    ctx.logger.info({ candidates: rows.length, classified, failed }, 'library-classification run complete');
  },
};
