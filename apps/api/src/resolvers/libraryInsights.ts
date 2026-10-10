import { GraphQLError } from 'graphql';
import { Prisma } from '@my-music-coach/database';
import { requireRole } from '../middleware/auth.js';
import { buildAffinity, loadLibraryHistory, recommendLibraryItems } from '../lib/libraryRecommendations.js';
import type { GraphQLContext } from '../types.js';

// Library recommendations for the signed-in user, and the admin's view of
// how every user uses the Library (what they open, finish, keep), which is
// also what the recommendations are built from.

const DAY_MS = 24 * 60 * 60 * 1000;

async function withItems(prisma: any, recommendations: { id: string; score: number; reasons: string[] }[]) {
  if (!recommendations.length) return [];
  const items = await prisma.libraryItem.findMany({ where: { id: { in: recommendations.map((rec) => rec.id) } } });
  const byId = new Map(items.map((item: any) => [item.id, item]));
  return recommendations.filter((rec) => byId.has(rec.id)).map((rec) => ({ item: byId.get(rec.id), score: rec.score, reasons: rec.reasons }));
}

type UsageRow = {
  userId: string;
  email: string;
  role: string;
  displayName: string | null;
  itemsOpened: number;
  itemsCompleted: number;
  xpEarned: number;
  activeSeconds: number;
  favorites: number;
  folders: number;
  lastActiveAt: Date | null;
};

const SORTS: Record<string, Prisma.Sql> = {
  RECENT: Prisma.sql`"lastActiveAt" DESC NULLS LAST`,
  OPENED: Prisma.sql`"itemsOpened" DESC, "lastActiveAt" DESC NULLS LAST`,
  COMPLETED: Prisma.sql`"itemsCompleted" DESC, "lastActiveAt" DESC NULLS LAST`,
  TIME: Prisma.sql`"activeSeconds" DESC, "lastActiveAt" DESC NULLS LAST`,
};

