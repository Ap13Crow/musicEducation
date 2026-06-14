import { z } from 'zod';
import { pool } from '../db.js';
import { chat } from '../ai.js';

export const recommendContentSchema = {
  user_id: z.string().describe('ID of the user to generate recommendations for'),
  content_types: z
    .array(z.enum(['courses', 'teachers', 'events']))
    .default(['courses', 'teachers', 'events'])
    .describe('Which content types to recommend'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe('Number of recommendations per content type'),
};

export type RecommendContentInput = z.infer<z.ZodObject<typeof recommendContentSchema>>;

export async function recommendContent(input: RecommendContentInput): Promise<string> {
  const { user_id, content_types, limit } = input;

  // Fetch user profile
  const profileResult = await pool.query(
    `SELECT u."displayName",
            up.instruments, up."musicStyles", up.city, up.country,
            gp."skillLevel", gp.xp, gp.level
     FROM "User" u
     LEFT JOIN "UserProfile" up ON up."userId" = u.id
     LEFT JOIN "GamificationProfile" gp ON gp."userId" = u.id
     WHERE u.id = $1`,
    [user_id],
  );

  if (profileResult.rows.length === 0) {
    return JSON.stringify({ error: `User ${user_id} not found.` });
  }

  const profile = profileResult.rows[0];
  const instruments: string[] = Array.isArray(profile.instruments) ? profile.instruments : [];
  const musicStyles: string[] = Array.isArray(profile.musicstyles) ? profile.musicstyles : [];
  const skillLevel: string = profile.skilllevel ?? 'BEGINNER';

  // Fetch already-enrolled courses to exclude them
  const enrolledResult = await pool.query(
    `SELECT "courseId" FROM "Enrollment" WHERE "userId" = $1`,
    [user_id],
  );
  const enrolledIds: string[] = enrolledResult.rows.map((r) => r.courseId);

  const results: Record<string, unknown[]> = {};

  // ── Courses ───────────────────────────────────────────────
  if (content_types.includes('courses')) {
    const courseResult = await pool.query(
      `SELECT c.id, c.title, c.slug, c.description, c.level,
              c.instruments, c."musicStyles", c.price, c.currency,
              c."avgRating", c."totalReviews", c."isFreeTier",
              tp.headline AS teacher_headline
       FROM "Course" c
       LEFT JOIN "TeacherProfile" tp ON tp.id = c."teacherProfileId"
       WHERE c.status = 'PUBLISHED'
         AND ($1::text[] IS NULL OR c.instruments && $1::text[]
              OR c."musicStyles" && $2::text[]
              OR c.level = $3)
         AND c.id != ALL($4::text[])
       ORDER BY c."avgRating" DESC, c."totalReviews" DESC
       LIMIT $5`,
      [
        instruments.length ? instruments : null,
        musicStyles.length ? musicStyles : null,
        skillLevel,
        enrolledIds.length ? enrolledIds : [''],
        limit * 3,
      ],
    );
    results.courses = courseResult.rows;
  }

  // ── Teachers ──────────────────────────────────────────────
  if (content_types.includes('teachers')) {
    const teacherResult = await pool.query(
      `SELECT tp.id, tp.headline, tp."teachingBio",
              tp.instruments, tp.specializations, tp."teachingFormats",
              tp."hourlyRate", tp.currency,
              tp."avgRating", tp."totalReviews",
              tp."locationCity", tp."locationCountry",
              u."displayName" AS teacher_name
       FROM "TeacherProfile" tp
       JOIN "User" u ON u.id = tp."userId"
       WHERE tp."isAvailable" = true
         AND ($1::text[] IS NULL OR tp.instruments && $1::text[])
       ORDER BY tp."avgRating" DESC, tp."totalReviews" DESC
       LIMIT $2`,
      [instruments.length ? instruments : null, limit * 2],
    );
    results.teachers = teacherResult.rows;
  }

  // ── Events ────────────────────────────────────────────────
  if (content_types.includes('events')) {
    const eventResult = await pool.query(
      `SELECT e.id, e.title, e.slug, e.description, e.type, e.format,
              e.instruments, e."musicStyles", e."skillLevels",
              e."startsAt", e.city, e.country,
              e.price, e.currency, e."maxCapacity", e."currentCapacity"
       FROM "Event" e
       WHERE e."isPublished" = true
         AND e."startsAt" > NOW()
         AND ($1::text[] IS NULL OR e.instruments && $1::text[]
              OR e."musicStyles" && $2::text[])
       ORDER BY e."startsAt" ASC
       LIMIT $3`,
      [
        instruments.length ? instruments : null,
        musicStyles.length ? musicStyles : null,
        limit * 2,
      ],
    );
    results.events = eventResult.rows;
  }

  // Build AI ranking prompt
  const candidateSummary = [
    results.courses?.length
      ? `Courses (${results.courses.length} candidates):\n${(results.courses as any[])
          .slice(0, 10)
          .map((c, i) => `  ${i + 1}. "${c.title}" — ${c.level}, ${c.instruments?.join('/')}, ${c.avgrating}★, ${c.isfreetier ? 'Free' : `${c.price} ${c.currency}`}`)
          .join('\n')}`
      : '',
    results.teachers?.length
      ? `Teachers (${results.teachers.length} candidates):\n${(results.teachers as any[])
          .slice(0, 10)
          .map((t, i) => `  ${i + 1}. "${t.teacher_name}" — ${t.instruments?.join('/')}, ${t.avgrating}★, ${t.hourlylrate ?? '?'} ${t.currency}/hr`)
          .join('\n')}`
      : '',
    results.events?.length
      ? `Events (${results.events.length} candidates):\n${(results.events as any[])
          .slice(0, 10)
          .map((e, i) => `  ${i + 1}. "${e.title}" — ${e.type}, ${e.format}, ${new Date(e.startsat).toLocaleDateString()}, ${e.city ?? 'Online'}`)
          .join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const system = `You are a music education recommendation engine for the My Music Coach platform.
Your job is to rank and explain content recommendations tailored to each student's profile.
Be specific about WHY each recommendation fits this particular student.`;

  const userMsg = `Rank and recommend the top ${limit} items per category for this student.

Student Profile:
- Instruments: ${instruments.join(', ') || 'not specified'}
- Music Styles: ${musicStyles.join(', ') || 'not specified'}
- Skill Level: ${skillLevel}
- Location: ${profile.city ?? 'Unknown'}, ${profile.country ?? 'Unknown'}

Available candidates:
${candidateSummary}

For each recommended item, provide:
1. The item name/title
2. A 1-2 sentence personalised reason why it's a great match for THIS student
3. A confidence score (high/medium/low)

Format your response as JSON with keys: "courses", "teachers", "events" (only include keys for requested types).
Each key maps to an array of { "title": "...", "reason": "...", "confidence": "high|medium|low" }.`;

  const aiRanking = await chat(system, userMsg);

  let parsedRanking: unknown = null;
  try {
    const jsonMatch = aiRanking.match(/```(?:json)?\s*([\s\S]*?)```/);
    parsedRanking = JSON.parse(jsonMatch ? jsonMatch[1].trim() : aiRanking);
  } catch {
    parsedRanking = { raw: aiRanking };
  }

  return JSON.stringify(
    {
      user_id,
      student_name: profile.displayname,
      skill_level: skillLevel,
      instruments,
      recommendations: parsedRanking,
    },
    null,
    2,
  );
}
