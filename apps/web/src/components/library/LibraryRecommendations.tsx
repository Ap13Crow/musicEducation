'use client';

import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { Sparkles } from 'lucide-react';
import { CARD_FIELDS, LibraryCard } from './LibraryCards';
import { useItemStates } from './LibraryCollections';

// "Recommended for you" above the Library catalogue - picks from the user's
// profile (instruments, styles, level) and reading history, each with the
// reason it was picked (API: lib/libraryRecommendations.ts).

const RECOMMENDED = gql`
  query RecommendedLibraryItems($limit: Int) {
    recommendedLibraryItems(limit: $limit) {
      score
      reasons
      item { ${CARD_FIELDS} }
    }
  }
`;

export function LibraryRecommendations() {
  const { data, loading } = useQuery(RECOMMENDED, { variables: { limit: 6 }, fetchPolicy: 'cache-and-network' });
  const picks: any[] = data?.recommendedLibraryItems ?? [];
  useItemStates(picks.map((pick) => pick.item.id));
  if (loading && !data) return null;

  if (!picks.length) {
    return (
      <p className="mb-8 rounded-xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm text-gray-700">
        <Sparkles className="mr-1.5 inline h-4 w-4 text-primary-600" />
        Personal recommendations appear here once we know what you play -{' '}
        <Link href="/dashboard/profile" className="font-medium text-primary-700 underline">add your instruments and music styles</Link>, or
        star and read a few pieces.
      </p>
    );
  }

  return (
    <section className="mb-10" aria-labelledby="library-recommended">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary-600" />
        <h2 id="library-recommended" className="text-2xl font-bold">Recommended for you</h2>
      </div>
      <p className="mb-4 max-w-3xl text-sm text-gray-600">From your instruments, music styles and level, and from what you have been reading and listening to.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {picks.map((pick) => (
          <LibraryCard key={pick.item.id} item={pick.item} note={pick.reasons.join(' · ')} />
        ))}
      </div>
    </section>
  );
}