// One row per user with any Library activity.
async function usageRows(prisma: any, options: { query?: string | null; userId?: string; sort?: string | null; limit: number; offset: number }) {
  const conditions: Prisma.Sql[] = [];
  if (options.userId) conditions.push(Prisma.sql`u.id = ${options.userId}`);
  if (options.query?.trim()) {
    const like = `%${options.query.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
    conditions.push(Prisma.sql`(u.email ILIKE ${like} OR p."displayName" ILIKE ${like})`);
  }
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  const rows: (UsageRow & { total: number })[] = await prisma.$queryRaw`
    WITH e AS (
      SELECT "userId", count(DISTINCT "itemId")::int AS opened, count(DISTINCT "itemId") FILTER (WHERE "completedAt" IS NOT NULL)::int AS completed,
        coalesce(sum("xpAwarded"), 0)::int AS xp, coalesce(sum("activeSeconds"), 0)::int AS secs, max("updatedAt") AS last
      FROM "LibraryEngagement" GROUP BY 1),
    f AS (SELECT "userId", count(*)::int AS n, max("createdAt") AS last FROM "LibraryFavorite" GROUP BY 1),
    d AS (SELECT "ownerId" AS "userId", count(*)::int AS n, max("updatedAt") AS last FROM "LibraryFolder" GROUP BY 1),
    active AS (SELECT "userId" FROM e UNION SELECT "userId" FROM f UNION SELECT "userId" FROM d)
    SELECT u.id AS "userId", u.email, u.role::text AS role, p."displayName",
      coalesce(e.opened, 0) AS "itemsOpened", coalesce(e.completed, 0) AS "itemsCompleted", coalesce(e.xp, 0) AS "xpEarned",
      coalesce(e.secs, 0) AS "activeSeconds", coalesce(f.n, 0) AS favorites, coalesce(d.n, 0) AS folders,
      greatest(e.last, f.last, d.last) AS "lastActiveAt",
      count(*) OVER ()::int AS total
    FROM active a
    JOIN "User" u ON u.id = a."userId"
    LEFT JOIN "UserProfile" p ON p."userId" = u.id
    LEFT JOIN e ON e."userId" = u.id
    LEFT JOIN f ON f."userId" = u.id
    LEFT JOIN d ON d."userId" = u.id
    ${where}
    ORDER BY ${SORTS[options.sort ?? 'RECENT'] ?? SORTS.RECENT}
    LIMIT ${options.limit} OFFSET ${options.offset}`;
  return { rows, total: rows[0]?.total ?? 0 };
}

function toUsage(row: UsageRow) {
  return { ...row, activeMinutes: Math.round(row.activeSeconds / 60) };
}

export const libraryInsightsResolvers = {
  Query: {
    async recommendedLibraryItems(_: unknown, { limit = 6 }: { limit?: number }, { prisma, user }: GraphQLContext) {
      if (!user) return [];
      return withItems(prisma, await recommendLibraryItems(prisma, user.id, limit));
    },

    async adminLibraryUsage(_: unknown, { query, sort, page = 1, limit = 25 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const safeLimit = Math.max(1, Math.min(limit ?? 25, 100));
      const safePage = Math.max(1, page ?? 1);
      const now = Date.now();
      const since7 = new Date(now - 7 * DAY_MS);
      const since30 = new Date(now - 30 * DAY_MS);

      const [{ rows, total }, active7, active30, opened30, completed30, xp30, favorites, folders, topRaw] = await Promise.all([
        usageRows(prisma, { query, sort, limit: safeLimit, offset: (safePage - 1) * safeLimit }),
        prisma.libraryEngagement.findMany({ where: { updatedAt: { gte: since7 } }, distinct: ['userId'], select: { userId: true } }),
        prisma.libraryEngagement.findMany({ where: { updatedAt: { gte: since30 } }, distinct: ['userId'], select: { userId: true } }),
        prisma.libraryEngagement.count({ where: { startedAt: { gte: since30 } } }),
        prisma.libraryEngagement.count({ where: { completedAt: { gte: since30 } } }),
        prisma.libraryEngagement.aggregate({ where: { completedAt: { gte: since30 } }, _sum: { xpAwarded: true } }),
        prisma.libraryFavorite.count(),
        prisma.libraryFolder.count(),
        prisma.libraryEngagement.groupBy({ by: ['itemId'], _count: { _all: true }, orderBy: { _count: { itemId: 'desc' } }, take: 10 }),
      ]);
      const topItems = await prisma.libraryItem.findMany({ where: { id: { in: topRaw.map((row: any) => row.itemId) } } });
      const completedByItem = topRaw.length
        ? await prisma.libraryEngagement.groupBy({ by: ['itemId'], where: { itemId: { in: topRaw.map((row: any) => row.itemId) }, completedAt: { not: null } }, _count: { _all: true } })
        : [];
      const completions = new Map(completedByItem.map((row: any) => [row.itemId, row._count._all]));
      const itemById = new Map(topItems.map((item: any) => [item.id, item]));

      return {
        summary: {
          activeUsers7d: active7.length,
          activeUsers30d: active30.length,
          itemsOpened30d: opened30,
          completions30d: completed30,
          xpAwarded30d: xp30._sum.xpAwarded ?? 0,
          favorites,
          folders,
        },
        topItems: topRaw
          .filter((row: any) => itemById.has(row.itemId))
          .map((row: any) => ({ item: itemById.get(row.itemId), opens: row._count._all, completions: completions.get(row.itemId) ?? 0 })),
        users: { nodes: rows.map(toUsage), totalCount: total, page: safePage, limit: safeLimit },
      };
    },

    async adminLibraryUserActivity(_: unknown, { userId }: { userId: string }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const { rows } = await usageRows(prisma, { userId, limit: 1, offset: 0 });
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, profile: { select: { displayName: true, instruments: true, musicStyles: true, skillLevel: true } } } } as any);
      if (!target) throw new GraphQLError('User not found.', { extensions: { code: 'NOT_FOUND' } });
      const t: any = target;
      const usage = rows[0]
        ? toUsage(rows[0])
        : toUsage({ userId, email: t.email, role: t.role, displayName: t.profile?.displayName ?? null, itemsOpened: 0, itemsCompleted: 0, xpEarned: 0, activeSeconds: 0, favorites: 0, folders: 0, lastActiveAt: null });

      const [recent, favorites, history, recommendations] = await Promise.all([
        prisma.libraryEngagement.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 50, include: { item: true } } as any),
        prisma.libraryFavorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50, include: { item: true } } as any),
        loadLibraryHistory(prisma, userId),
        recommendLibraryItems(prisma, userId, 6),
      ]);
      const affinity = buildAffinity(history);
      const top = (map: Map<string, number>) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([value, share]) => ({ value, share: Math.round(share * 100) / 100 }));

      return {
        usage,
        profileInstruments: t.profile?.instruments ?? [],
        profileStyles: t.profile?.musicStyles ?? [],
        skillLevel: t.profile?.skillLevel ?? null,
        historyInstruments: top(affinity.instruments),
        historyStyles: top(affinity.styles),
        historyCreators: [...affinity.creators.values()].sort((a, b) => b.weight - a.weight).slice(0, 5).map((creator) => creator.name),
        recent: (recent as any[]).map((row) => ({
          item: row.item,
          mode: row.mode,
          progress: row.progress,
          activeMinutes: Math.round(row.activeSeconds / 60),
          completedAt: row.completedAt,
          xpAwarded: row.xpAwarded,
          updatedAt: row.updatedAt,
        })),
        favorites: (favorites as any[]).map((row) => row.item),
        recommendations: await withItems(prisma, recommendations),
      };
    },
  },
};
