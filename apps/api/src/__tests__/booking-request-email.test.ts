import { bookingRequestEmailContent } from '../lib/emails';

describe('booking request email content', () => {
  it('tells the student approval is still pending and gives the teacher an acceptance link', () => {
    const content = bookingRequestEmailContent({
      studentName: 'Tom Test',
      teacherName: 'Jens Apel',
      startsAt: new Date('2026-09-10T09:00:00.000Z'),
      durationMin: 60,
      format: 'ONLINE',
      instrument: 'Piano',
      paymentStatus: 'PAID',
      teacherWorkspaceUrl: 'https://mymusic.coach/dashboard/teacher',
    });

    expect(content.student.subject).toBe('Your lesson request was sent');
    expect(content.student.html).toContain('payment was successful');
    expect(content.student.html).toContain('email you again with a calendar invitation');
    expect(content.teacher.subject).toContain('Tom Test');
    expect(content.teacher.html).toContain('has paid and requested a lesson');
    expect(content.teacher.html).toContain('https://mymusic.coach/dashboard/teacher');
  });
});
