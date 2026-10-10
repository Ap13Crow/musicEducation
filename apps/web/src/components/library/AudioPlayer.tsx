'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Repeat, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';

export interface AudioTrack {
  title: string;
  url: string;
  durationSeconds?: number | null;
}

const SPEEDS = [1, 1.25, 0.5, 0.75];
const SKIP_SECONDS = 10;

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return '–:––';
  const whole = Math.max(0, Math.floor(seconds));
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = String(whole % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// Mobile-first player for every Library recording (Gallica, Musopen, ...):
// one custom control surface instead of each browser's native bar - large
// touch targets (>= 44 px), a scrubber with a big thumb, ±10 s skips and
// speed/loop for practice, a tappable track list that auto-advances, and
// Media Session metadata so phone lock screens and headphones control it.
// The page heading already names the work, so the player only names the
// current track.
export function AudioPlayer({
  tracks,
  attribution,
  onProgress,
}: {
  tracks: AudioTrack[];
  attribution?: string | null;
  // Position across the whole recording (all tracks) for library XP.
  onProgress?: (update: { progress: number; length: number; playing: boolean }) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Every track's length as soon as it is known (metadata or source).
  const trackSeconds = useRef<Map<number, number>>(new Map());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [loop, setLoop] = useState(false);
  const [error, setError] = useState(false);
  const autoPlayNext = useRef(false);

  const track = tracks[Math.min(index, tracks.length - 1)];
  const speed = SPEEDS[speedIndex];
  const hasPrevious = index > 0;
  const hasNext = index < tracks.length - 1;

  const goTo = useCallback(
    (next: number, play: boolean) => {
      if (next < 0 || next >= tracks.length) return;
      autoPlayNext.current = play;
      setIndex(next);
    },
    [tracks.length],
  );

  // New track: reset the clock, keep the chosen speed, resume if asked.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(0);
    setDuration(track?.durationSeconds ?? null);
    setError(false);
    audio.playbackRate = speed;
    if (autoPlayNext.current) void audio.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setError(true));
    else audio.pause();
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, Math.min((audio.duration || Infinity) - 0.1, audio.currentTime + seconds));
  }

  // Lock screen / headphone / car controls on phones.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !track) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: attribution ?? undefined });
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ['play', () => void audioRef.current?.play()],
      ['pause', () => audioRef.current?.pause()],
      ['previoustrack', hasPrevious ? () => goTo(index - 1, true) : null],
      ['nexttrack', hasNext ? () => goTo(index + 1, true) : null],
      ['seekbackward', () => skip(-SKIP_SECONDS)],
      ['seekforward', () => skip(SKIP_SECONDS)],
    ];
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Not every browser supports every action.
      }
    }
  }, [track, attribution, index, hasPrevious, hasNext, goTo]);

  useEffect(() => {
    if (!onProgress || tracks.length === 0) return;
    const known = tracks.map((entry, position) => trackSeconds.current.get(position) ?? entry.durationSeconds ?? null);
    const measured = known.filter((value): value is number => value != null && value > 0);
    // Unknown tracks count as the average of the known ones.
    const average = measured.length ? measured.reduce((sum, value) => sum + value, 0) / measured.length : 0;
    const lengths = known.map((value) => (value != null && value > 0 ? value : average));
    const total = lengths.reduce((sum, value) => sum + value, 0);
    if (!total) return;
    const before = lengths.slice(0, index).reduce((sum, value) => sum + value, 0);
    onProgress({ progress: Math.min(1, (before + time) / total), length: Math.round(total), playing });
  }, [onProgress, tracks, index, time, playing, duration]);

  if (!track) return null;

  const iconButton =
    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent';
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <section className="card overflow-hidden p-0" aria-label="Recording player" data-testid="audio-player">
      <audio
        ref={audioRef}
        src={track.url}
        preload="metadata"
        loop={loop}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          event.currentTarget.playbackRate = speed;
          if (Number.isFinite(event.currentTarget.duration)) {
            setDuration(event.currentTarget.duration);
            trackSeconds.current.set(index, event.currentTarget.duration);
          }
        }}
        onEnded={() => (hasNext ? goTo(index + 1, true) : setPlaying(false))}
        onError={() => setError(true)}
      />

      <div className="px-4 pb-2 pt-4 sm:px-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {tracks.length > 1 ? `Track ${index + 1} of ${tracks.length}` : 'Recording'}
        </p>
        <p className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-gray-900">{track.title}</p>
      </div>

      <div className="px-4 sm:px-5">
        <input
          type="range"
          min={0}
          max={duration ?? 0}
          step={0.1}
          value={Math.min(time, duration ?? 0)}
          disabled={!duration}
          onChange={(event) => {
            const audio = audioRef.current;
            if (audio) audio.currentTime = Number(event.target.value);
          }}
          aria-label="Seek"
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          className="player-seek h-11 w-full cursor-pointer"
          style={{ ['--progress' as string]: `${progress}%` }}
        />
        <div className="-mt-2 flex justify-between text-xs tabular-nums text-gray-500">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 px-2 py-2 sm:gap-3">
        <button type="button" onClick={() => goTo(index - 1, playing)} disabled={!hasPrevious} aria-label="Previous track" className={iconButton}>
          <SkipBack className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => skip(-SKIP_SECONDS)} aria-label={`Back ${SKIP_SECONDS} seconds`} className={iconButton}>
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="mx-1 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700 active:scale-95"
        >
          {playing ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="ml-0.5 h-6 w-6" fill="currentColor" />}
        </button>
        <button type="button" onClick={() => skip(SKIP_SECONDS)} aria-label={`Forward ${SKIP_SECONDS} seconds`} className={iconButton}>
          <RotateCw className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => goTo(index + 1, playing)} disabled={!hasNext} aria-label="Next track" className={iconButton}>
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-2">
        <button
          type="button"
          onClick={() => setSpeedIndex((speedIndex + 1) % SPEEDS.length)}
          aria-label={`Playback speed ${speed}×, tap to change`}
          className={`h-11 min-w-[4.5rem] rounded-full px-4 text-sm font-semibold tabular-nums ${speed !== 1 ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {speed}×
        </button>
        <button
          type="button"
          onClick={() => setLoop(!loop)}
          aria-pressed={loop}
          aria-label="Loop this track"
          className={`inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${loop ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Repeat className="h-4 w-4" /> Loop
        </button>
      </div>

      {error && <p className="px-4 pb-3 text-center text-sm text-red-700">This recording couldn&rsquo;t be loaded. Try again shortly.</p>}

      {tracks.length > 1 && (
        <ol className="max-h-80 divide-y divide-gray-100 overflow-y-auto border-t border-gray-100" data-testid="audio-tracks">
          {tracks.map((item, position) => {
            const current = position === index;
            return (
              <li key={item.url}>
                <button
                  type="button"
                  onClick={() => (current ? togglePlay() : goTo(position, true))}
                  aria-current={current}
                  className={`flex min-h-[3rem] w-full items-center gap-3 px-4 py-2.5 text-left text-sm sm:px-5 ${current ? 'bg-primary-50/60 font-semibold text-primary-700' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'}`}
                >
                  <span className="w-6 shrink-0 text-right tabular-nums text-gray-400">
                    {current && playing ? <Pause className="ml-auto h-3.5 w-3.5 text-primary-600" fill="currentColor" /> : position + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.durationSeconds ? <span className="shrink-0 text-xs tabular-nums text-gray-400">{formatTime(item.durationSeconds)}</span> : null}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {attribution && <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 sm:px-5">{attribution}</p>}
    </section>
  );
}
