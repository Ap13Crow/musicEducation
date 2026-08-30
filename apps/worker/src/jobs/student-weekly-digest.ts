import { Prisma, type PrismaClient } from '@my-music-coach/database';
import { EXTERNAL_EVENT_ATTENDANCE_XP, externalEventRecommendationScore } from '@my-music-coach/external-events';
import type { Job } from './types.js';

const BATCH_SIZE = 100;
const DIGEST_SEND_HOUR_UTC = 7;

type DigestWindow = {
  weekStart: Date;
  weekEnd: Date;
  nextWeekEnd: Date;
};

type DigestUser = {
  id: string;
  email: string;
  profile: {
    displayName: string | null;
    notificationEmail: string | null;
    instruments: string[];
    musicStyles: string[];
    skillLevel: string;
    city: string | null;
    country: string | null;
  } | null;
  gamification: { xp: number; level: number } | null;
};

type RecommendedEvent = {
  id: string;
  title: string;
  url: string;
  startsAt: Date;
  city: string | null;
  venueName: string | null;
  score: number | null;
};

type DigestSummary = {
  xpThisWeek: number;
  level: number | null;
  totalXp: number | null;
  activeCourses: Array<{ title: string; progress: number; slug: string }>;
  lessonCounts: Array<{ instrument: string; count: number }>;
  eventReminders: Array<{ id: string; title: string; url: string; startsAt: Date; city: string | null }>;
  confirmedEvents: number;
  newCourses: Array<{ title: string; slug: string; instruments: string[] }>;
  newTeachers: Array<{ name: string; teacherProfileId: string; city: string | null; headline: string | null }>;
  recommendedEvents: RecommendedEvent[];
};

function startOfUtcWeek(date: Date): Date {
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff, 0, 0, 0, 0));
}

export function digestWindow(now = new Date()): DigestWindow {
  const currentWeekStart = startOfUtcWeek(now);
  const weekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60_000);
  const weekEnd = currentWeekStart;
  const nextWeekEnd = new Date(weekEnd.getTime() + 7 * 24 * 60 * 60_000);
  return { weekStart, weekEnd, nextWeekEnd };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function recipientAddresses(accountEmail: string | null | undefined, notificationEmail: string | null | undefined): string[] {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const set = new Set<string>();
  for (const candidate of [accountEmail, notificationEmail]) {
    if (typeof candidate === 'string' && emailPattern.test(candidate.trim())) set.add(candidate.trim().toLowerCase());
  }
  return [...set];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Zurich',
  }).format(date);
}

function listItems(items: string[]): string {
  if (items.length === 0) return '<li style="color:#6b7280">Nothing new this week.</li>';
  return items.map((item) => `<li>${item}</li>`).join('');
}

