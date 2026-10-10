import type { PrismaClient } from '@my-music-coach/database';

// "Recommended for you" in the Library - the same idea as the event
// recommendations (packages/external-events/src/scoring.ts): AI tags on the
// items (worker job library-classification), a deterministic score per
// viewer. Two signals:
//   - the profile: instruments, music styles, level
//   - the reading history: what the user finished, favorited, filed in a
//     folder or opened - its instruments, styles and composers
// Items the user already has in their history are never recommended.

const LEVELS = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];

export interface RecItem {
  id: string;
  creator: string | null;
  instruments: string[];
  musicStyles: string[];
  skillLevels: string[];
}

export interface RecProfile {
  instruments: string[];
  musicStyles: string[];
  skillLevel: string | null;
}

export interface HistoryEntry {
  item: RecItem;
  // completed 3, favorite 3, in a folder 2, opened 1 (summed per item)
  weight: number;
}

export interface Recommendation {
  id: string;
  score: number;
  reasons: string[];
}

// "Schubert, Franz (1797-1828). Compositeur" and "Franz Schubert" -> "schubert"
// "Schubert, Franz (1797-1828). Compositeur" -> "Schubert"; "J. S. Bach" -> "Bach"
function rawSurname(creator: string): string {
  const name = creator.replace(/\([^)]*\)/g, ' ').split(';')[0].trim();
  if (name.includes(',')) return name.split(',')[0].trim();
  return name.split(/\s+/).filter((word) => word.replace(/\W/g, '').length >= 3).pop() ?? '';
}

export function creatorSurname(creator: string | null | undefined): string | null {
  if (!creator) return null;
  const surname = rawSurname(creator);
  const folded = surname.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z-]/g, '');
  return folded.length >= 3 ? folded : null;
}

