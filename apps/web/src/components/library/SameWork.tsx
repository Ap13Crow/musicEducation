'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useMutation } from '@apollo/client';
import { FileMusic, Headphones } from 'lucide-react';

// The same work in the other form (API: lib/libraryWorkLinks.ts) - a
// recording's scores, a score's recordings - right under the item's title,
// so nobody has to search the Library for them. Admins can take a wrong
// pair out ("Not this work"); it stays out on every later recompute.

export const SAME_WORK_FIELDS = `
  sameWorkScores { id title creator date source }
  sameWorkRecordings { id title creator date source }
`;

const REJECT = gql`
  mutation RejectLibraryWorkLink($recordingId: ID!, $scoreId: ID!) {
    rejectLibraryWorkLink(recordingId: $recordingId, scoreId: $scoreId)
  }
`;

const SOURCE_NAMES: Record<string, string> = {
  BNF: 'Gallica', OPENSCORE: 'OpenScore', MUSOPEN: 'Musopen', MUTOPIA: 'Mutopia', DNB: 'DNB', INTERNET_ARCHIVE: 'Great 78 Project', EUROPEANA: 'Europeana', UPLOAD: 'mymusic.coach',
};

type Linked = { id: string; title: string; creator?: string | null; date?: string | null; source: string };

export function SameWork({ item, isAdmin }: { item: { id: string; category: string; sameWorkScores?: Linked[]; sameWorkRecordings?: Linked[] }; isAdmin: boolean }) {
  const isRecording = item.category === 'AUDIO_RECORDING';
  const linked = (isRecording ? item.sameWorkScores : item.sameWorkRecordings) ?? [];
  const [removed, setRemoved] = useState<string[]>([]);
  const [reject, { loading }] = useMutation(REJECT);
  const shown = linked.filter((other) => !removed.includes(other.id));
  if (!shown.length) return null;

  const Icon = isRecording ? FileMusic : Headphones;
  const heading = isRecording
    ? shown.length === 1 ? 'Score of this work' : 'Scores of this work'
    : shown.length === 1 ? 'Recording of this work' : 'Recordings of this work';

  return (
    <section className="card p-4" data-testid="library-same-work" aria-labelledby="same-work-heading">
      <h2 id="same-work-heading" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" /> {heading}
      </h2>
      <ul className="divide-y divide-gray-100">
        {shown.map((other) => (
          <li key={other.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
            <Link href={`/library/${other.id}`} className="min-w-0 flex-1 hover:text-primary-700">
              <span className="block truncate font-medium text-gray-900">{other.title}</span>
              <span className="block truncate text-xs text-gray-500">
                {[other.creator, other.date, SOURCE_NAMES[other.source] ?? other.source].filter(Boolean).join(' · ')}
              </span>
            </Link>
            <Link
              href={`/library/${other.id}`}
              className="inline-flex min-h-[2.25rem] items-center rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700"
            >
              {isRecording ? 'Open score' : 'Listen'}
            </Link>
            {isAdmin && (
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  const variables = isRecording ? { recordingId: item.id, scoreId: other.id } : { recordingId: other.id, scoreId: item.id };
                  await reject({ variables });
                  setRemoved((current) => [...current, other.id]);
                }}
                className="text-xs text-gray-500 underline hover:text-red-700 disabled:opacity-50"
                title="Admin: this is a different work - remove the link for good"
              >
                Not this work
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
