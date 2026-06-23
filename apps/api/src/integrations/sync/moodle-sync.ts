import type { PrismaClient } from '@my-music-coach/database';
import type { MoodleAdapter } from '../adapters/moodle.js';
import { logger } from '../../utils/logger.js';

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
