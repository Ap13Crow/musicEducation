// Spotting the same work arriving from two sources (a Gallica scan and a
// DNB edition of one Schubert song) in the admin import. titleKey() is the
// exact normalisation of the database's generated LibraryItem."titleKey"
// column (deploy/database/identity/047-library-dnb-source.sql) - keep the
// two in step.

const FROM = 'àáâãäåāăąçćčďèéêëēėęěìíîïīįłñńňòóôõöøōőŕřśšşťùúûüūůűųýÿźżž';
const TO = 'aaaaaaaaacccdeeeeeeeeiiiiiilnnnoooooooorrssstuuuuuuuuyyzzz';
const FOLD = new Map([...FROM].map((char, index) => [char, TO[index]]));

export function titleKey(title: string): string {
  const main = title.normalize('NFC').split(' : ')[0].split(' / ')[0].toLowerCase();
  const folded = [...main].map((char) => FOLD.get(char) ?? char).join('');
  return folded.replace(/[^a-z0-9]+/g, ' ').trim();
}

// Name words long enough to mean something ("Liszt, Franz (1811-1886).
// Compositeur" and "Franz Liszt" share "liszt" and "franz").
export function creatorTokens(creator: string | null | undefined): Set<string> {
  if (!creator) return new Set();
  const folded = [...creator.normalize('NFC').toLowerCase()].map((char) => FOLD.get(char) ?? char).join('');
  const ignore = new Set(['compositeur', 'verfasser', 'composer', 'editeur', 'herausgeber', 'auteur', 'author']);
  return new Set(folded.split(/[^a-z]+/).filter((word) => word.length >= 3 && !ignore.has(word)));
}

// Same main title, and - when both name a creator - at least one shared name.
export function possiblySameWork(
  a: { title: string; creator?: string | null },
  b: { title: string; creator?: string | null },
): boolean {
  const key = titleKey(a.title);
  if (key.length < 3 || key !== titleKey(b.title)) return false;
  const left = creatorTokens(a.creator);
  const right = creatorTokens(b.creator);
  if (!left.size || !right.size) return true;
  return [...left].some((word) => right.has(word));
}