function lessonInstrumentCounts(bookings: Array<{ instrument: string | null }>): Array<{ instrument: string; count: number }> {
  const counts = new Map<string, number>();
  for (const booking of bookings) {
    const instrument = booking.instrument || 'Lesson';
    counts.set(instrument, (counts.get(instrument) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([instrument, count]) => ({ instrument, count }));
}

function hasDigestMaterial(summary: DigestSummary): boolean {
  return (
    summary.xpThisWeek > 0 ||
    summary.activeCourses.length > 0 ||
    summary.lessonCounts.length > 0 ||
    summary.eventReminders.length > 0 ||
    summary.confirmedEvents > 0 ||
    summary.newCourses.length > 0 ||
    summary.newTeachers.length > 0 ||
    summary.recommendedEvents.length > 0
  );
}

export function buildDigestHtml(user: DigestUser, summary: DigestSummary, window: DigestWindow): string {
  const name = escapeHtml(user.profile?.displayName ?? user.email.split('@')[0] ?? 'there');
  const progressBar = Math.max(5, Math.min(100, summary.xpThisWeek));
  const lessonItems = listItems(summary.lessonCounts.map((row) => `${escapeHtml(row.instrument)}: ${row.count} lesson${row.count === 1 ? '' : 's'}`));
  const courseItems = listItems(summary.activeCourses.map((course) => {
    const pct = Math.round((course.progress ?? 0) * 100);
    return `<a href="https://mymusic.coach/courses/${escapeHtml(course.slug)}" style="color:#2563eb;text-decoration:none">${escapeHtml(course.title)}</a> · ${pct}% complete`;
  }));
  const reminderItems = listItems(summary.eventReminders.map((event) =>
    `<a href="${escapeHtml(event.url)}" style="color:#2563eb;text-decoration:none">${escapeHtml(event.title)}</a> · ${escapeHtml(event.city ?? 'Online / venue listed by provider')} · ${formatDateTime(event.startsAt)} · confirm or decline in your profile`,
  ));
  const recommendedItems = listItems(summary.recommendedEvents.map((event) =>
    `<a href="${escapeHtml(event.url)}" style="color:#2563eb;text-decoration:none">${escapeHtml(event.title)}</a> · ${escapeHtml(event.city ?? event.venueName ?? 'Venue listed by provider')} · ${formatDateTime(event.startsAt)}${event.score ? ` · ${event.score}/10 match` : ''}`,
  ));
  const newCourseItems = listItems(summary.newCourses.map((course) =>
    `<a href="https://mymusic.coach/courses/${escapeHtml(course.slug)}" style="color:#2563eb;text-decoration:none">${escapeHtml(course.title)}</a>${course.instruments.length ? ` · ${escapeHtml(course.instruments.slice(0, 2).join(', '))}` : ''}`,
  ));
  const teacherItems = listItems(summary.newTeachers.map((teacher) =>
    `<a href="https://mymusic.coach/teachers/${escapeHtml(teacher.teacherProfileId)}" style="color:#2563eb;text-decoration:none">${escapeHtml(teacher.name)}</a>${teacher.headline ? ` · ${escapeHtml(teacher.headline)}` : ''}${teacher.city ? ` · ${escapeHtml(teacher.city)}` : ''}`,
  ));

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;padding:24px">
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px">${formatDate(window.weekStart)} – ${formatDate(new Date(window.weekEnd.getTime() - 1))}</p>
      <h1 style="margin:0 0 16px;font-size:24px">Your MyMusic.Coach week, ${name}</h1>

      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:18px;background:#f8fafc">
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280">New XP this week</p>
        <p style="margin:0 0 10px;font-size:32px;font-weight:700;color:#2563eb">+${summary.xpThisWeek}</p>
        <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden">
          <div style="width:${progressBar}%;height:10px;background:#2563eb;border-radius:999px"></div>
        </div>
        ${summary.totalXp != null ? `<p style="margin:8px 0 0;font-size:13px;color:#4b5563">Total: ${summary.totalXp} XP${summary.level ? ` · Level ${summary.level}` : ''}</p>` : ''}
      </div>

      <h2 style="font-size:16px;margin:18px 0 8px">Courses you are learning</h2>
      <ul style="margin:0 0 12px;padding-left:20px">${courseItems}</ul>

      <h2 style="font-size:16px;margin:18px 0 8px">Lessons taken</h2>
      <ul style="margin:0 0 12px;padding-left:20px">${lessonItems}</ul>

      <h2 style="font-size:16px;margin:18px 0 8px">Events to confirm</h2>
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px">${summary.confirmedEvents} event${summary.confirmedEvents === 1 ? '' : 's'} already confirmed this week. Evaluation credits ${EXTERNAL_EVENT_ATTENDANCE_XP} XP.</p>
      <ul style="margin:0 0 12px;padding-left:20px">${reminderItems}</ul>

      <h2 style="font-size:16px;margin:18px 0 8px">Recommended events next week</h2>
      <ul style="margin:0 0 12px;padding-left:20px">${recommendedItems}</ul>

      <h2 style="font-size:16px;margin:18px 0 8px">New courses</h2>
      <ul style="margin:0 0 12px;padding-left:20px">${newCourseItems}</ul>

      <h2 style="font-size:16px;margin:18px 0 8px">Teachers to discover</h2>
      <ul style="margin:0 0 12px;padding-left:20px">${teacherItems}</ul>

      <p style="margin:24px 0 0;color:#6b7280;font-size:12px">
        You can turn this weekly digest off any time in your MyMusic.Coach profile.
      </p>
    </div>
  `;
}

async function buildSummary(prisma: PrismaClient, user: DigestUser, window: DigestWindow): Promise<DigestSummary> {
  const profileInstruments = user.profile?.instruments ?? [];
  const profileStyles = user.profile?.musicStyles ?? [];
  const [xpAwards, assessmentSum, lessonProgress, bookings, activeCourses, eventReminders, confirmedEvents, newCourses] = await Promise.all([
    prisma.xpAward.aggregate({
      where: { userId: user.id, createdAt: { gte: window.weekStart, lt: window.weekEnd } },
      _sum: { amount: true },
    }),
    prisma.assessment.aggregate({
      where: { userId: user.id, completedAt: { gte: window.weekStart, lt: window.weekEnd }, xpAwarded: { not: null } },
      _sum: { xpAwarded: true },
    }),
    prisma.lessonProgress.findMany({
      where: { enrollment: { userId: user.id }, completedAt: { gte: window.weekStart, lt: window.weekEnd } },
      include: { lesson: { select: { xpReward: true } } },
    }),
    prisma.booking.findMany({
      where: {
        userId: user.id,
        startsAt: { gte: window.weekStart, lt: window.weekEnd },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      select: { instrument: true },
    }),
    prisma.enrollment.findMany({
      where: { userId: user.id, completedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: { course: { select: { title: true, slug: true } } },
    }),
    prisma.externalEventEngagement.findMany({
      where: {
        userId: user.id,
        attendanceConfirmedAt: null,
        attendanceDeclinedAt: null,
        externalEventProjection: { startsAt: { gte: window.weekStart, lt: window.weekEnd } },
      },
      take: 4,
      orderBy: { lastViewedAt: 'desc' },
      include: { externalEventProjection: true },
    }),
    prisma.externalEventEngagement.count({
      where: {
        userId: user.id,
        attendanceConfirmedAt: { not: null },
        externalEventProjection: { startsAt: { gte: window.weekStart, lt: window.weekEnd } },
      },
    }),
    prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: { gte: window.weekStart, lt: window.weekEnd },
        ...(profileInstruments.length ? { instruments: { hasSome: profileInstruments } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { title: true, slug: true, instruments: true },
    }),
  ]);

  const teacherWhere: any = {
    isPublic: true,
    user: { role: { in: ['TEACHER', 'ADMIN'] }, status: 'ACTIVE' },
  };
  if (user.profile?.city || user.profile?.country) {
    teacherWhere.user.profile = {
      is: {
        ...(user.profile.city ? { city: { equals: user.profile.city, mode: 'insensitive' } } : {}),
        ...(user.profile.country ? { country: { equals: user.profile.country, mode: 'insensitive' } } : {}),
      },
    };
  } else {
    teacherWhere.instruments = { has: 'Piano' };
  }

  const [newTeachers, candidateEvents] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: teacherWhere,
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { user: { include: { profile: true } } },
    }),
    prisma.externalEventProjection.findMany({
      where: {
        startsAt: { gte: window.weekEnd, lt: window.nextWeekEnd },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        ...(profileInstruments.length || profileStyles.length
          ? {
              AND: [{
                OR: [
                  ...(profileInstruments.length ? [{ instruments: { hasSome: profileInstruments } }] : []),
                  ...(profileStyles.length ? [{ musicStyles: { hasSome: profileStyles } }] : []),
                ],
              }],
            }
          : {}),
      },
      orderBy: { startsAt: 'asc' },
      take: 80,
    }),
  ]);

  const recommendedEvents = candidateEvents
    .map((event) => ({
      id: event.id,
      title: event.title,
      url: event.url,
      startsAt: event.startsAt,
      city: event.city,
      venueName: event.venueName,
      score: externalEventRecommendationScore(event, user.profile),
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 4);

  return {
    xpThisWeek:
      (xpAwards._sum.amount ?? 0) +
      (assessmentSum._sum.xpAwarded ?? 0) +
      lessonProgress.reduce((sum, progress) => sum + (progress.lesson?.xpReward ?? 0), 0),
    level: user.gamification?.level ?? null,
    totalXp: user.gamification?.xp ?? null,
    activeCourses: activeCourses.map((enrollment) => ({ title: enrollment.course.title, slug: enrollment.course.slug, progress: enrollment.progress })),
    lessonCounts: lessonInstrumentCounts(bookings),
    eventReminders: eventReminders.map((engagement) => ({
      id: engagement.externalEventProjection.id,
      title: engagement.externalEventProjection.title,
      url: engagement.externalEventProjection.url,
      startsAt: engagement.externalEventProjection.startsAt,
      city: engagement.externalEventProjection.city,
    })),
    confirmedEvents,
    newCourses,
    newTeachers: newTeachers.map((teacher) => ({
      name: teacher.user.profile?.displayName ?? teacher.user.email.split('@')[0] ?? 'Teacher',
      teacherProfileId: teacher.id,
      city: teacher.user.profile?.city ?? null,
      headline: teacher.bio?.split(/\r?\n/, 1)[0] || null,
    })),
    recommendedEvents,
  };
}

export const studentWeeklyDigestJob: Job = {
  key: 'student-weekly-digest',
  // Monday morning in Europe/Zurich for most of the year; node-cron runs in
  // the container timezone, so keep this in UTC and make the email content's
  // week windows explicit.
  schedule: `15 ${DIGEST_SEND_HOUR_UTC} * * 1`,
  async run(ctx) {
    const window = digestWindow();
    const users = await ctx.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        profile: { is: { weeklyDigestEmailEnabled: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: BATCH_SIZE,
      include: { profile: true, gamification: true },
    });

    let enqueued = 0;
    let skipped = 0;
    for (const user of users as DigestUser[]) {
      const recipients = recipientAddresses(user.email, user.profile?.notificationEmail);
      if (recipients.length === 0) {
        skipped += 1;
        continue;
      }
      const summary = await buildSummary(ctx.prisma, user, window);
      if (!hasDigestMaterial(summary)) {
        skipped += 1;
        continue;
      }

      try {
        await ctx.prisma.$transaction(async (tx) => {
          const delivery = await tx.studentWeeklyDigestDelivery.create({
            data: { userId: user.id, weekStart: window.weekStart, weekEnd: window.weekEnd },
          });
          const message = await tx.mailOutboxMessage.create({
            data: {
              kind: 'STUDENT_WEEKLY_DIGEST',
              recipients,
              subject: `Your MyMusic.Coach week: +${summary.xpThisWeek} XP`,
              html: buildDigestHtml(user, summary, window),
            },
          });
          await tx.studentWeeklyDigestDelivery.update({
            where: { id: delivery.id },
            data: { mailOutboxMessageId: message.id },
          });
        });
        enqueued += 1;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          skipped += 1;
          continue;
        }
        throw error;
      }
    }

    ctx.logger.info({ candidates: users.length, enqueued, skipped }, 'student-weekly-digest run complete');
  },
};
