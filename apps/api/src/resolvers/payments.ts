import Stripe from 'stripe';
import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import { sendPurchaseConfirmedEmail } from '../lib/emails.js';
import { notifyBookingConfirmed } from './bookings.js';
import type { GraphQLContext } from '../types.js';

const EVENT_ATTENDED_XP = 40;

// No explicit apiVersion - the SDK pins and sends its own default (the
// installed stripe package version determines it), per the integration
// spec this follows: "the stripe version does not need to be set since it
// will be used automatically by the SDK."
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required but was not set.');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// success_url/cancel_url below are built by string-interpolating this value.
// An unset FRONTEND_URL used to silently produce "undefined/payment/success"
// - Stripe's SDK rejected the whole session with "Invalid URL: An explicit
// scheme (such as https) must be provided", surfacing to the enroll button
// as an opaque ApolloError. Fail loudly and specifically instead.
export function getFrontendUrl(): string {
  const url = process.env.FRONTEND_URL;
  if (!url) {
    throw new Error('FRONTEND_URL environment variable is required but was not set.');
  }
  return url;
}

// Platform's cut of a Connect destination charge, in basis points. The rest
// transfers straight to the teacher's connected account at settlement.
export const PLATFORM_FEE_BPS = 1500;

export function calculateApplicationFee(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
}

// Resolves which teacher (if any) a checkout line item's revenue belongs to,
// so createCheckoutSession can route funds via Stripe Connect once that
// teacher has completed onboarding. Courses and bookings hang off a
// TeacherProfile directly; events are published by a User with the
// TEACHER/ADMIN role (createEvent's own requireRole), but that doesn't
// guarantee a TeacherProfile row exists — it's provisioned separately via
// applyAsTeacher — so this lookup by publisherId can legitimately return
// null, same as the other two branches.
async function getPayoutDestination(prisma: GraphQLContext['prisma'], type: string, refId: string) {
  if (type === 'course') {
    const course = await prisma.course.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
    return course?.teacherProfile ?? null;
  }
  if (type === 'booking') {
    const booking = await prisma.booking.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
    return booking?.teacherProfile ?? null;
  }
  if (type === 'event') {
    const event = await prisma.event.findUnique({ where: { id: refId } });
    if (!event) return null;
    return prisma.teacherProfile.findUnique({ where: { userId: event.publisherId } });
  }
  return null;
}

// handleStripeWebhook is exported for use as an Express route, not a GraphQL resolver
export async function handleStripeWebhook(prisma: import('@my-music-coach/database').PrismaClient, rawBody: Buffer, sig: string): Promise<void> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return;
  const event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, type, refId } = session.metadata ?? {};

    // Stripe retries webhook deliveries that don't 2xx in time. The real
    // idempotency guard is the @@unique([provider, providerRef]) constraint
    // (see schema.prisma / 018-payment-provider-ref-unique.sql) - a
    // preceding findFirst check alone isn't concurrency-safe (two
    // near-simultaneous deliveries can both pass it before either creates a
    // row), so this catches the unique-violation P2002 from create() itself
    // and treats it as "already processed," not an error.
    let payment;
    try {
      payment = await prisma.payment.create({
        data: {
          userId: userId!,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency?.toUpperCase() ?? 'CHF',
          status: 'SUCCEEDED',
          provider: 'STRIPE',
          providerRef: session.id,
          description: `${type}:${refId}`,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') return; // already processed by an earlier delivery
      throw error;
    }
    const buyer = await prisma.user.findUnique({ where: { id: userId! }, include: { profile: true } });
    const buyerName = buyer?.profile?.displayName || buyer?.email?.split('@')[0] || 'there';

    if (type === 'course') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: userId!, courseId: refId! } },
        update: { paymentId: payment.id },
        create: { userId: userId!, courseId: refId!, paymentId: payment.id },
      });
      const course = await prisma.course.findUnique({ where: { id: refId } });
      // Not awaited - the webhook response must not wait on an SMTP
      // round-trip (Stripe times out and retries slow deliveries), and
      // sendPurchaseConfirmedEmail already can't throw (it only ever calls
      // sendMail, which swallows its own failures).
      void sendPurchaseConfirmedEmail({
        toEmail: buyer?.email, toName: buyerName,
        description: `Enrolled in: ${course?.title ?? 'your course'}`,
        amount: payment.amount.toNumber(), currency: payment.currency,
      });
    } else if (type === 'booking') {
      await prisma.booking.update({ where: { id: refId }, data: { paymentId: payment.id, status: 'CONFIRMED' } });
      void notifyBookingConfirmed(prisma, refId!);
    } else if (type === 'event') {
      await prisma.eventBooking.upsert({
        where: { userId_eventId: { userId: userId!, eventId: refId! } },
        update: { paymentId: payment.id, status: 'CONFIRMED' },
        create: { userId: userId!, eventId: refId!, paymentId: payment.id, status: 'CONFIRMED' },
      });
      // Mirrors the free-event award in events.ts bookEvent - refId=eventId
      // keeps it one-time even if Stripe retries this webhook.
      await awardXpOnce(prisma, userId!, 'EVENT_ATTENDED', refId!, EVENT_ATTENDED_XP);
      const ticketedEvent = await prisma.event.findUnique({ where: { id: refId } });
      void sendPurchaseConfirmedEmail({
        toEmail: buyer?.email, toName: buyerName,
        description: `Ticket: ${ticketedEvent?.title ?? 'your event'}`,
        amount: payment.amount.toNumber(), currency: payment.currency,
      });
    }
  } else if (event.type === 'account.updated') {
    // Keep payout eligibility in sync with the connected account's own
    // onboarding/verification state, rather than trusting the return_url hit
    // (a teacher can close the tab before Stripe finishes verifying them).
    const account = event.data.object as Stripe.Account;
    await prisma.teacherProfile.updateMany({
      where: { stripeAccountId: account.id },
      data: { stripePayoutsEnabled: Boolean(account.payouts_enabled) },
    });
  }
}

