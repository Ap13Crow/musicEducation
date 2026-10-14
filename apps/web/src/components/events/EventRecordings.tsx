'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Headphones, Plus, Trash2 } from 'lucide-react';
import { AudioPlayer, type AudioTrack } from '@/components/library/AudioPlayer';

// Library recordings on a platform event (API: resolvers/libraryRecordings.ts):
// the publisher picks them in the Performance studio, visitors play them on
// the event's card. A teacher may present the open Library and their own
// uploads, an admin every recording.

export const EVENT_RECORDING_FIELDS = `
  recordings {
    id
    item {
      id title creator documentType
      files { label url contentType durationSeconds restored { mild medium strong profile } }
    }
  }
`;

const CHOICES = gql`
  query TeachingRecordings($query: String) {
    teachingRecordings(query: $query, limit: 20) { id title creator documentType source }
  }
`;
const ADD = gql`
  mutation AddEventRecording($eventId: ID!, $itemId: ID!) {
    addEventRecording(eventId: $eventId, itemId: $itemId) { id }
  }
`;
const REMOVE = gql`
  mutation RemoveEventRecording($id: ID!) {
    removeEventRecording(id: $id)
  }
`;

type EventRecording = { id: string; item: { id: string; title: string; creator?: string | null; documentType?: string | null; files: any[] } };

export function EventRecordingsEditor({ eventId, recordings, onChange }: { eventId: string; recordings: EventRecording[]; onChange(): void }) {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading } = useQuery(CHOICES, { variables: { query: query || null }, fetchPolicy: 'cache-and-network' });
  const [add, { error: addError }] = useMutation(ADD);
  const [remove] = useMutation(REMOVE);
  const attached = new Set(recordings.map((recording) => recording.item.id));
  const choices: any[] = (data?.teachingRecordings ?? []).filter((item: any) => !attached.has(item.id));

  return (
    <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-3 text-sm" data-testid="event-recordings-editor">
      <p className="font-medium text-gray-800">Recordings on this event</p>
      {recordings.length === 0 && <p className="text-gray-500">None yet - visitors can listen to the recordings you add here.</p>}
      <ul className="space-y-1">
        {recordings.map((recording) => (
          <li key={recording.id} className="flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <span className="min-w-0 flex-1 truncate">
              {recording.item.title}
              {recording.item.creator && <span className="text-gray-500"> · {recording.item.creator}</span>}
            </span>
            <button
              type="button"
              aria-label={`Remove ${recording.item.title}`}
              onClick={async () => {
                await remove({ variables: { id: recording.id } });
                onChange();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(draft.trim());
        }}
        className="flex gap-2"
      >
        <input className="input min-w-0 flex-1" placeholder="Search your recordings and the Library" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button type="submit" className="btn-primary">Search</button>
      </form>
      {loading && !data && <p className="text-gray-500">Loading…</p>}
      {data && choices.length === 0 && (
        <p className="text-gray-500">
          {query ? 'No recordings match.' : <>Your uploaded recordings show here - <Link href="/dashboard/teacher/recordings" className="text-primary-700 underline">upload one</Link>, or search the Library.</>}
        </p>
      )}
      <ul className="space-y-1">
        {choices.map((item) => (
          <li key={item.id} className="flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.title}</span>
              <span className="block truncate text-xs text-gray-500">
                {[item.creator, item.documentType, item.source === 'UPLOAD' ? 'Uploaded recording' : null].filter(Boolean).join(' · ')}
              </span>
            </span>
            <button
              type="button"
              onClick={async () => {
                await add({ variables: { eventId, itemId: item.id } });
                onChange();
              }}
              className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-primary-700 hover:bg-primary-50"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </li>
        ))}
      </ul>
      {addError && <p className="text-red-700">{addError.message}</p>}
    </div>
  );
}

// One player for all of an event's recordings, opened on request so a list
// of event cards doesn't load audio for every card.
export function EventRecordingsPlayer({ recordings }: { recordings: EventRecording[] }) {
  const [open, setOpen] = useState(false);
  const tracks: AudioTrack[] = recordings.flatMap((recording) => {
    const audio = recording.item.files.filter((file) => file.contentType.startsWith('audio/'));
    return audio.map((file) => ({
      title: audio.length > 1 ? `${recording.item.title} – ${file.label}` : recording.item.title,
      url: file.url,
      durationSeconds: file.durationSeconds,
      restored: file.restored,
    }));
  });
  if (tracks.length === 0) return null;
  return (
    <div className="mt-4" data-testid="event-recordings">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-700"
      >
        <Headphones className="h-4 w-4" /> {open ? 'Hide recordings' : `Listen · ${tracks.length} ${tracks.length === 1 ? 'recording' : 'recordings'}`}
      </button>
      {open && (
        <div className="mt-3">
          <AudioPlayer tracks={tracks} />
          <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-500">
            {recordings.map((recording) => (
              <Link key={recording.id} href={`/library/${recording.item.id}`} className="hover:text-primary-700">
                {recording.item.title} in the Library →
              </Link>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
