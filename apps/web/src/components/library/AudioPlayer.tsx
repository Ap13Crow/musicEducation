'use client';

import { useEffect, useRef, useState } from 'react';
import { Repeat, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const SPEEDS = [0.5, 0.75, 1, 1.25];

// Player for library recordings. Only ever given a URL we're allowed to
// serve (our own routes), never a Gallica master directly. Native controls
// keep keyboard, media-key and screen-reader support; on top of them:
// practice speed (pitch preserved by the browser), loop, and prev/next for
// playlists (GallicaViewer's track list).
export function AudioPlayer({
  url,
  title,
  attribution,
  autoPlay = false,
  onEnded,
  onPrevious,
  onNext,
}: {
  url: string;
  title: string;
  attribution?: string | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);

  // A new track resets the element's rate, so re-apply the chosen one.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, url]);

  return (
    <section className="card p-4" aria-label={`Recording: ${title}`} data-testid="audio-player">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800">
        <Volume2 className="h-4 w-4 shrink-0 text-primary-600" /> <span className="truncate">{title}</span>
      </p>
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={url}
        autoPlay={autoPlay}
        loop={loop}
        onLoadedMetadata={(event) => (event.currentTarget.playbackRate = speed)}
        onEnded={() => !loop && onEnded?.()}
        className="w-full"
      >
        Your browser can&rsquo;t play this recording.
      </audio>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {onPrevious && (
          <button type="button" onClick={onPrevious} aria-label="Previous track" className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100">
            <SkipBack className="h-4 w-4" />
          </button>
        )}
        {onNext && (
          <button type="button" onClick={onNext} aria-label="Next track" className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100">
            <SkipForward className="h-4 w-4" />
          </button>
        )}
        <label className="flex items-center gap-1 text-gray-600">
          Speed
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="rounded-md border border-gray-300 px-1.5 py-0.5 text-sm"
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value}>{value}×</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setLoop(!loop)}
          aria-pressed={loop}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${loop ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Repeat className="h-4 w-4" /> Loop
        </button>
      </div>
      {attribution && <p className="mt-2 text-xs text-gray-400">{attribution}</p>}
    </section>
  );
}