export function displaySurname(creator: string | null | undefined): string | null {
  if (!creator) return null;
  const surname = rawSurname(creator).replace(/[^\p{L}'-]/gu, '');
  return surname.length >= 3 ? surname.charAt(0).toUpperCase() + surname.slice(1).toLowerCase() : null;
}

function shares(entries: HistoryEntry[], pick: (item: RecItem) => string[]): Map<string, number> {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  const map = new Map<string, number>();
  for (const entry of entries) for (const value of pick(entry.item)) map.set(value, (map.get(value) ?? 0) + entry.weight / total);
  return map;
}

export interface Affinity {
  instruments: Map<string, number>;
  styles: Map<string, number>;
  creators: Map<string, { weight: number; name: string }>;
  seen: Set<string>;
}

export function buildAffinity(history: HistoryEntry[]): Affinity {
  const creators = new Map<string, { weight: number; name: string }>();
  for (const entry of history) {
    const key = creatorSurname(entry.item.creator);
    const name = displaySurname(entry.item.creator);
    if (!key || !name) continue;
    const current = creators.get(key);
    creators.set(key, { weight: (current?.weight ?? 0) + entry.weight, name: current?.name ?? name });
  }
  return {
    instruments: shares(history, (item) => item.instruments),
    styles: shares(history, (item) => item.musicStyles),
    creators,
    seen: new Set(history.map((entry) => entry.item.id)),
  };
}

export function scoreItem(item: RecItem, profile: RecProfile, affinity: Affinity): Recommendation | null {
  if (affinity.seen.has(item.id)) return null;
  let score = 0;
  const reasons: string[] = [];

  const playedInstrument = item.instruments.find((instrument) => profile.instruments.includes(instrument));
  if (playedInstrument) {
    score += 4;
    reasons.push(`For ${playedInstrument.toLowerCase()}`);
  }
  const likedStyle = item.musicStyles.find((style) => profile.musicStyles.includes(style));
  if (likedStyle) {
    score += 3;
    reasons.push(`${likedStyle}, a style you like`);
  }

  const level = profile.skillLevel ? LEVELS.indexOf(profile.skillLevel) : -1;
  if (level >= 0 && item.skillLevels.length) {
    const levels = item.skillLevels.map((value) => LEVELS.indexOf(value)).filter((value) => value >= 0);
    if (levels.includes(level)) {
      score += 2;
      reasons.push('Suits your level');
    } else if (levels.length && Math.min(...levels) - level >= 2) {
      score -= 3;
    }
  }

  const surname = creatorSurname(item.creator);
  const creator = surname ? affinity.creators.get(surname) : undefined;
  if (creator) {
    score += Math.min(4, 2 + creator.weight / 2);
    reasons.push(`More by ${creator.name}`);
  }
  const instrumentShare = Math.max(0, ...item.instruments.map((value) => affinity.instruments.get(value) ?? 0));
  const styleShare = Math.max(0, ...item.musicStyles.map((value) => affinity.styles.get(value) ?? 0));
  score += 3 * instrumentShare + 2 * styleShare;
  if (!creator && styleShare >= 0.3 && !likedStyle) {
    const style = item.musicStyles.find((value) => (affinity.styles.get(value) ?? 0) >= 0.3);
    if (style) reasons.push(`${style}, like what you've been reading`);
  }

  if (score < 3 || !reasons.length) return null;
  return { id: item.id, score: Math.round(score * 10) / 10, reasons: reasons.slice(0, 2) };
}

// Stable within a day, different the next: equal scores rotate daily.
function dailyTieBreak(id: string, day: string): number {
  let hash = 0;
  for (const char of id + day) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return hash;
}

export function rankRecommendations(candidates: RecItem[], profile: RecProfile, affinity: Affinity, limit: number, day: string): Recommendation[] {
  const scored = candidates
    .map((item) => ({ item, rec: scoreItem(item, profile, affinity) }))
    .filter((entry): entry is { item: RecItem; rec: Recommendation } => Boolean(entry.rec))
    .sort((a, b) => b.rec.score - a.rec.score || dailyTieBreak(a.item.id, day) - dailyTieBreak(b.item.id, day));
  // At most two picks per composer, so one favourite doesn't fill the row.
  const perCreator = new Map<string, number>();
  const picked: Recommendation[] = [];
  for (const { item, rec } of scored) {
    const key = creatorSurname(item.creator) ?? item.id;
    if ((perCreator.get(key) ?? 0) >= 2) continue;
    perCreator.set(key, (perCreator.get(key) ?? 0) + 1);
    picked.push(rec);
    if (picked.length >= limit) break;
  }
  return picked;
}

const TAG_SELECT = { id: true, creator: true, instruments: true, musicStyles: true, skillLevels: true } as const;

// What the user has done in the Library, as weighted history entries.
export async function loadLibraryHistory(prisma: PrismaClient, userId: string): Promise<HistoryEntry[]> {
  const [engagements, favorites, folderItems] = await Promise.all([
    prisma.libraryEngagement.findMany({ where: { userId }, select: { itemId: true, completedAt: true }, orderBy: { updatedAt: 'desc' }, take: 300 }),
    prisma.libraryFavorite.findMany({ where: { userId }, select: { itemId: true }, take: 300 }),
    prisma.libraryFolderItem.findMany({ where: { folder: { ownerId: userId } }, select: { itemId: true }, take: 300 }),
  ]);
  const weights = new Map<string, number>();
  const add = (itemId: string, weight: number) => weights.set(itemId, (weights.get(itemId) ?? 0) + weight);
  for (const row of engagements) add(row.itemId, row.completedAt ? 3 : 1);
  for (const row of favorites) add(row.itemId, 3);
  for (const row of folderItems) add(row.itemId, 2);
  if (!weights.size) return [];
  const items = await prisma.libraryItem.findMany({ where: { id: { in: [...weights.keys()] } }, select: TAG_SELECT });
  return items.map((item: RecItem) => ({ item, weight: weights.get(item.id) ?? 1 }));
}

export async function loadRecProfile(prisma: PrismaClient, userId: string): Promise<RecProfile> {
  const profile = await prisma.userProfile.findUnique({ where: { userId }, select: { instruments: true, musicStyles: true, skillLevel: true } });
  return { instruments: profile?.instruments ?? [], musicStyles: profile?.musicStyles ?? [], skillLevel: profile?.skillLevel ?? null };
}

export async function recommendLibraryItems(prisma: PrismaClient, userId: string, limit = 6): Promise<Recommendation[]> {
  const [profile, history] = await Promise.all([loadRecProfile(prisma, userId), loadLibraryHistory(prisma, userId)]);
  const affinity = buildAffinity(history);
  const instruments = [...new Set([...profile.instruments, ...affinity.instruments.keys()])];
  const styles = [...new Set([...profile.musicStyles, ...affinity.styles.keys()])];
  const surnames = [...affinity.creators.entries()].sort((a, b) => b[1].weight - a[1].weight).slice(0, 5).map(([, value]) => value.name);
  if (!instruments.length && !styles.length && !surnames.length) return [];

  const candidates: RecItem[] = await prisma.libraryItem.findMany({
    where: {
      hiddenAt: null,
      id: { notIn: [...affinity.seen] },
      // Only what opens here (Gallica/DNB items once copied).
      OR: [{ source: { notIn: ['BNF', 'DNB', 'EUROPEANA'] } }, { mirroredAt: { not: null } }],
      AND: [
        {
          OR: [
            ...(instruments.length ? [{ instruments: { hasSome: instruments } }] : []),
            ...(styles.length ? [{ musicStyles: { hasSome: styles } }] : []),
            ...surnames.map((name) => ({ creator: { contains: name, mode: 'insensitive' as const } })),
          ],
        },
      ],
    } as any,
    select: TAG_SELECT,
    take: 800,
    orderBy: { ingestedAt: 'desc' },
  });
  return rankRecommendations(candidates, profile, affinity, Math.max(1, Math.min(limit, 24)), new Date().toISOString().slice(0, 10));
}
