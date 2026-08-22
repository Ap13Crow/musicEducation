import DataLoader from 'dataloader';
import type { PrismaClient } from '@my-music-coach/database';

// Per-request DataLoaders for teacher-directory aggregates (distinct student
// count, published-course/"resource" count). A field resolver on
// TeacherProfile calls loader.load(teacherProfileId) once per row; DataLoader
// coalesces every call made within the same GraphQL execution tick into one
// batched query instead of one query per row in the `teachers` list (avoids
// exactly the N+1 pattern Phase 2 explicitly calls out).
//
// Created fresh per request (see index.ts's context()) - a DataLoader's
// cache must never survive past the request it was created for, or one
// caller could see another's cached aggregate.
export interface Loaders {
  teacherDistinctStudentCount: DataLoader<string, number>;
  teacherPublishedResourceCount: DataLoader<string, number>;
}

// A distinct student is a user with at least one CONFIRMED or COMPLETED
// booking with this teacher - PENDING (not yet accepted) and CANCELLED
// bookings don't establish a real teacher/student relationship. This is the
// one definition used everywhere a "student count" is shown (workspace
// overview, directory card, public profile); keep it here rather than
// reimplementing it per call site.
const ACTIVE_BOOKING_STATUSES = ['CONFIRMED', 'COMPLETED'] as const;

export function createLoaders(prisma: PrismaClient): Loaders {
  const teacherDistinctStudentCount = new DataLoader<string, number>(async (teacherProfileIds) => {
    const rows = await prisma.booking.findMany({
      where: { teacherProfileId: { in: [...teacherProfileIds] }, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
      distinct: ['teacherProfileId', 'userId'],
      select: { teacherProfileId: true },
    });
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.teacherProfileId, (counts.get(row.teacherProfileId) ?? 0) + 1);
    }
    return teacherProfileIds.map((id) => counts.get(id) ?? 0);
  });

  // "Resources" here means published Course rows - there is no separate
  // Resource/Article model in the schema. Named for what it actually counts
  // rather than inventing a metric with nothing behind it.
  const teacherPublishedResourceCount = new DataLoader<string, number>(async (teacherProfileIds) => {
    const grouped = await prisma.course.groupBy({
      by: ['teacherProfileId'],
      where: { teacherProfileId: { in: [...teacherProfileIds] }, status: 'PUBLISHED' },
      _count: { _all: true },
    });
    const counts = new Map(grouped.map((g) => [g.teacherProfileId, g._count._all]));
    return teacherProfileIds.map((id) => counts.get(id) ?? 0);
  });

  return { teacherDistinctStudentCount, teacherPublishedResourceCount };
}
