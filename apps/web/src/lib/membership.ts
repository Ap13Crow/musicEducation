// Shared "years/months teaching on MyMusic.Coach" formatting, calculated
// from TeacherProfile.memberSince (profile creation = approval time - see
// reviewTeacherApplication). Used on the teacher's own profile editor, the
// /teachers directory cards, and the public teacher profile page, so the
// definition and wording stay identical everywhere it's shown.
export function monthsSince(dateIso: string): number {
  const then = new Date(dateIso);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth()));
}

export function membershipLabel(dateIso: string, opts: { compact?: boolean } = {}): string {
  const months = monthsSince(dateIso);
  if (months < 1) return opts.compact ? 'New' : 'Joined this month';
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) {
    return opts.compact ? `${months} mo on MyMusic.Coach` : `${months} month${months === 1 ? '' : 's'} teaching on MyMusic.Coach`;
  }
  const monthPart = remMonths > 0 ? ` ${remMonths} mo` : '';
  return opts.compact ? `${years} yr${monthPart} on MyMusic.Coach` : `${years} yr${monthPart} teaching on MyMusic.Coach`;
}
