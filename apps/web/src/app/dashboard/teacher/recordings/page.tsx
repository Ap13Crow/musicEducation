'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';
import { AudioLines, CheckCircle2, ExternalLink, Pencil, Trash2, Upload, X } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';
import { useIsAdmin } from '@/components/library/ShareBar';
import { INSTRUMENTS, MUSIC_STYLES } from '@/lib/musicVocabulary';

// Teachers and admins upload their own recordings to the public Library
// (API: lib/libraryRecordings.ts). Every recording is labelled (work,
// composer, performers), and one under copyright needs the uploader's
// confirmation that mymusic.coach may use it without limits. Teachers then
// present their recordings in courses (lesson Library references) and on
// event cards (Performance studio); admins may use every recording.

const RECORDING_FIELDS = `
  id title creator performers date description instruments musicStyles skillLevels
  license rightsHolder rightsGrantedAt ingestedAt
  uploadedBy { id name }
  files { label durationSeconds restored { profile } }
`;
const MY_RECORDINGS = gql`
  query MyLibraryRecordings {
    myLibraryRecordings { ${RECORDING_FIELDS} }
    libraryRecordingRightsGrant
    storageConfigured
  }
`;
const REQUEST_UPLOAD = gql`
  mutation RequestRecordingUpload($filename: String!, $contentType: String!) {
    requestUploadUrl(purpose: LIBRARY_RECORDING, filename: $filename, contentType: $contentType) { uploadUrl fileUrl }
  }
`;
const CREATE = gql`
  mutation CreateLibraryRecording($input: CreateLibraryRecordingInput!) {
    createLibraryRecording(input: $input) { id }
  }
`;
const UPDATE = gql`
  mutation UpdateLibraryRecording($id: ID!, $input: LibraryRecordingLabelsInput!) {
    updateLibraryRecording(id: $id, input: $input) { ${RECORDING_FIELDS} }
  }
`;
const DELETE = gql`
  mutation DeleteLibraryRecording($id: ID!) {
    deleteLibraryRecording(id: $id)
  }
`;

const MAX_FILE_BYTES = 150 * 1024 * 1024;
const LEVELS = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];
const levelLabel = (level: string) => level.charAt(0) + level.slice(1).toLowerCase();
// Browsers leave file.type empty for some formats (FLAC on Windows).
const TYPE_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', flac: 'audio/flac',
};
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave', 'audio/flac', 'audio/x-flac'];

function audioType(file: File): string | null {
  if (ALLOWED_TYPES.includes(file.type)) return file.type;
  return TYPE_BY_EXTENSION[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? null;
}

function trackTitle(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
}

function putFile(url: string, file: File, contentType: string, onProgress: (share: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    request.onload = () => (request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(request.responseText || `Upload failed (${request.status})`)));
    request.onerror = () => reject(new Error('Upload failed - check your connection and try again.'));
    request.send(file);
  });
}

type Labels = {
  title: string;
  composer: string;
  performers: string;
  date: string;
  description: string;
  instruments: string[];
  musicStyles: string[];
  skillLevels: string[];
  rightsHolder: string;
};
const EMPTY_LABELS: Labels = { title: '', composer: '', performers: '', date: '', description: '', instruments: [], musicStyles: [], skillLevels: [], rightsHolder: '' };

function labelsInput(labels: Labels) {
  return {
    title: labels.title.trim(),
    composer: labels.composer.trim(),
    performers: labels.performers.trim(),
    date: labels.date.trim() || null,
    description: labels.description.trim() || null,
    instruments: labels.instruments,
    musicStyles: labels.musicStyles,
    skillLevels: labels.skillLevels,
  };
}

