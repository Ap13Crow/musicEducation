'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';

// Reports reading/listening progress on a Library item page so signed-in
// users earn library XP (rules: apps/api/src/lib/libraryEngagement.ts).
// Viewers call report() with where the reader is; this hook sends a
// heartbeat every 15 s while the reader is actually active - for reading,
// tab visible and some scroll/tap/key in the last minute; for listening,
// audio playing (background listening counts). The server credits time
// from heartbeat spacing, so nothing here can speed up earning.

export type EngagementMode = 'READ' | 'LISTEN';

export type Engagement = {
  mode: EngagementMode;
  activeSeconds: number;
  requiredSeconds: number;
  progress: number;
  completed: boolean;
  xpAwarded: number;
  xpAvailable: number;
};

const FIELDS = 'itemId mode activeSeconds requiredSeconds progress length completed xpAwarded xpAvailable';
const MY_ENGAGEMENT = gql`
  query MyLibraryEngagement($itemId: ID!) { myLibraryEngagement(itemId: $itemId) { ${FIELDS} } }
`;
const RECORD = gql`
  mutation RecordLibraryEngagement($input: LibraryEngagementInput!) { recordLibraryEngagement(input: $input) { ${FIELDS} } }
`;

const HEARTBEAT_MS = 15_000;
const READ_IDLE_MS = 60_000;

export function useLibraryEngagement(itemId: string | null, mode: EngagementMode | null) {
  const { status } = useSession();
  const enabled = status === 'authenticated' && Boolean(itemId && mode);
  const { data } = useQuery(MY_ENGAGEMENT, { variables: { itemId }, skip: !enabled, fetchPolicy: 'network-only' });
  const [record] = useMutation(RECORD);
  const [state, setState] = useState<Engagement | null>(null);

  const position = useRef({ progress: 0, length: 1, playing: false });
  const lastInteraction = useRef(Date.now());
  const sentThisVisit = useRef(false);
  const completed = useRef(false);

  useEffect(() => {
    const row = data?.myLibraryEngagement?.find((entry: Engagement) => entry.mode === mode);
    if (row) {
      setState(row);
      completed.current = row.completed;
    }
  }, [data, mode]);

  const send = useCallback(
    async (active: boolean) => {
      if (!enabled || completed.current) return;
      // The first heartbeat of a visit only starts the clock - time since
      // a previous visit is never credited.
      const credit = active && sentThisVisit.current;
      sentThisVisit.current = true;
      try {
        const result = await record({
          variables: {
            input: {
              itemId,
              mode,
              progress: position.current.progress,
              length: Math.max(1, Math.round(position.current.length)),
              active: credit,
            },
          },
        });
        const next = result.data?.recordLibraryEngagement;
        if (next) {
          setState(next);
          completed.current = next.completed;
        }
      } catch {
        // A missed heartbeat only delays credit; the next one catches up.
      }
    },
    [enabled, itemId, mode, record],
  );

  const isActive = useCallback(() => {
    if (mode === 'LISTEN') return position.current.playing;
    return document.visibilityState === 'visible' && Date.now() - lastInteraction.current < READ_IDLE_MS;
  }, [mode]);

  useEffect(() => {
    if (!enabled) return;
    const touch = () => {
      lastInteraction.current = Date.now();
    };
    const events = ['scroll', 'wheel', 'pointerdown', 'keydown', 'touchstart'] as const;
    for (const name of events) window.addEventListener(name, touch, { passive: true, capture: true });
    const timer = window.setInterval(() => {
      if (isActive()) void send(true);
    }, HEARTBEAT_MS);
    return () => {
      for (const name of events) window.removeEventListener(name, touch, { capture: true });
      window.clearInterval(timer);
    };
  }, [enabled, isActive, send]);

  // Viewers call this on every page turn / scroll / playback tick.
  const report = useCallback(
    (update: { progress: number; length: number; playing?: boolean }) => {
      const previous = position.current;
      position.current = {
        progress: Math.max(previous.progress, Math.min(1, Math.max(0, update.progress))),
        length: Math.max(1, update.length || 1),
        playing: update.playing ?? previous.playing,
      };
      lastInteraction.current = Date.now();
      // Start the clock as soon as the reader is really engaged.
      if (!sentThisVisit.current && (mode === 'READ' || position.current.playing)) void send(false);
    },
    [mode, send],
  );

  return { enabled, state, report };
}
