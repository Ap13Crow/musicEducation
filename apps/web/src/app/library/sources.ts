// Per-source outbound link label and credit line for library items.
export const SOURCE_LABELS: Record<string, { viewLabel: string; credit: string }> = {
  BNF: { viewLabel: 'View on Gallica', credit: 'Source: gallica.bnf.fr / Bibliothèque nationale de France' },
  OPENSCORE: { viewLabel: 'View on MuseScore', credit: 'Source: OpenScore (CC0)' },
  MUSOPEN: { viewLabel: 'View on the Internet Archive', credit: 'Source: Musopen (public domain)' },
  MUTOPIA: { viewLabel: 'View on Mutopia', credit: 'Source: Mutopia Project' },
};
