import { z } from 'zod';
import { pool } from '../db.js';
import { chat } from '../ai.js';

export const generateFeedbackSchema = {
  user_id: z.string().describe('ID of the student to generate feedback for'),
  context: z
    .enum(['course_progress', 'booking_completed', 'weekly_summary', 'onboarding'])
    .describe('The context for which to generate feedback'),
  reference_id: z
    .string()
    .optional()
    .describe('Optional ID of a specific course, booking, or assessment to focus on'),
};

export type GenerateFeedbackInput = z.infer<z.ZodObject<typeof generateFeedbackSchema>>;

export async function generateFeedback(input: GenerateFeedbackInput): Promise<string> {
  const { user_id, context, reference_id } = input;

  // Fetch user profile and gamification data
  const userResult = await pool.query(
    `SELECT u."displayName", u.role,
            up.instruments, up."musicStyles", up.city, up.country,
            gp."skillLevel", gp.xp, gp.level, gp."currentStreak", gp."totalPoints"
     FROM "User" u
     LEFT JOIN "UserProfile" up ON up."userId" = u.id
     LEFT JOIN "GamificationProfile" gp ON gp."userId" = u.id
     WHERE u.id = $1`,
    [user_id],
  );

  if (userResult.rows.length === 0) {
    return JSON.stringify({ error: `User ${user_id} not found.` });
  }

  const user = userResult.rows[0];

  // Fetch recent enrollments and progress
  const enrollmentsResult = await pool.query(
    `SELECT e.progress, e."completedAt", c.title, c.level, c.instruments
     FROM "Enrollment" e
     JOIN "Course" c ON c.id = e."courseId"
     WHERE e."userId" = $1
     ORDER BY e."createdAt" DESC
     LIMIT 5`,
    [user_id],
  );

  // Fetch recent bookings
  const bookingsResult = await pool.query(
    `SELECT b.status, b."startsAt", b.instrument, b."durationMin",
            tp.headline AS teacher_headline
     FROM "Booking" b
     JOIN "TeacherProfile" tp ON tp.id = b."teacherProfileId"
     WHERE b."studentId" = $1
     ORDER BY b."startsAt" DESC
     LIMIT 3`,
    [user_id],
  );

  // Fetch specific reference if provided
  let referenceContext = '';
  if (reference_id) {
    if (context === 'course_progress') {
      const courseResult = await pool.query(
        `SELECT c.title, c.level, e.progress,
                COUNT(lp.id) AS completed_lessons,
                (SELECT COUNT(*) FROM "Lesson" l
                 JOIN "CourseSection" cs ON cs.id = l."sectionId"
                 WHERE cs."courseId" = c.id) AS total_lessons
         FROM "Enrollment" e
         JOIN "Course" c ON c.id = e."courseId"
         LEFT JOIN "LessonProgress" lp ON lp."enrollmentId" = e.id AND lp."completedAt" IS NOT NULL
         WHERE e."userId" = $1 AND c.id = $2
         GROUP BY c.title, c.level, e.progress`,
        [user_id, reference_id],
      );
      if (courseResult.rows.length > 0) {
        const c = courseResult.rows[0];
        referenceContext = `\nFocused course: "${c.title}" (${c.level}) — ${Math.round(Number(c.progress) * 100)}% complete (${c.completed_lessons}/${c.total_lessons} lessons).`;
      }
    } else if (context === 'booking_completed') {
      const bookingResult = await pool.query(
        `SELECT b.instrument, b."durationMin", b."startsAt",
                tp.headline, tp.instruments AS teacher_instruments
         FROM "Booking" b
         JOIN "TeacherProfile" tp ON tp.id = b."teacherProfileId"
         WHERE b.id = $1`,
        [reference_id],
      );
      if (bookingResult.rows.length > 0) {
        const b = bookingResult.rows[0];
        referenceContext = `\nCompleted lesson: ${b.durationMin} min ${b.instrument} session with "${b.headline}" on ${new Date(b.startsAt).toLocaleDateString()}.`;
      }
    }
  }

  const instruments = Array.isArray(user.instruments) ? user.instruments.join(', ') : 'not specified';
  const musicStyles = Array.isArray(user.musicstyles) ? user.musicstyles.join(', ') : 'not specified';
  const recentCourses = enrollmentsResult.rows
    .map((e) => `  - "${e.title}" (${e.level}): ${Math.round(Number(e.progress) * 100)}% complete`)
    .join('\n');
  const recentBookings = bookingsResult.rows
    .map(
      (b) =>
        `  - ${b.instrument ?? 'Music'} lesson (${b.durationmin} min) — ${b.status} — ${new Date(b.startsat).toLocaleDateString()}`,
    )
    .join('\n');

  const contextDescriptions: Record<typeof context, string> = {
    course_progress: 'mid-course progress check-in',
    booking_completed: 'post-lesson feedback',
    weekly_summary: 'weekly learning summary',
    onboarding: 'welcome and onboarding guidance',
  };

  const system = `You are a supportive and knowledgeable music education coach at My Music Coach.
Your feedback is personalized, specific, encouraging, and actionable.
Always reference the student's actual data and provide next steps.`;

  const user_msg = `Generate a ${contextDescriptions[context]} for this student.

Student: ${user.displayname}
Skill Level: ${user.skilllevel ?? 'BEGINNER'}
XP: ${user.xp ?? 0} | Level: ${user.level ?? 1} | Streak: ${user.currentstreak ?? 0} days
Instruments: ${instruments}
Music Styles: ${musicStyles}
${referenceContext}

Recent Course Progress:
${recentCourses || '  (No active courses)'}

Recent Lessons:
${recentBookings || '  (No recent lesson bookings)'}

Write personalized feedback (3-4 paragraphs) that:
1. Celebrates specific achievements or progress
2. Identifies the current learning focus based on their data
3. Gives 2-3 concrete action items for the next week
4. Motivates continued engagement with their musical goals

Be specific, warm, and avoid generic advice.`;

  const feedback = await chat(system, user_msg);

  return JSON.stringify(
    {
      user_id,
      student_name: user.displayname,
      context,
      skill_level: user.skilllevel,
      xp: user.xp,
      feedback,
    },
    null,
    2,
  );
}
