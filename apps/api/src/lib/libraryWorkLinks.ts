import type { PrismaClient } from '@my-music-coach/database';
import { logger } from '../utils/logger.js';

// Recordings and scores of the same work, so a recording's page can offer
// its score and a score's page its recordings (LibraryWorkLink, migration
// 057). Precision over coverage - a wrong score next to a recording is worse
// than none - so a pair needs the same composer AND one of:
//   - CATALOGUE: the same catalogue number (Op./K./BWV/D./Hob./WoO/RV/HWV/
//     Sz./BB/Wq.), with the same sub-number when both give one
//     ("Op. 28 No. 15" is not "Op. 28 No. 7"; "Op. 35 - III." is Op. 35);
//   - TITLE: the same distinctive title words ("Erlkönig", "Clair de lune",
//     "Ave Maria"), where form names (Mazurka, Prélude, Quartet ...) never
//     count on their own, differing form names ("Sérénade espagnole" vs
//     "Chanson espagnole") or work numbers ("Quartet No. 1" vs "No. 2",
//     "1re" vs "Deuxième Arabesque") rule a pair out, and titles numbered
//     in different catalogues are never matched by words.
// A catalogue match drops that recording's word matches; a recording with
// more than MAX_SCORES candidate scores is left unlinked as too vague.
// Tuned by hand on the 2026-10 Library (3,332 recordings, 3,216 scores:
// 108 recordings linked, no false pair found in review).

export type WorkLinkMethod = 'CATALOGUE' | 'TITLE';

export interface WorkItem {
  id: string;
  title: string;
  creator: string | null;
}

export interface WorkLink {
  recordingId: string;
  scoreId: string;
  method: WorkLinkMethod;
}

const MAX_SCORES = 4;

export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
}

const NAME_WORDS = new Set('compositeur composer arr auteur responsable int interprete verfasser von van der de la le du des di da and und et'.split(' '));

