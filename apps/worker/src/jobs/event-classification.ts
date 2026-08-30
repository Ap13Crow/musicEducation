import type { PrismaClient } from '@my-music-coach/database';
import { aiChat, aiConfigured } from '../lib/ai.js';
import type { Job } from './types.js';

// Same vocabulary the frontend offers for native events/courses/profiles
// (see apps/web/src/app/onboarding/page.tsx and courses/page.tsx) - matching
// it exactly is what lets a classified external event actually satisfy the
// same instrument/musicStyle/skillLevel filters and recommendations built
// for native Events.
const INSTRUMENT_VOCAB = ['Piano', 'Violin', 'Viola', 'Cello', 'Double Bass', 'Flute', 'Oboe', 'Clarinet', 'Bassoon', 'Horn', 'Trumpet', 'Trombone', 'Guitar', 'Harp', 'Voice'];
const STYLE_VOCAB = ['Baroque', 'Classical', 'Romantic', 'Contemporary', 'Opera', 'Chamber Music', 'Orchestral', 'Solo Piano', 'Early Music'];
const SKILL_LEVEL_VOCAB = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];

// One DeepSeek call classifies a batch, not one call per event: keeps
// request volume (and cost) low, and the model has more context to work
// with when instrument/style signals are thin in a single listing.
const BATCH_SIZE = 10;
// Cap on unclassified rows processed per run (a handful of batches) so one
// cron tick has a bounded, predictable duration; the rest pick up next run.
// Classictic can add up to 1000 rows in one daily ingest, so four six-hourly
// classifier ticks can now keep pace without making one run enormous.
const MAX_ROWS_PER_RUN = 250;

interface ClassificationResult {
  instruments: string[];
  musicStyles: string[];
  skillLevel: string | null;
}

function systemPrompt(): string {
  return [
    'You classify classical/live-music event listings for a music education platform.',
    `For each event, choose zero or more instruments from exactly this list: ${INSTRUMENT_VOCAB.join(', ')}.`,
    `Choose zero or more music styles from exactly this list: ${STYLE_VOCAB.join(', ')}.`,
    `Choose at most one target skill level (for an audience member, not a performer) from exactly this list, or null if unclear: ${SKILL_LEVEL_VOCAB.join(', ')}.`,
    'Only include a tag when the listing gives a reasonably confident signal (e.g. "violin recital", "solo piano", "opera gala", "for beginners"). Leave arrays empty rather than guessing.',
    'Respond with ONLY a JSON array, no prose, no markdown fences, one object per event in the exact input order, shape: {"instruments":string[],"musicStyles":string[],"skillLevel":string|null}.',
  ].join('\n');
}

export function isValidResult(value: unknown): value is ClassificationResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.instruments) && v.instruments.every((i) => typeof i === 'string' && INSTRUMENT_VOCAB.includes(i)) &&
    Array.isArray(v.musicStyles) && v.musicStyles.every((s) => typeof s === 'string' && STYLE_VOCAB.includes(s)) &&
    (v.skillLevel === null || v.skillLevel === undefined || (typeof v.skillLevel === 'string' && SKILL_LEVEL_VOCAB.includes(v.skillLevel)))
  );
}

async function classifyBatch(events: Array<{ title: string; description: string | null; classifications: string[] }>): Promise<ClassificationResult[] | null> {
  const userMessage = JSON.stringify(
    events.map((e, i) => ({ index: i, title: e.title, description: e.description?.slice(0, 400) ?? null, providerTags: e.classifications })),
  );
  const reply = await aiChat(systemPrompt(), userMessage);
  if (!reply) return null;

  let parsed: unknown;
  try {
    // Models occasionally wrap JSON in a fenced code block despite
    // instructions not to; strip fences before parsing rather than fail.
    const cleaned = reply.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length !== events.length || !parsed.every(isValidResult)) return null;
  return parsed as ClassificationResult[];
}

async function classifyRows(prisma: PrismaClient, rows: Array<{ id: string; title: string; description: string | null; classifications: string[] }>) {
  let classified = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const results = await classifyBatch(batch);
    if (!results) {
      // Leave classifiedAt null on a failed batch - it's picked up again
      // next run rather than permanently marked "processed" with no tags.
      failed += batch.length;
      continue;
    }
    await Promise.all(
      batch.map((row, idx) =>
        prisma.externalEventProjection.update({
          where: { id: row.id },
          data: {
            instruments: results[idx].instruments,
            musicStyles: results[idx].musicStyles,
            skillLevels: results[idx].skillLevel ? [results[idx].skillLevel as string] : [],
            classifiedAt: new Date(),
          },
        }),
      ),
    );
    classified += batch.length;
  }
  return { classified, failed };
}

export const eventClassificationJob: Job = {
  key: 'event-classification',
  // Same 6-hour cadence as ticketmaster-ingest, offset to run after it so a
  // batch of freshly-ingested events gets classified the same cycle.
  schedule: '30 */6 * * *',
  async run(ctx) {
    if (!aiConfigured()) {
      ctx.logger.info('No AI provider (DEEPSEEK_API_KEY/OPENAI_API_KEY) configured; event-classification is disabled.');
      return;
    }

    const rows = await ctx.prisma.externalEventProjection.findMany({
      where: { classifiedAt: null, startsAt: { gte: new Date() } },
      select: { id: true, title: true, description: true, classifications: true },
      orderBy: { startsAt: 'asc' },
      take: MAX_ROWS_PER_RUN,
    });
    if (rows.length === 0) {
      ctx.logger.info('event-classification: no unclassified upcoming events; nothing to do.');
      return;
    }

    const { classified, failed } = await classifyRows(ctx.prisma, rows);
    ctx.logger.info({ candidates: rows.length, classified, failed }, 'event-classification run complete');
  },
};
