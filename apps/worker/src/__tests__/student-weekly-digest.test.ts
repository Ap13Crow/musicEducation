import { buildDigestHtml, digestWindow, studentWeeklyDigestJob } from '../jobs/student-weekly-digest';

describe('student weekly digest helpers', () => {
  it('uses the completed UTC week as the recap window', () => {
    const window = digestWindow(new Date('2026-08-26T12:00:00.000Z'));

    expect(window.weekStart.toISOString()).toBe('2026-08-17T00:00:00.000Z');
    expect(window.weekEnd.toISOString()).toBe('2026-08-24T00:00:00.000Z');
    expect(window.nextWeekEnd.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });

  it('renders XP, learning, event reminders and recommendations into the email', () => {
    const window = digestWindow(new Date('2026-08-26T12:00:00.000Z'));
    const html = buildDigestHtml(
      {
        id: 'user-1',
        email: 'ada@example.com',
        profile: {
          displayName: 'Ada',
          notificationEmail: null,
          instruments: ['Piano'],
          musicStyles: ['Classical'],
          skillLevel: 'BEGINNER',
          city: 'Zug',
          country: 'Switzerland',
        },
        gamification: { xp: 180, level: 2 },
      },
      {
        xpThisWeek: 50,
        level: 2,
        totalXp: 180,
        activeCourses: [{ title: 'Piano Foundations', slug: 'piano-foundations', progress: 0.4 }],
        lessonCounts: [{ instrument: 'Piano', count: 2 }],
        eventReminders: [{
          id: 'evt-1',
          title: 'Chamber Music Night',
          url: 'https://example.com/event',
          startsAt: new Date('2026-08-20T18:00:00.000Z'),
          city: 'Zurich',
        }],
        confirmedEvents: 1,
        newCourses: [{ title: 'Sight Reading', slug: 'sight-reading', instruments: ['Piano'] }],
        newTeachers: [{ name: 'Camille Bruneau', teacherProfileId: 'teacher-1', city: 'Zug', headline: 'Piano teacher' }],
        recommendedEvents: [{
          id: 'evt-2',
          title: 'Piano concert in Salzburg',
          url: 'https://classictic.example/event',
          startsAt: new Date('2026-08-25T18:00:00.000Z'),
          city: 'Salzburg',
          venueName: 'Main Hall',
          score: 9,
        }],
      },
      window,
    );

    expect(html).toContain('+50');
    expect(html).toContain('Piano Foundations');
    expect(html).toContain('Piano: 2 lessons');
    expect(html).toContain('Chamber Music Night');
    expect(html).toContain('Piano concert in Salzburg');
    expect(html).toContain('9/10 match');
    expect(html).toContain('turn this weekly digest off');
  });

  it('runs weekly on Monday morning UTC', () => {
    expect(studentWeeklyDigestJob.schedule).toBe('15 7 * * 1');
  });
});
