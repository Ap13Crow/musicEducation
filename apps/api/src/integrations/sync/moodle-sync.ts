import type { PrismaClient } from '@my-music-coach/database';
import type { MoodleAdapter } from '../adapters/moodle.js';
import { logger } from '../../utils/logger.js';

/**
 * Pull the Moodle course list into the platform DB.
 * Visible courses → PUBLISHED; hidden → DRAFT. New courses are created,
 * existing ones have their status kept in sync.
 */
export async function syncMoodleCourses(
  prisma: PrismaClient,
  moodle: MoodleAdapter,
): Promise<{ created: number; updated: number; total: number }> {
  const courses = await moodle.listCourses();
  let created = 0;
  let updated = 0;

  for (const mc of courses) {
    const status = (mc as any).visible === 0 ? 'DRAFT' : 'PUBLISHED';
    const existing = await prisma.course.findFirst({ where: { moodleCourseId: mc.id } });

    if (existing) {
      if (existing.status !== status) {
        await prisma.course.update({ where: { id: existing.id }, data: { status } });
        updated++;
      }
      continue;
    }

    const slug = mc.shortname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + mc.id;
    const slugConflict = await prisma.course.findUnique({ where: { slug } });
    await prisma.course.create({
      data: {
        title: mc.fullname,
        slug: slugConflict ? `${slug}-moodle` : slug,
        moodleCourseId: mc.id,
        status,
        instruments: [],
        musicStyles: [],
      },
    });
    created++;
  }

  logger.info({ created, updated, total: courses.length }, 'Moodle course sync complete');
  return { created, updated, total: courses.length };
}

/**
 * Sync Moodle Lesson Progress back to the platform.
 */
export async function syncMoodleProgress(
  prisma: PrismaClient,
  moodle: MoodleAdapter,
): Promise<void> {
  logger.info('Moodle progress sync is not fully implemented yet.');
  // Ideally Moodle would send webhooks for lesson completions.
  // We can poll active enrollments.
  const activeEnrollments = await prisma.enrollment.findMany({
    where: {
      completedAt: null,
    },
    include: {
      user: { include: { externalIdentities: true } },
      course: true,
    },
  });

  for (const enrollment of activeEnrollments) {
    // Find moodle user ID
    const moodleIdentity = enrollment.user.externalIdentities.find(
      (id) => id.provider === 'moodle',
    );
    if (!moodleIdentity) continue;

    // Ideally we would fetch user course progress from Moodle API
    // e.g. using `core_completion_get_course_completion_status`
    // However, MoodleAdapter does not currently implement this.
    // It's a placeholder for future implementation.
  }

  logger.info('Moodle progress sync complete');
}