// "Beethoven, Ludwig van (1770-1827)", "Ludwig van Beethoven", "F. F. Chopin" -> the surname.
export function composerSurname(creator: string | null | undefined): string | null {
  if (!creator) return null;
  const folded = fold(creator);
  const part = folded.includes(',') ? folded.split(',')[0] : (folded.split('(')[0].trim().split(' ').pop() ?? '');
  const words = part.split(/\s+/).filter(Boolean);
  const surname = (words.pop() ?? '').replace(/[^a-z'-]/g, '');
  return surname.length >= 3 ? surname : null;
}

const CATALOGUE = /\b(op|opus|k|kv|bwv|d|hob|woo|rv|hwv|sz|bb|wq)\.?\s*(?:[ivxlc]+\s*:\s*)?(\d+[a-z]?)(?:\s*[.,/;]?\s*(?:no|nr|n°|nos?)\.?\s*(\d+))?/gi;

type CatalogueNumber = { kind: string; number: string; sub: string | null };

export function catalogueNumbers(title: string): CatalogueNumber[] {
  const seen = new Map<string, CatalogueNumber>();
  for (const match of fold(title).matchAll(CATALOGUE)) {
    const kind = match[1].replace('kv', 'k').replace('opus', 'op');
    const entry = { kind, number: match[2], sub: match[3] ?? null };
    seen.set(`${entry.kind}|${entry.number}|${entry.sub}`, entry);
  }
  return [...seen.values()];
}

const FILLER = new Set(
  ('in the of a an and no nr n op opus major minor dur moll majeur mineur flat sharp part pt partie teil from aus de la le les des du di il ' +
    'et und for pour fur per con avec with on sur sopra mit e b c d f g h is es fis cis gis dis ais bes as ges ces version arr arranged by ' +
    'orch orchestra piano violin cello voice vocal record disc disque side face kv k bwv hob woo rv bis').split(' '),
);

export const FORMS = new Set(
  ('mazurka mazurkas prelude preludes etude etudes study nocturne nocturnes sonata sonate sonatas sonatina quartet quatuor quartett ' +
    'quartetto trio quintet quintette symphony symphonie sinfonie concerto konzert serenade serenata waltz valse walzer scherzo ballade ' +
    'ballad polonaise impromptu march marche marsch fugue fuge suite rondo variations variation fantasy fantasie fantaisie fantasia ' +
    'overture ouverture minuet minuets menuet menuett menuetto minuetto dance danse tanz dans aria air song songs lied lieder chanson ' +
    'melodie romance romanze string strings quatuors tema theme andante allegro adagio largo presto cantabile moderato vivace lento ' +
    'grave movement mvt mouvement pieces piece stucke berceuse barcarolle humoresque caprice capriccio toccata invention gavotte gigue ' +
    'sarabande allemande courante bourree prelud intermezzo rhapsody rhapsodie').split(' '),
);

// The work's own words: the main title (before " / " or " // "), without
// filler, form-agnostic articles, and the composer's own name.
export function titleWords(title: string, drop: Set<string> = new Set()): Set<string> {
  const main = fold(title).split(' / ')[0].split(' // ')[0];
  return new Set((main.match(/[a-z]+/g) ?? []).filter((word) => word.length >= 3 && !FILLER.has(word) && !drop.has(word)));
}

const ORDINALS: Record<string, string> = {
  premier: '1', premiere: '1', '1re': '1', '1er': '1', first: '1', erste: '1',
  deuxieme: '2', second: '2', seconde: '2', '2e': '2', zweite: '2',
  troisieme: '3', third: '3', '3e': '3', dritte: '3',
  quatrieme: '4', fourth: '4', '4e': '4', vierte: '4',
};

// "No. 2", "Nr. 2", "n° 2", "1re", "Deuxième" -> the work's number in a set.
export function workNumbers(title: string): Set<string> {
  const main = fold(title).split(' / ')[0];
  const numbers = new Set([...main.matchAll(/(?:no|nr|n°|nummer|numero)\.?\s*(\d+)/g)].map((match) => match[1]));
  for (const word of main.match(/[a-z0-9]+/g) ?? []) if (ORDINALS[word]) numbers.add(ORDINALS[word]);
  return numbers;
}

const intersects = <T>(a: Set<T>, b: Set<T>) => [...a].some((value) => b.has(value));

function sameCatalogueWork(recording: CatalogueNumber[], score: CatalogueNumber[]): boolean {
  return recording.some((r) =>
    score.some((s) => {
      if (r.kind !== s.kind || r.number !== s.number) return false;
      if (r.sub && s.sub) return r.sub === s.sub;
      // "Op. 50" on the recording, the score lists "Op. 50 No. 1" and
      // "Op. 50 No. 3": too vague to say which.
      if (!r.sub && s.sub) return !score.some((other) => other.kind === r.kind && other.number === r.number && other.sub && other.sub !== s.sub);
      return true;
    }),
  );
}

function sameTitleWork(recording: WorkItem, score: WorkItem, drop: Set<string>): boolean {
  const recordingNumbers = workNumbers(recording.title);
  const scoreNumbers = workNumbers(score.title);
  if (recordingNumbers.size && scoreNumbers.size && !intersects(recordingNumbers, scoreNumbers)) return false;
  const left = titleWords(recording.title, drop);
  const right = titleWords(score.title, drop);
  if (!left.size || !right.size) return false;
  const leftForms = new Set([...left].filter((word) => FORMS.has(word)));
  const rightForms = new Set([...right].filter((word) => FORMS.has(word)));
  if (leftForms.size && rightForms.size && !intersects(leftForms, rightForms)) return false;
  const [small, big] = left.size <= right.size ? [left, right] : [right, left];
  const shared = [...small].filter((word) => big.has(word));
  const distinctive = shared.filter((word) => !FORMS.has(word));
  if (!distinctive.length || shared.length / small.size < 0.8) return false;
  return distinctive.length >= 2 || distinctive[0].length >= 6;
}

export function matchWorks(recordings: WorkItem[], scores: WorkItem[]): WorkLink[] {
  const byComposer = new Map<string, WorkItem[]>();
  const scoreCount = new Map<string, number>();
  for (const score of scores) {
    const surname = composerSurname(score.creator);
    if (!surname || NAME_WORDS.has(surname)) continue;
    byComposer.set(surname, [...(byComposer.get(surname) ?? []), score]);
    scoreCount.set(surname, (scoreCount.get(surname) ?? 0) + 1);
  }

  // A recording's composers: from its creator field ("Schubert; Wilhelmj",
  // "ENRICO CARUSO, Bizet"), else - many Europeana records name nobody - a
  // composer named in its title, if that composer has at least 3 scores.
  const composersOf = (recording: WorkItem): Set<string> => {
    const found = new Set<string>();
    if (recording.creator) {
      for (const piece of recording.creator.split(/[;/]| - |,(?=\s*[A-Z])/)) {
        const surname = composerSurname(piece);
        if (surname && byComposer.has(surname)) found.add(surname);
      }
      for (const word of fold(recording.creator).match(/[a-z]+/g) ?? []) if (word.length >= 4 && byComposer.has(word)) found.add(word);
    }
    if (!found.size) {
      for (const word of fold(recording.title).match(/[a-z]+/g) ?? []) {
        if (word.length >= 5 && (scoreCount.get(word) ?? 0) >= 3) found.add(word);
      }
    }
    return found;
  };

  const links: WorkLink[] = [];
  for (const recording of recordings) {
    const composers = composersOf(recording);
    if (!composers.size) continue;
    const recordingCatalogue = catalogueNumbers(recording.title);
    const candidates = new Map<string, WorkLinkMethod>();
    for (const composer of composers) {
      for (const score of byComposer.get(composer) ?? []) {
        const scoreCatalogue = catalogueNumbers(score.title);
        if (recordingCatalogue.length && scoreCatalogue.length) {
          if (sameCatalogueWork(recordingCatalogue, scoreCatalogue)) candidates.set(score.id, 'CATALOGUE');
          continue;
        }
        if (sameTitleWork(recording, score, composers) && !candidates.has(score.id)) candidates.set(score.id, 'TITLE');
      }
    }
    const byCatalogue = [...candidates].filter(([, method]) => method === 'CATALOGUE');
    const chosen = byCatalogue.length ? byCatalogue : [...candidates];
    if (!chosen.length || chosen.length > MAX_SCORES) continue;
    for (const [scoreId, method] of chosen) links.push({ recordingId: recording.id, scoreId, method });
  }
  return links;
}

// Recompute every link from the whole Library. Links an admin rejected stay
// (rejected); links that no longer match are removed; new ones are added.
export async function relinkLibraryWorks(prisma: PrismaClient): Promise<{ links: number; added: number; removed: number }> {
  const select = { id: true, title: true, creator: true };
  const [recordings, scores] = await Promise.all([
    prisma.libraryItem.findMany({ where: { category: 'AUDIO_RECORDING', hiddenAt: null }, select }),
    prisma.libraryItem.findMany({ where: { category: 'SHEET_MUSIC', hiddenAt: null }, select }),
  ]);
  const links = matchWorks(recordings as WorkItem[], scores as WorkItem[]);
  const key = (link: { recordingId: string; scoreId: string }) => `${link.recordingId}|${link.scoreId}`;
  const wanted = new Map(links.map((link) => [key(link), link]));
  const existing = await prisma.libraryWorkLink.findMany({ select: { recordingId: true, scoreId: true, rejectedAt: true } });
  const have = new Set(existing.map(key));
  const stale = existing.filter((link: any) => !link.rejectedAt && !wanted.has(key(link)));
  const fresh = links.filter((link) => !have.has(key(link)));
  await prisma.$transaction([
    ...stale.map((link: any) => prisma.libraryWorkLink.delete({ where: { recordingId_scoreId: { recordingId: link.recordingId, scoreId: link.scoreId } } })),
    prisma.libraryWorkLink.createMany({ data: fresh, skipDuplicates: true }),
  ]);
  const result = { links: links.length, added: fresh.length, removed: stale.length };
  logger.info(result, 'Library work links recomputed');
  return result;
}

// Fire-and-forget after imports; never lets a failure reach the caller.
export function relinkLibraryWorksSoon(prisma: PrismaClient): void {
  void relinkLibraryWorks(prisma).catch((error) => logger.warn({ error }, 'Library work links not recomputed'));
}
