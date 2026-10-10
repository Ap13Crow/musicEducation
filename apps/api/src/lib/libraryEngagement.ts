// Rules for Library reading/listening XP. The client only reports where the
// reader is (furthest page / playback position) and how long the work is;
// the server credits time itself from the spacing of heartbeats, so a
// script can't fast-forward its way to points.

export type EngagementMode = 'READ' | 'LISTEN';

// The web client sends a heartbeat every 15 s while the reader is active.
export const HEARTBEAT_SECONDS = 15;
// Most time one heartbeat can credit (a little slack for timer drift).
export const MAX_CREDIT_SECONDS = 20;
const MIN_REQUIRED_SECONDS = 30;
// Reading a page takes at least this long on average.
const SECONDS_PER_PAGE = 15;
// Share of a recording that must actually be played.
const LISTEN_SHARE = 0.85;
// "Long" works earn 2 XP instead of 1.
const LONG_READ_PAGES = 10;
const LONG_LISTEN_SECONDS = 10 * 60;
// Sanity bounds on a client-reported length.
const MAX_PAGES = 2000;
const MAX_SECONDS = 10 * 60 * 60;

export function clampLength(mode: EngagementMode, length: number): number {
  const max = mode === 'READ' ? MAX_PAGES : MAX_SECONDS;
  return Math.max(1, Math.min(max, Math.round(Number.isFinite(length) ? length : 1)));
}

export function requiredSeconds(mode: EngagementMode, length: number): number {
  const needed = mode === 'READ' ? length * SECONDS_PER_PAGE : Math.ceil(length * LISTEN_SHARE);
  return Math.max(MIN_REQUIRED_SECONDS, needed);
}

export function xpForLength(mode: EngagementMode, length: number): number {
  return (mode === 'READ' ? length > LONG_READ_PAGES : length >= LONG_LISTEN_SECONDS) ? 2 : 1;
}

// Reading counts once the last page was shown; listening once playback got
// into the final 5 % (the closing seconds are often silence).
export function reachedEnd(mode: EngagementMode, progress: number): boolean {
  return mode === 'READ' ? progress >= 0.999 : progress >= 0.95;
}

// Seconds credited for this heartbeat: the real time since the previous one,
// capped - never what the client claims.
export function creditedSeconds(lastHeartbeatAt: Date | null, now: Date, active: boolean): number {
  if (!active || !lastHeartbeatAt) return 0;
  const elapsed = (now.getTime() - lastHeartbeatAt.getTime()) / 1000;
  return Math.max(0, Math.min(MAX_CREDIT_SECONDS, Math.floor(elapsed)));
}

export function isComplete(mode: EngagementMode, progress: number, activeSeconds: number, length: number): boolean {
  return reachedEnd(mode, progress) && activeSeconds >= requiredSeconds(mode, length);
}
