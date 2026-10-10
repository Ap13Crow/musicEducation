import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import {
  clampLength,
  creditedSeconds,
  isComplete,
  requiredSeconds,
  xpForLength,
  type EngagementMode,
} from '../lib/libraryEngagement.js';
import { awardXpOnce } from './xp.js';
import type { GraphQLContext } from '../types.js';

// Reading/listening tracking for the Library and the XP it earns - rules in
// lib/libraryEngagement.ts. Signed-in users only; anonymous visitors are
// never tracked.

type EngagementRow = {
  itemId: string;
  mode: EngagementMode;
  activeSeconds: number;
  progress: number;
  length: number | null;
  completedAt: Date | null;
  xpAwarded: number;
};

function present(row: EngagementRow) {
  const length = row.length ?? 1;
  return {
    itemId: row.itemId,
    mode: row.mode,
    activeSeconds: row.activeSeconds,
    requiredSeconds: requiredSeconds(row.mode, length),
    progress: row.progress,
    length: row.length,
    completed: Boolean(row.completedAt),
    xpAwarded: row.xpAwarded,
    xpAvailable: xpForLength(row.mode, length),
  };
}

// Length the server can vouch for itself - then the client's figure is
// ignored: the page count of a stored Gallica document, or the summed
// durations of an item's audio files when every one is known.
async function knownLength(prisma: GraphQLContext['prisma'], item: { id: string; files: unknown }, mode: EngagementMode): Promise<number | null> {
  if (mode === 'READ') {
    const pages = await prisma.libraryItemMedia.count({ where: { itemId: item.id, kind: 'PAGE' } });
    return pages > 0 ? pages : null;
  }
  const audio = (Array.isArray(item.files) ? item.files : []).filter((file: any) => String(file?.contentType ?? '').startsWith('audio/'));
  if (audio.length === 0 || !audio.every((file: any) => Number.isFinite(file?.durationSeconds) && file.durationSeconds > 0)) return null;
  return audio.reduce((sum: number, file: any) => sum + Math.round(file.durationSeconds), 0);
}

export const libraryEngagementResolvers = {
  Query: {
    async myLibraryEngagement(_: unknown, { itemId }: { itemId: string }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const rows = await prisma.libraryEngagement.findMany({ where: { userId: user.id, itemId } });
      return rows.map(present);
    },
  },

  Mutation: {
    async recordLibraryEngagement(_: unknown, { input }: { input: any }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const mode: EngagementMode = input.mode === 'LISTEN' ? 'LISTEN' : 'READ';
      const item = await prisma.libraryItem.findUnique({ where: { id: input.itemId }, select: { id: true, files: true, hiddenAt: true } });
      if (!item || item.hiddenAt) throw new GraphQLError('Library item not found.', { extensions: { code: 'NOT_FOUND' } });

      const now = new Date();
      const key = { userId_itemId_mode: { userId: user.id, itemId: item.id, mode } };
      const existing = await prisma.libraryEngagement.findUnique({ where: key });
      const progress = Math.max(existing?.progress ?? 0, Math.min(1, Math.max(0, Number(input.progress) || 0)));
      const length = (await knownLength(prisma, item, mode)) ?? Math.max(existing?.length ?? 1, clampLength(mode, input.length));
      const activeSeconds = (existing?.activeSeconds ?? 0) + creditedSeconds(existing?.lastHeartbeatAt ?? null, now, Boolean(input.active));

      let row: EngagementRow = await prisma.libraryEngagement.upsert({
        where: key,
        create: { userId: user.id, itemId: item.id, mode, progress, length, activeSeconds: 0, lastHeartbeatAt: now },
        update: { progress, length, activeSeconds, lastHeartbeatAt: now },
      });

      if (!row.completedAt && isComplete(mode, row.progress, row.activeSeconds, length)) {
        const xp = xpForLength(mode, length);
        // completedAt: null in the filter makes a racing second heartbeat a
        // no-op; awardXpOnce is idempotent per (user, reason, item) anyway.
        const claimed = await prisma.libraryEngagement.updateMany({
          where: { userId: user.id, itemId: item.id, mode, completedAt: null },
          data: { completedAt: now, xpAwarded: xp },
        });
        if (claimed.count > 0) {
          await awardXpOnce(prisma, user.id, mode === 'READ' ? 'LIBRARY_READ' : 'LIBRARY_LISTEN', item.id, xp);
          row = { ...row, completedAt: now, xpAwarded: xp };
        }
      }
      return present(row);
    },
  },
};
