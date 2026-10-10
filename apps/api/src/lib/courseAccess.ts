import type { PrismaClient } from '@my-music-coach/database';
import { hasActiveMembership } from './membership.js';

// Who may take a paid course without paying for it:
//   MEMBERSHIP           an active mymusic.coach Plus membership
//   TEACHER_SUBSCRIPTION an active subscription with the course's teacher
//   TEACHER_STUDENT      has had a confirmed lesson with the course's teacher
//   INVITATION           the teacher invited their email to the course
// Everyone else buys it (PURCHASE); a course priced 0 is FREE.
//
// MEMBERSHIP and TEACHER_SUBSCRIPTION access lasts as long as that
// subscription does - the enrollment (and its progress) stays, and the
// lessons open again on renewal or purchase. The other reasons are for good.

export type AccessReason = 'PURCHASE' | 'FREE' | 'MEMBERSHIP' | 'TEACHER_SUBSCRIPTION' | 'TEACHER_STUDENT' | 'INVITATION';

type CourseRef = { id: string; price: unknown; teacherProfileId: string | null };

async function activeTeacherSubscription(prisma: PrismaClient, userId: string, teacherProfileId: string | null): Promise<boolean> {
  if (!teacherProfileId) return false;
  const count = await prisma.subscriptionPurchase.count({
    where: { userId, teacherProfileId, status: 'ACTIVE' as any, endsAt: { gt: new Date() } },
  });
  return count > 0;
}

async function teacherStudent(prisma: PrismaClient, userId: string, teacherProfileId: string | null): Promise<boolean> {
  if (!teacherProfileId) return false;
  const count = await prisma.booking.count({ where: { userId, teacherProfileId, status: { in: ['CONFIRMED', 'COMPLETED'] as any } } });
  return count > 0;
}

async function invitation(prisma: PrismaClient, userId: string, courseId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user?.email) return null;
  return prisma.courseInvitation.findUnique({ where: { courseId_email: { courseId, email: user.email.toLowerCase() } } });
}

// The best reason this user gets the course without paying, or null.
// Permanent reasons first, so an invited member keeps access after their
// membership ends.
export async function freeAccessReason(prisma: PrismaClient, userId: string, course: CourseRef): Promise<AccessReason | null> {
  if (Number(course.price) <= 0) return 'FREE';
  if (await invitation(prisma, userId, course.id)) return 'INVITATION';
  if (await teacherStudent(prisma, userId, course.teacherProfileId)) return 'TEACHER_STUDENT';
  if (await activeTeacherSubscription(prisma, userId, course.teacherProfileId)) return 'TEACHER_SUBSCRIPTION';
  if (await hasActiveMembership(prisma, userId)) return 'MEMBERSHIP';
  return null;
}

// Whether an existing enrollment still opens the course's lessons.
export async function enrollmentGrantsAccess(
  prisma: PrismaClient,
  enrollment: { userId: string; accessReason?: string | null; paymentId?: string | null } | null,
  course: { teacherProfileId: string | null },
): Promise<boolean> {
  if (!enrollment) return false;
  if (enrollment.paymentId) return true;
  if (enrollment.accessReason === 'MEMBERSHIP') return hasActiveMembership(prisma, enrollment.userId);
  if (enrollment.accessReason === 'TEACHER_SUBSCRIPTION') return activeTeacherSubscription(prisma, enrollment.userId, course.teacherProfileId);
  return true;
}

// Enrolls (or re-opens an enrollment) without payment when a reason allows
// it; returns null when the course has to be bought.
export async function enrollWithoutPayment(prisma: PrismaClient, userId: string, course: CourseRef) {
  const reason = await freeAccessReason(prisma, userId, course);
  if (!reason) return null;
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    create: { userId, courseId: course.id, accessReason: reason },
    // A paid enrollment keeps PURCHASE; a lapsed one takes the new reason.
    update: {},
  });
  if (!enrollment.paymentId && enrollment.accessReason !== reason) {
    const updated = await prisma.enrollment.update({ where: { id: enrollment.id }, data: { accessReason: reason } });
    if (reason === 'INVITATION') await markInvitationUsed(prisma, userId, course.id);
    return updated;
  }
  if (reason === 'INVITATION') await markInvitationUsed(prisma, userId, course.id);
  return enrollment;
}

async function markInvitationUsed(prisma: PrismaClient, userId: string, courseId: string) {
  const found = await invitation(prisma, userId, courseId);
  if (found && !found.enrolledAt) {
    await prisma.courseInvitation.update({ where: { id: found.id }, data: { userId, enrolledAt: new Date() } });
  }
}

export interface CourseAccessState {
  enrolled: boolean;
  hasAccess: boolean;
  reason: string | null;
  // Why the user could start without paying, when not (fully) enrolled yet.
  freeReason: AccessReason | null;
}

export async function courseAccessState(prisma: PrismaClient, userId: string, course: CourseRef): Promise<CourseAccessState> {
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } });
  const hasAccess = await enrollmentGrantsAccess(prisma, enrollment, course);
  const freeReason = hasAccess ? null : await freeAccessReason(prisma, userId, course);
  return {
    enrolled: Boolean(enrollment),
    hasAccess,
    reason: enrollment ? enrollment.accessReason ?? (enrollment.paymentId ? 'PURCHASE' : 'FREE') : null,
    freeReason,
  };
}
