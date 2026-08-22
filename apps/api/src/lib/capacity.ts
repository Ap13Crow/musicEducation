import { GraphQLError } from 'graphql';
import type { Prisma } from '@my-music-coach/database';

/**
 * Enforces a teacher's per-instrument active-student capacity at the
 * moment a booking actually becomes CONFIRMED (not at request time - a
 * PENDING/held request doesn't consume a seat, matching "enforce capacity
 * transactionally when accepting a new teacher-student relationship, not
 * merely when rendering the directory"). Call this INSIDE the same
 * transaction that flips the booking to CONFIRMED, before that write.
 *
 * Row-locks the TeacherInstrumentCapacity row (if one exists) for the rest
 * of the transaction via SELECT ... FOR UPDATE, so two concurrent
 * confirmations for the same (teacher, instrument) can't both read "one
 * seat left" and both take it - the second one blocks until the first
 * commits, then re-reads the now-current count.
 *
 * No-ops (nothing to enforce) when: no instrument on the booking, no
 * capacity row configured for it, or maxActiveStudents is null
 * (unlimited). An explicit 0 is a real cap and is enforced like any other
 * number - it is never treated as "no cap set."
 */
export async function reserveInstrumentCapacity(
  tx: Prisma.TransactionClient,
  teacherProfileId: string,
  instrument: string | null | undefined,
  studentUserId: string,
): Promise<void> {
  if (!instrument) return;

  const locked = await tx.$queryRaw<{ id: string; maxActiveStudents: number | null }[]>`
    SELECT "id", "maxActiveStudents" FROM "TeacherInstrumentCapacity"
    WHERE "teacherProfileId" = ${teacherProfileId} AND "instrument" = ${instrument}
    FOR UPDATE
  `;
  const cap = locked[0];
  if (!cap || cap.maxActiveStudents == null) return;

  // Already an active student for this teacher+instrument (e.g. booking a
  // second lesson) - this confirmation doesn't add a new occupant, so it
  // never gets blocked by a cap that's already accounted for them.
  const alreadyActive = await tx.booking.findFirst({
    where: { teacherProfileId, userId: studentUserId, instrument, status: { in: ['CONFIRMED', 'COMPLETED'] } },
  });
  if (alreadyActive) return;

  const distinctActive = await tx.booking.findMany({
    where: { teacherProfileId, instrument, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    distinct: ['userId'],
    select: { userId: true },
  });
  if (distinctActive.length >= cap.maxActiveStudents) {
    throw new GraphQLError(`This teacher's ${instrument} capacity is full.`, { extensions: { code: 'CONFLICT' } });
  }
}