export const paymentResolvers = {
  Mutation: {
    async createCheckoutSession(
      _: unknown,
      { type, refId, provider = 'STRIPE' }: any,
      { prisma, user }: GraphQLContext,
    ) {
      requireAuth(user);

      let amount = 0;
      let currency = 'chf';
      let description = '';

      if (type === 'course') {
        const course = await prisma.course.findUnique({ where: { id: refId } });
        if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
        amount = Number(course.price) * 100;
        currency = course.currency.toLowerCase();
        description = `Enroll in: ${course.title}`;
      } else if (type === 'booking') {
        const booking = await prisma.booking.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
        if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
        const rate = Number(booking.teacherProfile.hourlyRate ?? 0);
        amount = Math.round(rate * (booking.durationMin / 60) * 100);
        currency = booking.teacherProfile.currency.toLowerCase();
        description = `Lesson booking on ${booking.startsAt.toISOString()}`;
      } else if (type === 'event') {
        const event = await prisma.event.findUnique({ where: { id: refId } });
        if (!event) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
        amount = Number(event.price) * 100;
        currency = event.currency.toLowerCase();
        description = `Ticket: ${event.title}`;
      } else {
        throw new GraphQLError('Invalid checkout type.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (provider === 'STRIPE') {
        // Split to the teacher's connected account when they've finished
        // Stripe Connect onboarding; otherwise the full amount settles in the
        // platform account as before (never block a purchase on payouts setup).
        const destination = await getPayoutDestination(prisma, type, refId);
        const payoutReady = destination?.stripeAccountId && destination.stripePayoutsEnabled;

        const frontendUrl = getFrontendUrl();
        const session = await getStripe().checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price_data: { currency, product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
          mode: 'payment',
          success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=${type}&ref=${refId}`,
          cancel_url: `${frontendUrl}/payment/cancel?type=${type}&ref=${refId}`,
          metadata: { userId: user.id, type, refId },
          ...(payoutReady && amount > 0
            ? {
                payment_intent_data: {
                  application_fee_amount: calculateApplicationFee(amount),
                  transfer_data: { destination: destination!.stripeAccountId! },
                },
              }
            : {}),
        });
        return { sessionId: session.id, checkoutUrl: session.url! };
      }

      // TODO: Yapeal integration
      throw new GraphQLError('Yapeal integration coming soon.', { extensions: { code: 'NOT_IMPLEMENTED' } });
    },

    async createStripeConnectOnboardingLink(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const profile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!profile) {
        throw new GraphQLError('Complete your teacher profile before setting up payouts.', { extensions: { code: 'NOT_FOUND' } });
      }

      let accountId = profile.stripeAccountId;
      if (!accountId) {
        const account = await getStripe().accounts.create({
          type: 'express',
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        });
        accountId = account.id;
        await prisma.teacherProfile.update({ where: { id: profile.id }, data: { stripeAccountId: accountId } });
      }

      const frontendUrl = getFrontendUrl();
      const link = await getStripe().accountLinks.create({
        account: accountId,
        type: 'account_onboarding',
        refresh_url: `${frontendUrl}/dashboard/teacher/payouts?refresh=true`,
        return_url: `${frontendUrl}/dashboard/teacher/payouts?onboarded=true`,
      });
      return { url: link.url };
    },
  },
};
