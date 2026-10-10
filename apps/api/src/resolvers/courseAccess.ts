import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { courseAccessState, enrollWithoutPayment } from '../lib/courseAccess.js';
import {
  MEMBERSHIP_PLANS,
  createMembershipCheckout,
  currentMembership,
  membershipIsActive,
  membershipOffer,
  setMembershipCancellation,
  type MembershipPlan,
} from '../lib/membership.js';
import { sendCourseInvitationEmail } from '../lib/emails.js';
import { getFrontendUrl } from './payments.js';
import { requireOwnedCourse } from './courses.js';
import type { GraphQLContext } from '../types.js';

// Course access beyond buying: mymusic.coach Plus membership, teacher
// invitations, and each viewer's access state for a course page
// (rules: lib/courseAccess.ts).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_INVITES_PER_CALL = 100;

function fail(message: string, code = 'BAD_USER_INPUT'): never {
  throw new GraphQLError(message, { extensions: { code } });
}

export const courseAccessResolvers = {
  Course: {
    async myAccess(course: any, _: unknown, { prisma, user }: GraphQLContext) {
      if (!user) return null;
      return courseAccessState(prisma, user.id, course);
    },
  },

  Query: {
    async membershipOffer(_: unknown, __: unknown, { prisma }: GraphQLContext) {
      return membershipOffer(prisma);
    },

    async myMembership(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const membership = await currentMembership(prisma, user.id);
      if (!membership) return null;
      return { ...membership, active: membershipIsActive(membership) };
    },

    async courseInvitations(_: unknown, { courseId }: { courseId: string }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      await requireOwnedCourse(prisma, user!, courseId);
      return prisma.courseInvitation.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' } });
    },
  },

  Mutation: {
    async startMembershipCheckout(_: unknown, { plan }: { plan: string }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      if (!MEMBERSHIP_PLANS.includes(plan as MembershipPlan)) fail('Unknown membership plan.');
      const account = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true } });
      try {
        return await createMembershipCheckout(prisma, { id: user.id, email: account?.email }, plan as MembershipPlan, getFrontendUrl());
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Checkout failed.');
      }
    },

    async setMembershipAutoRenew(_: unknown, { autoRenew }: { autoRenew: boolean }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      try {
        const membership = await setMembershipCancellation(prisma, user.id, !autoRenew);
        return { ...membership, active: membershipIsActive(membership) };
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Could not change the membership.');
      }
    },

    async inviteToCourse(_: unknown, { courseId, emails }: { courseId: string; emails: string[] }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const course = await requireOwnedCourse(prisma, user!, courseId);
      const cleaned = [...new Set((emails ?? []).map((email) => email.trim().toLowerCase()).filter(Boolean))];
      if (!cleaned.length) fail('Enter at least one email address.');
      if (cleaned.length > MAX_INVITES_PER_CALL) fail(`Invite at most ${MAX_INVITES_PER_CALL} people at a time.`);
      const invalid = cleaned.filter((email) => !EMAIL_PATTERN.test(email));
      if (invalid.length) fail(`Not an email address: ${invalid.slice(0, 3).join(', ')}`);

      const teacher = await prisma.userProfile.findUnique({ where: { userId: user!.id }, select: { displayName: true } });
      const teacherName = teacher?.displayName ?? 'Your teacher';
      const courseUrl = `${getFrontendUrl()}/courses/${course.slug}`;
      const results = [];
      for (const email of cleaned) {
        const invite = await prisma.courseInvitation.upsert({
          where: { courseId_email: { courseId, email } },
          create: { courseId, email, invitedById: user!.id },
          update: {},
        });
        // Someone with an account is enrolled right away.
        const account = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true } });
        let enrolled = Boolean(invite.enrolledAt);
        if (account && !enrolled) {
          enrolled = Boolean(await enrollWithoutPayment(prisma, account.id, course));
        }
        void sendCourseInvitationEmail({ toEmail: email, teacherName, courseTitle: course.title, courseUrl, alreadyEnrolled: enrolled }).catch(() => undefined);
        results.push(await prisma.courseInvitation.findUnique({ where: { id: invite.id } }));
      }
      return results;
    },

    async revokeCourseInvitation(_: unknown, { id }: { id: string }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const invite = await prisma.courseInvitation.findUnique({ where: { id } });
      if (!invite) return true;
      await requireOwnedCourse(prisma, user!, invite.courseId);
      // Someone already enrolled through it keeps the course.
      await prisma.courseInvitation.delete({ where: { id } });
      return true;
    },
  },
};
