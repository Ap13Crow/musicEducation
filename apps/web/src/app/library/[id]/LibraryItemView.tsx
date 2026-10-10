'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { ScoreViewer } from '@/components/library/ScoreViewer';
import { AudioPlayer } from '@/components/library/AudioPlayer';
import { GallicaViewer } from '@/components/library/GallicaViewer';
import { GallicaEmbed } from '@/components/library/GallicaEmbed';
import { PdfViewer } from '@/components/library/PdfViewer';
import { CopyLinkButton, QrCodeButton, ShareBar, useIsAdmin } from '@/components/library/ShareBar';
import { SOURCE_LABELS } from '../sources';

const GET_LIBRARY_ITEM = gql`
  query GetLibraryItem($id: ID!) {
    libraryItem(id: $id) {
      id shortId shareUrl source category title creator date documentType permalink catalogueUrl
      scoreUrl pagesUrl embedUrl audioUrl license attribution
      files { label url contentType durationSeconds shareUrl }
    }
  }
`;

export default function LibraryItemView() {
  const isAdmin = useIsAdmin();
  const params = useParams();
  const id = params.id as string;
  const { data, loading, error } = useQuery(GET_LIBRARY_ITEM, { variables: { id } });
  const item = data?.libraryItem;
  const source = item ? SOURCE_LABELS[item.source] ?? SOURCE_LABELS.BNF : null;
  const files: any[] = item?.files ?? [];
  // 1-based position in item.files - the <n> of the file's /l/<shortId>/<n> link.
  const pdfFiles = files
    .map((file, index) => ({ ...file, number: index + 1 }))
    .filter((file) => file.contentType === 'application/pdf');
  const audioTracks = [
    ...(item?.audioUrl ? [{ title: item.title, url: item.audioUrl }] : []),
    ...files
      .filter((file) => file.contentType.startsWith('audio/'))
      .map((file) => ({ title: file.label, url: file.url, durationSeconds: file.durationSeconds })),
  ];

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/library" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Library
        </Link>

        {loading && !item && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-700">This item couldn&rsquo;t be loaded. Please try again shortly.</p>}
        {!loading && !error && !item && <p className="text-sm text-gray-600">This library item doesn&rsquo;t exist or was removed.</p>}

        {item && source && (
          <>
            <header>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{item.title}</h1>
              <p className="mt-2 text-gray-600">
                {[item.creator, item.date, item.documentType].filter(Boolean).join(' · ')}
              </p>
              <div className="mt-4">
                <ShareBar itemId={item.id} shareUrl={item.shareUrl} title={item.title} />
              </div>
            </header>

            {audioTracks.length > 0 && <AudioPlayer tracks={audioTracks} attribution={item.attribution} />}

            {item.scoreUrl && <ScoreViewer url={item.scoreUrl} title={item.title} />}
            {item.pagesUrl && (
              <GallicaViewer
                pagesUrl={item.pagesUrl}
                title={item.title}
                audio={item.category === 'AUDIO_RECORDING'}
                fallbackEmbedUrl={item.embedUrl}
              />
            )}
            {!item.pagesUrl && item.embedUrl && (
              <GallicaEmbed url={item.embedUrl} title={item.title} audio={item.category === 'AUDIO_RECORDING'} />
            )}

            {/* No engraved MusicXML: show the first PDF score inline. */}
            {!item.scoreUrl && pdfFiles.length > 0 && <PdfViewer url={pdfFiles[0].url} title={item.title} />}

            {pdfFiles.length > 0 && (
              <section className="card p-4" data-testid="library-files">
                <h2 className="mb-2 text-sm font-semibold text-gray-800">Scores and parts</h2>
                <ul className="flex flex-wrap gap-2">
                  {pdfFiles.map((file: any) => (
                    <li key={file.url} className="flex items-center gap-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700"
                      >
                        <FileText className="h-4 w-4" /> {file.label}
                      </a>
                      <CopyLinkButton url={file.shareUrl} label="Link" />
                      {isAdmin && (
                        <QrCodeButton itemId={item.id} fileNumber={file.number} shareUrl={file.shareUrl} title={`${item.title} – ${file.label}`} compact />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!item.scoreUrl && !item.pagesUrl && !item.embedUrl && audioTracks.length === 0 && pdfFiles.length === 0 && (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                This item can&rsquo;t be shown here yet - open it at the source below.
              </p>
            )}

            <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm">
              <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-800">
                {source.viewLabel} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {item.catalogueUrl && (
                <a href={item.catalogueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900">
                  Catalogue record <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <span className="text-xs text-gray-400">
                {item.attribution ?? source.credit}
                {item.license ? ` · ${item.license}` : ''}
              </span>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
