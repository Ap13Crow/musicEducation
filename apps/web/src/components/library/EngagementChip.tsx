'use client';

import { signIn } from 'next-auth/react';
import { BookOpen, CheckCircle2, Headphones } from 'lucide-react';
import type { Engagement, EngagementMode } from './useLibraryEngagement';

function minutes(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

// "Read to the end to earn 2 XP" - progress toward an item's library XP.
export function EngagementChip({ mode, enabled, state }: { mode: EngagementMode; enabled: boolean; state: Engagement | null }) {
  const Icon = mode === 'READ' ? BookOpen : Headphones;
  const verb = mode === 'READ' ? 'Read' : 'Listen';

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => void signIn('keycloak')}
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
      >
        <Icon className="h-3.5 w-3.5" /> Sign in to earn XP for {mode === 'READ' ? 'reading' : 'listening'}
      </button>
    );
  }

  if (state?.completed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
        <CheckCircle2 className="h-3.5 w-3.5" /> {mode === 'READ' ? 'Read' : 'Listened'} · +{state.xpAwarded} XP earned
      </span>
    );
  }

  const xp = state?.xpAvailable ?? 1;
  const timeShare = state ? Math.min(1, state.activeSeconds / Math.max(1, state.requiredSeconds)) : 0;
  // Both conditions count: reaching the end and spending the time.
  const overall = Math.round(Math.min(timeShare, state ? Math.min(1, state.progress / (mode === 'READ' ? 1 : 0.95)) : 0) * 100);
  return (
    <div
      className="inline-flex min-w-[14rem] flex-col gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900"
      title={state ? `${minutes(state.activeSeconds)} of ${minutes(state.requiredSeconds)} active time` : undefined}
    >
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Icon className="h-3.5 w-3.5" /> {verb} to the end to earn {xp} XP
      </span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100" aria-hidden>
        <span className="block h-full rounded-full bg-amber-500 transition-all" style={{ width: `${overall}%` }} />
      </span>
    </div>
  );
}