function TagPicker({ label, options, value, onChange, format = (option: string) => option }: {
  label: string;
  options: string[];
  value: string[];
  onChange(next: string[]): void;
  format?: (option: string) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-gray-700">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((entry) => entry !== option) : [...value, option])}
              className={`rounded-full border px-3 py-1 text-sm ${on ? 'border-primary-500 bg-primary-50 font-medium text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function LabelFields({ labels, setLabels }: { labels: Labels; setLabels(next: Labels): void }) {
  const field = (key: keyof Labels) => ({
    value: labels[key] as string,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLabels({ ...labels, [key]: event.target.value }),
  });
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          Title of the work *
          <input required maxLength={300} className="input mt-1 w-full" placeholder="Nocturne in E-flat major, Op. 9 No. 2" {...field('title')} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Composer *
          <input required maxLength={200} className="input mt-1 w-full" placeholder="Frédéric Chopin (or “Traditional”)" {...field('composer')} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Performers *
          <input required maxLength={300} className="input mt-1 w-full" placeholder="Anna Muster, piano" {...field('performers')} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Recording date
          <input maxLength={40} className="input mt-1 w-full" placeholder="2025-06-14 or 2025" {...field('date')} />
        </label>
      </div>
      <TagPicker label="Instruments" options={INSTRUMENTS} value={labels.instruments} onChange={(instruments) => setLabels({ ...labels, instruments })} />
      <TagPicker label="Styles" options={MUSIC_STYLES} value={labels.musicStyles} onChange={(musicStyles) => setLabels({ ...labels, musicStyles })} />
      <TagPicker label="Level" options={LEVELS} value={labels.skillLevels} onChange={(skillLevels) => setLabels({ ...labels, skillLevels })} format={levelLabel} />
      <label className="block text-sm font-medium text-gray-700">
        About this recording
        <textarea maxLength={4000} rows={3} className="input mt-1 w-full" placeholder="Programme notes, venue, edition used…" {...field('description')} />
      </label>
    </div>
  );
}

function UploadForm({ grant, onDone }: { grant: string; onDone(itemId: string): void }) {
  const [labels, setLabels] = useState<Labels>(EMPTY_LABELS);
  const [files, setFiles] = useState<Array<{ file: File; title: string; contentType: string }>>([]);
  const [copyright, setCopyright] = useState<'PROTECTED' | 'PUBLIC_DOMAIN'>('PROTECTED');
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [requestUpload] = useMutation(REQUEST_UPLOAD);
  const [create] = useMutation(CREATE);

  function addFiles(list: FileList | null) {
    setError('');
    const added: typeof files = [];
    for (const file of Array.from(list ?? [])) {
      const contentType = audioType(file);
      if (!contentType) {
        setError(`${file.name}: please use MP3, M4A/AAC, WAV or FLAC.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is larger than 150 MB - please export it as MP3, M4A or FLAC.`);
        continue;
      }
      added.push({ file, title: trackTitle(file.name), contentType });
    }
    setFiles([...files, ...added]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (files.length === 0) return setError('Add at least one audio file.');
    if (copyright === 'PROTECTED' && !confirmed) return setError('Please confirm the rights grant below.');
    setBusy(true);
    try {
      const tracks = [];
      for (const [index, entry] of files.entries()) {
        const prefix = files.length > 1 ? `File ${index + 1} of ${files.length}: ` : '';
        setStatus(`${prefix}uploading…`);
        const { data } = await requestUpload({ variables: { filename: entry.file.name, contentType: entry.contentType } });
        await putFile(data.requestUploadUrl.uploadUrl, entry.file, entry.contentType, (share) => setStatus(`${prefix}uploading… ${Math.round(share * 100)}%`));
        tracks.push({ fileUrl: data.requestUploadUrl.fileUrl, label: files.length > 1 ? entry.title.trim() || null : null });
      }
      setStatus('Checking the audio and adding it to the Library…');
      const { data } = await create({
        variables: {
          input: {
            ...labelsInput(labels),
            tracks,
            copyright,
            rightsHolder: copyright === 'PROTECTED' ? labels.rightsHolder.trim() : null,
            rightsConfirmed: copyright === 'PROTECTED' ? confirmed : null,
          },
        },
      });
      setLabels(EMPTY_LABELS);
      setFiles([]);
      setConfirmed(false);
      setStatus('');
      onDone(data.createLibraryRecording.id);
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'The upload failed - please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-6 p-6" data-testid="recording-upload">
      <div>
        <h2 className="text-xl font-semibold">Upload a recording</h2>
        <p className="mt-1 text-sm text-gray-600">
          It appears in the public Library with the same player and noise-reduction choices as every other recording, and you can
          use it in your courses and on your events.
        </p>
      </div>

      <section className="space-y-3">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-600 hover:border-primary-300">
          <Upload className="h-6 w-6 text-primary-600" />
          <span><span className="font-medium text-primary-700">Choose audio files</span> - MP3, M4A/AAC, WAV or FLAC, up to 150 MB each</span>
          <span className="text-xs text-gray-500">Several files make one recording with several tracks (e.g. the movements of a sonata).</span>
          <input type="file" multiple accept=".mp3,.m4a,.aac,.wav,.flac,audio/*" className="sr-only" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
        </label>
        {files.length > 0 && (
          <ol className="space-y-2">
            {files.map((entry, index) => (
              <li key={`${entry.file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm">
                <AudioLines className="h-4 w-4 shrink-0 text-gray-400" />
                {files.length > 1 ? (
                  <input
                    aria-label={`Title of track ${index + 1}`}
                    className="input min-w-0 flex-1 py-1"
                    value={entry.title}
                    onChange={(event) => setFiles(files.map((other, position) => (position === index ? { ...other, title: event.target.value } : other)))}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate">{entry.file.name}</span>
                )}
                <span className="shrink-0 text-xs tabular-nums text-gray-400">{(entry.file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" aria-label="Remove file" onClick={() => setFiles(files.filter((_, position) => position !== index))} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <LabelFields labels={labels} setLabels={setLabels} />

      <fieldset className="space-y-3 rounded-xl border border-gray-200 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-800">Copyright</legend>
        <label className="flex gap-3 text-sm">
          <input type="radio" name="copyright" checked={copyright === 'PROTECTED'} onChange={() => setCopyright('PROTECTED')} className="mt-1" />
          <span>
            <span className="font-medium text-gray-900">Protected by copyright</span>
            <span className="block text-gray-600">
              Almost every recording made in the last 70 years - including your own performance of a piece by Bach.
            </span>
          </span>
        </label>
        <label className="flex gap-3 text-sm">
          <input type="radio" name="copyright" checked={copyright === 'PUBLIC_DOMAIN'} onChange={() => setCopyright('PUBLIC_DOMAIN')} className="mt-1" />
          <span>
            <span className="font-medium text-gray-900">Public domain</span>
            <span className="block text-gray-600">Neither the music nor this recording is protected any more (for example a historic recording).</span>
          </span>
        </label>
        {copyright === 'PROTECTED' && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <label className="block text-sm font-medium text-gray-700">
              Rights holder *
              <input required maxLength={200} className="input mt-1 w-full" placeholder="Your name, ensemble or label" value={labels.rightsHolder} onChange={(event) => setLabels({ ...labels, rightsHolder: event.target.value })} />
            </label>
            <p className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700" data-testid="rights-grant">{grant}</p>
            <label className="flex gap-3 text-sm font-medium text-gray-900">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5" />
              I confirm this and grant mymusic.coach these rights.
            </label>
          </div>
        )}
      </fieldset>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {status && <p className="text-sm text-gray-600">{status}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Uploading…' : 'Upload to the Library'}
      </button>
    </form>
  );
}

function EditDialog({ recording, onClose }: { recording: any; onClose(): void }) {
  const [labels, setLabels] = useState<Labels>({
    title: recording.title ?? '',
    composer: recording.creator ?? '',
    performers: recording.performers ?? '',
    date: recording.date ?? '',
    description: recording.description ?? '',
    instruments: recording.instruments ?? [],
    musicStyles: recording.musicStyles ?? [],
    skillLevels: recording.skillLevels ?? [],
    rightsHolder: recording.rightsHolder ?? '',
  });
  const [update, { loading, error }] = useMutation(UPDATE);
  const isProtected = Boolean(recording.rightsGrantedAt);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await update({ variables: { id: recording.id, input: { ...labelsInput(labels), rightsHolder: isProtected ? labels.rightsHolder.trim() : null } } });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" role="dialog" aria-label="Edit recording">
      <form onSubmit={save} className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-semibold">Edit recording</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-4">
          <LabelFields labels={labels} setLabels={setLabels} />
          {isProtected && (
            <label className="block text-sm font-medium text-gray-700">
              Rights holder *
              <input required maxLength={200} className="input mt-1 w-full" value={labels.rightsHolder} onChange={(event) => setLabels({ ...labels, rightsHolder: event.target.value })} />
            </label>
          )}
          {error && <p className="text-sm text-red-700">{error.message}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 p-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

function restorationState(recording: any): string {
  const audio = recording.files ?? [];
  if (audio.length === 0) return '';
  return audio.every((file: any) => file.restored) ? 'Noise reduction ready' : 'Noise reduction being prepared';
}

function RecordingsPage() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, error, refetch } = useQuery(MY_RECORDINGS, { fetchPolicy: 'cache-and-network' });
  const [remove] = useMutation(DELETE);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const recordings: any[] = useMemo(() => data?.myLibraryRecordings ?? [], [data]);
  const [editing, setEditing] = useState<any | null>(null);

  // /dashboard/teacher/recordings?edit=<id> - the item page's "Edit" link.
  useEffect(() => {
    const id = params.get('edit');
    if (!id || editing) return;
    const recording = recordings.find((entry) => entry.id === id);
    if (recording) setEditing(recording);
  }, [params, recordings, editing]);

  async function deleteRecording(recording: any) {
    if (!confirm(`Delete “${recording.title}”? It disappears from the Library and from every course and event that uses it.`)) return;
    await remove({ variables: { id: recording.id } });
    await refetch();
  }

  return (
    <main className="mx-auto box-content max-w-4xl space-y-8 px-6 py-10">
      <div>
        <Link href="/dashboard/teacher" className="text-sm text-primary-700">← Teacher workspace</Link>
        <p className="mt-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">Library</p>
        <h1 className="mt-3 font-serif text-3xl font-bold">My recordings</h1>
        <p className="mt-2 text-gray-600">
          Share your own recordings in the public Library, then use them in your courses and on your events.
          {isAdmin && ' As an admin you see every teacher’s uploads.'}
        </p>
      </div>

      {data && !data.storageConfigured && <p className="card p-4 text-sm text-amber-700">Uploads are not configured on this deployment yet.</p>}
      {justAdded && (
        <p className="card flex items-center gap-2 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5" /> Your recording is in the Library.
          <Link href={`/library/${justAdded}`} className="font-medium text-primary-700 underline">Open it</Link>
          <span className="text-gray-500">- the noise-reduction versions follow within the hour.</span>
        </p>
      )}
      {data?.storageConfigured && (
        <UploadForm
          grant={data.libraryRecordingRightsGrant}
          onDone={(id) => {
            setJustAdded(id);
            void refetch();
          }}
        />
      )}

      <section className="card p-6" data-testid="recording-list">
        <h2 className="text-xl font-semibold">{isAdmin ? 'Uploaded recordings' : 'Your recordings'}</h2>
        {error && <p className="mt-3 text-sm text-red-700">{error.message}</p>}
        {loading && !data && <p className="mt-3 text-sm text-gray-500">Loading…</p>}
        {data && recordings.length === 0 && <p className="mt-3 text-sm text-gray-500">No recordings yet - upload your first one above.</p>}
        <ul className="mt-4 divide-y divide-gray-100">
          {recordings.map((recording) => (
            <li key={recording.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{recording.title}</p>
                <p className="text-sm text-gray-600">{[recording.creator, recording.performers, recording.date].filter(Boolean).join(' · ')}</p>
                <p className="text-xs text-gray-500">
                  {[
                    `${recording.files.length} ${recording.files.length === 1 ? 'track' : 'tracks'}`,
                    recording.rightsGrantedAt ? `© ${recording.rightsHolder} - rights granted ${new Date(recording.rightsGrantedAt).toLocaleDateString()}` : 'Public domain',
                    restorationState(recording),
                    isAdmin && recording.uploadedBy ? `by ${recording.uploadedBy.name}` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/library/${recording.id}`} className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm text-primary-700 hover:bg-primary-50">
                  <ExternalLink className="h-4 w-4" /> Open
                </Link>
                <button type="button" onClick={() => setEditing(recording)} className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm text-gray-700 hover:bg-gray-100">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button type="button" onClick={() => void deleteRecording(recording)} aria-label={`Delete ${recording.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {editing && (
        <EditDialog
          recording={editing}
          onClose={() => {
            setEditing(null);
            if (params.get('edit')) router.replace('/dashboard/teacher/recordings');
          }}
        />
      )}
    </main>
  );
}

export default function TeacherRecordingsPage() {
  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher/recordings">
      <Suspense fallback={null}>
        <RecordingsPage />
      </Suspense>
    </RoleGate>
  );
}
