export const EXTERNAL_EVENT_ATTENDANCE_XP = 40;

type ScoredEvent = {
  instruments?: string[] | null;
  musicStyles?: string[] | null;
  skillLevels?: string[] | null;
};

type ListenerProfile = {
  instruments?: string[] | null;
  musicStyles?: string[] | null;
  skillLevel?: string | null;
};

function normalizedSet(values: string[] | null | undefined): Set<string> {
  return new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function intersects(a: Set<string>, b: Set<string>): boolean {
  for (const value of a) {
    if (b.has(value)) return true;
  }
  return false;
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * Viewer-specific 1-10 match score for an external event. DeepSeek supplies
 * the event tags; this deterministic layer keeps "why this event" stable
 * and token/cost free for every page view and newsletter render.
 */
export function externalEventRecommendationScore(event: ScoredEvent, profile: ListenerProfile | null | undefined): number | null {
  const profileInstruments = normalizedSet(profile?.instruments);
  const profileStyles = normalizedSet(profile?.musicStyles);
  const profileSkill = profile?.skillLevel?.trim().toLowerCase() ?? '';

  if (profileInstruments.size === 0 && profileStyles.size === 0 && !profileSkill) return null;

  const eventInstruments = normalizedSet(event.instruments);
  const eventStyles = normalizedSet(event.musicStyles);
  const eventSkills = normalizedSet(event.skillLevels);

  let score = 3;
  if (profileInstruments.size > 0 && eventInstruments.size > 0) {
    score += intersects(profileInstruments, eventInstruments) ? 4 : -1;
  }
  if (profileStyles.size > 0 && eventStyles.size > 0) {
    score += intersects(profileStyles, eventStyles) ? 3 : -1;
  }
  if (profileSkill && eventSkills.size > 0) {
    score += eventSkills.has(profileSkill) ? 2 : 0;
  }

  // A tagged event is more useful than an unclassified row even before a
  // direct match; it can still be filtered, explained, and improved later.
  if (eventInstruments.size + eventStyles.size + eventSkills.size > 0) score += 1;

  return clampScore(score);
}
