import Stripe from 'stripe';
import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import { sendPurchaseConfirmedEmail } from '../lib/emails.js';
import { notifyBookingRequested } from './bookings.js';
import { notifyEventBookingConfirmed } from './events.js';
import { APPROVAL_HOLD_HOURS } from '../lib/bookingPolicy.js';
import { isValidSubscriptionTermMonths, computeSubscriptionTotal, currentSubscriptionDiscountPct } from '../lib/pricing.js';
import { grantCredits } from '../lib/lessonCredits.js';
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
  if (type === 'package') {
    const offer = await prisma.lessonPackageOffer.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
    return offer?.teacherProfile ?? null;
  }
  if (type === 'subscription') {
    const offer = await prisma.subscriptionOffer.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
    return offer?.teacherProfile ?? null;
  }
  return null;
}

async function refreshStripePayoutReadiness(
  prisma: GraphQLContext['prisma'],
  destination: NonNullable<Awaited<ReturnType<typeof getPayoutDestination>>>,
): Promise<boolean> {
  if (!destination.stripeAccountId) return false;
  try {
    const account = await getStripe().v2.core.accounts.retrieve(destination.stripeAccountId, {
      include: ['configuration.recipient'],
    });
    const ready =
      account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === 'active';
    if (ready !== destination.stripePayoutsEnabled) {
      await prisma.teacherProfile.update({
        where: { id: destination.id },
        data: { stripePayoutsEnabled: ready },
      });
    }
    return ready;
  } catch {
    // Never block a valid student checkout just because Stripe's live
    // readiness check failed transiently. The cached flag is still safe:
    // false keeps funds on-platform; true means the last webhook/live status
    // already confirmed transfers were active.
    return Boolean(destination.stripePayoutsEnabled);
  }
}

async function recordSucceededCheckoutPayment(
  prisma: GraphQLContext['prisma'],
  session: Stripe.Checkout.Session,
) {
  const { userId, type, refId } = session.metadata ?? {};
  if (!userId || !type || !refId) throw new Error('Stripe Checkout metadata is incomplete.');
  try {
    return await prisma.payment.create({
      data: {
        userId,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency?.toUpperCase() ?? 'CHF',
        status: 'SUCCEEDED',
        provider: 'STRIPE',
        providerRef: session.id,
        description: `${type}:${refId}`,
      },
    });
  } catch (error: any) {
    if (error?.code !== 'P2002') throw error;
    return prisma.payment.findUniqueOrThrow({
      where: { provider_providerRef: { provider: 'STRIPE', providerRef: session.id } },
    });
  }
}

// Payment and teacher approval are deliberately separate transitions. A
// successful Checkout Session proves that the request is paid; only the
// teacher's confirmBooking action makes it a calendar commitment.
export async function applyPaidBookingCheckout(
  prisma: GraphQLContext['prisma'],
  session: Stripe.Checkout.Session,
  payment: Awaited<ReturnType<typeof recordSucceededCheckoutPayment>>,
) {
  const { userId, refId } = session.metadata ?? {};
  if (!userId || !refId) throw new Error('Stripe booking metadata is incomplete.');
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: refId } });
    if (!booking || booking.userId !== userId) throw new Error('Stripe booking does not belong to the Checkout customer.');
    if (booking.paymentId && booking.paymentId !== payment.id) throw new Error('Booking is already linked to a different payment.');
    if (booking.status !== 'PENDING') return;

    // Reset the approval hold from the moment payment clears. A student
    // should not lose most of the teacher's response window merely because
    // they spent time completing Checkout.
    await tx.booking.updateMany({
      where: { id: refId, userId, status: 'PENDING', paymentId: null },
      data: {
        paymentId: payment.id,
        holdExpiresAt: new Date(Date.now() + APPROVAL_HOLD_HOURS * 60 * 60 * 1000),
      },
    });
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, confirmationEmailAt: null },
      data: { confirmationEmailAt: new Date() },
    });
    if (claimed.count > 0) await notifyBookingRequested(tx, refId, 'PAID');
  });
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
    // row). This catches the unique-violation P2002 from create() itself,
    // but - unlike an early return on that catch - still runs the
    // follow-up state transitions below on every delivery, new or repeat:
    // they're each independently idempotent (upsert/update), so this is
    // also what repairs a delivery that created the Payment row but then
    // crashed (process killed, DB hiccup) before reaching them, which an
    // early return would instead leave stuck half-processed forever.
    const payment = await recordSucceededCheckoutPayment(prisma, session);
    // The confirmation email is gated on this durable marker, not on
    // "did I just create the Payment row" - that heuristic has its own gap:
    // a delivery that creates the row and then crashes before sending the
    // email would never get a real retry at sending it (isNewPayment would
    // be false on the retry, even though no email ever went out).
    //
    // Reading payment.confirmationEmailAt and later writing it in two
    // separate statements (the previous approach) has its own race: two
    // genuinely concurrent deliveries can both race past the P2002 catch
    // above, both read confirmationEmailAt as still null, and both fire the
    // email before either one's write lands. claimConfirmationEmail makes
    // the check-and-set a single atomic UPDATE ... WHERE confirmationEmailAt
    // IS NULL - only the delivery whose write actually flips the row wins
    // the right to send, so at most one of any number of concurrent
    // deliveries ever sends. The remaining gap - a crash between winning the
    // claim and the fire-and-forget send actually going out - is accepted,
    // same as before, in exchange for never double-sending.
    async function claimConfirmationEmail(): Promise<boolean> {
      const result = await prisma.payment.updateMany({
        where: { id: payment.id, confirmationEmailAt: null },
        data: { confirmationEmailAt: new Date() },
      });
      return result.count > 0;
    }
    // Only ever needed for the direct purchase-confirmation email
    // (course/event). Booking request mail is queued transactionally by
    // applyPaidBookingCheckout. Lazy so a delivery that doesn't need it
    // doesn't pay for this DB round-trip on the hottest webhook path.
    async function getBuyerInfo() {
      const buyer = await prisma.user.findUnique({ where: { id: userId! }, include: { profile: true } });
      return { email: buyer?.email, name: buyer?.profile?.displayName || buyer?.email?.split('@')[0] || 'there' };
    }

    if (type === 'course') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: userId!, courseId: refId! } },
        update: { paymentId: payment.id },
        create: { userId: userId!, courseId: refId!, paymentId: payment.id },
      });
      if (await claimConfirmationEmail()) {
        const [course, buyer] = await Promise.all([
          prisma.course.findUnique({ where: { id: refId } }),
          getBuyerInfo(),
        ]);
        // Not awaited - the webhook response must not wait on an SMTP
        // round-trip (Stripe times out and retries slow deliveries), and
        // sendPurchaseConfirmedEmail already can't throw (it only ever
        // calls sendMail, which swallows its own failures).
        void sendPurchaseConfirmedEmail({
          toEmail: buyer.email, toName: buyer.name,
          description: `Enrolled in: ${course?.title ?? 'your course'}`,
          amount: payment.amount.toNumber(), currency: payment.currency,
        });
      }
    } else if (type === 'booking') {
      await applyPaidBookingCheckout(prisma, session, payment);
    } else if (type === 'event') {
      await prisma.$transaction(async (tx) => {
        const eventBooking = await tx.eventBooking.upsert({
          where: { userId_eventId: { userId: userId!, eventId: refId! } },
          update: { paymentId: payment.id, status: 'CONFIRMED' },
          create: { userId: userId!, eventId: refId!, paymentId: payment.id, status: 'CONFIRMED' },
        });
        const claimed = await tx.payment.updateMany({
          where: { id: payment.id, confirmationEmailAt: null },
          data: { confirmationEmailAt: new Date() },
        });
        if (claimed.count > 0) {
          await notifyEventBookingConfirmed(tx, eventBooking.id);
        }
      });
      // Mirrors the free-event award in events.ts bookEvent - refId=eventId
      // keeps it one-time even if Stripe retries this webhook.
      await awardXpOnce(prisma, userId!, 'EVENT_ATTENDED', refId!, EVENT_ATTENDED_XP);
    } else if (type === 'package') {
      const meta = session.metadata ?? {};
      // create() (not update, unlike the booking branch above) - a package
      // purchase has no pre-existing row to attach to, this webhook is
      // what creates it. The paymentId unique constraint is the same
      // idempotency guard the Payment row itself uses just above: a retry
      // hits P2002 and is treated as already-processed, so credits are
      // granted exactly once no matter how many times Stripe redelivers.
      try {
        const purchase = await prisma.lessonPackagePurchase.create({
          data: {
            userId: userId!,
            teacherProfileId: meta.teacherProfileId!,
            instrument: meta.instrument || null,
            lessonCount: Number(meta.lessonCount),
            pricePaid: payment.amount,
            currency: payment.currency,
            policyLeadDays: Number(meta.policyLeadDays),
            policyCancellationDays: Number(meta.policyCancellationDays),
            paymentId: payment.id,
          },
        });
        await grantCredits(prisma as any, purchase.id, purchase.lessonCount);
        if (await claimConfirmationEmail()) {
          const buyer = await getBuyerInfo();
          void sendPurchaseConfirmedEmail({
            toEmail: buyer.email, toName: buyer.name,
            description: `${meta.lessonCount}-lesson package`,
            amount: payment.amount.toNumber(), currency: payment.currency,
          });
        }
      } catch (error: any) {
        if (error?.code !== 'P2002') throw error;
      }
    } else if (type === 'subscription') {
      const meta = session.metadata ?? {};
      const termMonths = Number(meta.termMonths);
      try {
        const startsAt = new Date();
        const endsAt = new Date(startsAt);
        endsAt.setMonth(endsAt.getMonth() + termMonths);
        const includedCourseIds = meta.includedCourseIds ? meta.includedCourseIds.split(',').filter(Boolean) : [];
        const purchase = await prisma.subscriptionPurchase.create({
          data: {
            userId: userId!,
            teacherProfileId: meta.teacherProfileId!,
            termMonths,
            includedHoursPerMonth: Number(meta.includedHoursPerMonth),
            monthlyPrice: Number(meta.monthlyPrice),
            discountPct: Number(meta.discountPct),
            totalPricePaid: payment.amount,
            currency: payment.currency,
            includedCourseIds,
            policyLeadDays: Number(meta.policyLeadDays),
            policyCancellationDays: Number(meta.policyCancellationDays),
            paymentId: payment.id,
            startsAt,
            endsAt,
          },
        });
        // Course bundling: grant an Enrollment for every included course,
        // reusing the existing Enrollment model rather than a parallel
        // entitlement system - respects the same course-authority boundary
        // as a direct course purchase.
        for (const courseId of purchase.includedCourseIds) {
          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: userId!, courseId } },
            update: {},
            create: { userId: userId!, courseId },
          });
        }
        if (await claimConfirmationEmail()) {
          const buyer = await getBuyerInfo();
          void sendPurchaseConfirmedEmail({
            toEmail: buyer.email, toName: buyer.name,
            description: `${termMonths}-month subscription`,
            amount: payment.amount.toNumber(), currency: payment.currency,
          });
        }
      } catch (error: any) {
        if (error?.code !== 'P2002') throw error;
      }
    }
  } else if (event.type === 'account.updated') {
    // v1 accounts only - a v2-created account (see
    // createStripeConnectOnboardingLink) never fires this classic event at
    // all, it fires the v2 thin events handleStripeV2Webhook below listens
    // for instead. Kept for any account created before that migration.
    const account = event.data.object as Stripe.Account;
    await prisma.teacherProfile.updateMany({
      where: { stripeAccountId: account.id },
      data: { stripePayoutsEnabled: Boolean(account.payouts_enabled) },
    });
  }
}

// handleStripeV2Webhook is exported for use as an Express route, not a
// GraphQL resolver. Requires a *separate* event destination created in the
// Stripe Dashboard (Developers -> Webhooks -> + Add destination -> Events
// from: Connected accounts -> Show advanced options -> Payload style: Thin
// -> Events: v2.core.account[requirements].updated and
// v2.core.account[configuration.recipient].capability_status_updated) -
// v1 and v2 events are delivered to different destinations with different
// signing secrets, they can't share the /webhooks/stripe endpoint above.
// Keeps stripePayoutsEnabled in sync the same way the v1 account.updated
// handler does, for accounts created via the v2 API.
export async function handleStripeV2Webhook(prisma: import('@my-music-coach/database').PrismaClient, rawBody: Buffer, sig: string): Promise<void> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_V2;
  if (!secret) return;
  const stripe = getStripe();
  // parseEventNotification verifies the signature and returns a "thin"
  // notification - just { id, type, ... } plus a fetchEvent() convenience
  // method, not the full event payload (the whole point of a thin event is
  // that the sender doesn't have to trust arbitrary account data pushed to
  // it - see the parseThinEvent()/client.v2.core.events.retrieve() pattern
  // this replaces; the installed SDK version renamed/merged both steps into
  // parseEventNotification + .fetchEvent()).
  const thinEvent: any = stripe.parseEventNotification(rawBody.toString('utf8'), sig, secret);
  if (typeof thinEvent.type !== 'string' || !thinEvent.type.startsWith('v2.core.account')) return;

  const event: any = await thinEvent.fetchEvent();
  const accountId: string | undefined = event?.data?.object?.id ?? event?.related_object?.id ?? thinEvent.related_object?.id;
  if (!accountId) return;

  const account = await stripe.v2.core.accounts.retrieve(accountId, { include: ['configuration.recipient'] });
  const ready = account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === 'active';
  await prisma.teacherProfile.updateMany({
    where: { stripeAccountId: accountId },
    data: { stripePayoutsEnabled: ready },
  });
}

export const paymentResolvers = {
  Mutation: {
    async reconcileBookingPayment(
      _: unknown,
      { sessionId }: { sessionId: string },
      { prisma, user }: GraphQLContext,
    ) {
      requireAuth(user);
      if (!sessionId.startsWith('cs_')) {
        throw new GraphQLError('Invalid Checkout Session.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status !== 'paid' ||
        session.metadata?.type !== 'booking' ||
        session.metadata?.userId !== user.id ||
        !session.metadata?.refId
      ) {
        throw new GraphQLError('This paid booking could not be verified.', { extensions: { code: 'FORBIDDEN' } });
      }
      const payment = await recordSucceededCheckoutPayment(prisma, session);
      await applyPaidBookingCheckout(prisma, session, payment);
      return prisma.booking.findUniqueOrThrow({ where: { id: session.metadata.refId } });
    },

    async createCheckoutSession(
      _: unknown,
      { type, refId, provider = 'STRIPE' }: any,
      { prisma, user }: GraphQLContext,
    ) {
      requireAuth(user);

      let amount = 0;
      let currency = 'chf';
      let description = '';
      // Extra checkout.session metadata beyond {userId, type, refId} -
      // package/subscription snapshot their full commercial terms here so
      // the webhook (which may run long after checkout, once payment
      // actually clears) recreates the exact price/discount/policy the
      // student saw at checkout time, never whatever the offer looks like
      // by then. Metadata values must be strings.
      let extraMetadata: Record<string, string> = {};

      if (type === 'course') {
        const course = await prisma.course.findUnique({ where: { id: refId } });
        if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
        amount = Number(course.price) * 100;
        currency = course.currency.toLowerCase();
        description = `Enroll in: ${course.title}`;
      } else if (type === 'booking') {
        const booking = await prisma.booking.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
        if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
        if (booking.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
        if (booking.status !== 'PENDING') throw new GraphQLError('This booking is no longer awaiting payment.', { extensions: { code: 'CONFLICT' } });
        if (booking.paymentId) throw new GraphQLError('This booking is already paid.', { extensions: { code: 'CONFLICT' } });
        const rate = Number(booking.teacherProfile.hourlyRate ?? 0);
        amount = Math.round(rate * (booking.durationMin / 60) * 100);
        if (amount <= 0) throw new GraphQLError('This booking does not require payment.', { extensions: { code: 'BAD_USER_INPUT' } });
        currency = booking.teacherProfile.currency.toLowerCase();
        description = `Lesson booking on ${booking.startsAt.toISOString()}`;
      } else if (type === 'event') {
        const event = await prisma.event.findUnique({ where: { id: refId } });
        if (!event) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
        amount = Number(event.price) * 100;
        currency = event.currency.toLowerCase();
        description = `Ticket: ${event.title}`;
      } else if (type === 'package') {
        const offer = await prisma.lessonPackageOffer.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
        if (!offer || !offer.isPublished) throw new GraphQLError('Package offer not found.', { extensions: { code: 'NOT_FOUND' } });
        amount = Math.round(Number(offer.pricePerPackage) * 100);
        currency = offer.currency.toLowerCase();
        description = `${offer.lessonCount}-lesson package${offer.instrument ? ` (${offer.instrument})` : ''}`;
        extraMetadata = {
          lessonCount: String(offer.lessonCount),
          instrument: offer.instrument ?? '',
          teacherProfileId: offer.teacherProfileId,
          policyLeadDays: String(offer.teacherProfile.leadDays),
          policyCancellationDays: String(offer.teacherProfile.cancellationDays),
        };
      } else if (type === 'subscription') {
        const offer = await prisma.subscriptionOffer.findUnique({ where: { id: refId }, include: { teacherProfile: true } });
        if (!offer || !offer.isPublished) throw new GraphQLError('Subscription offer not found.', { extensions: { code: 'NOT_FOUND' } });
        if (!isValidSubscriptionTermMonths(offer.termMonths)) {
          throw new GraphQLError('Subscription offer has an invalid term.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        const discountPct = await currentSubscriptionDiscountPct(prisma, offer.termMonths as 6 | 12);
        const total = computeSubscriptionTotal(Number(offer.monthlyPrice), offer.termMonths, discountPct);
        amount = Math.round(total * 100);
        currency = offer.currency.toLowerCase();
        description = `${offer.termMonths}-month subscription (${offer.includedHoursPerMonth}h/mo)`;
        extraMetadata = {
          teacherProfileId: offer.teacherProfileId,
          termMonths: String(offer.termMonths),
          includedHoursPerMonth: String(offer.includedHoursPerMonth),
          monthlyPrice: String(offer.monthlyPrice),
          discountPct: String(discountPct),
          includedCourseIds: offer.includedCourseIds.join(','),
          policyLeadDays: String(offer.teacherProfile.leadDays),
          policyCancellationDays: String(offer.teacherProfile.cancellationDays),
        };
      } else {
        throw new GraphQLError('Invalid checkout type.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (provider === 'STRIPE') {
        // Split to the teacher's connected account when they've finished
        // Stripe Connect onboarding; otherwise the full amount settles in the
        // platform account as before (never block a purchase on payouts setup).
        const destination = await getPayoutDestination(prisma, type, refId);
        const payoutReady = destination
          ? await refreshStripePayoutReadiness(prisma, destination)
          : false;
        const destinationMetadata: Record<string, string> = {};
        if (destination?.id) destinationMetadata.teacherProfileId = destination.id;
        if (destination?.userId) destinationMetadata.teacherUserId = destination.userId;
        if (destination?.stripeAccountId) destinationMetadata.stripeConnectedAccountId = destination.stripeAccountId;
        const metadata = { userId: user.id, type, refId, ...destinationMetadata, ...extraMetadata };
        const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData = {
          metadata,
          ...(payoutReady && destination?.stripeAccountId && amount > 0
            ? {
                ...(calculateApplicationFee(amount) > 0 ? { application_fee_amount: calculateApplicationFee(amount) } : {}),
                transfer_data: { destination: destination.stripeAccountId },
              }
            : {}),
        };

        const frontendUrl = getFrontendUrl();
        const session = await getStripe().checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price_data: { currency, product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
          mode: 'payment',
          success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=${type}&ref=${refId}`,
          cancel_url: `${frontendUrl}/payment/cancel?type=${type}&ref=${refId}`,
          metadata,
          payment_intent_data: paymentIntentData,
        });
        return { sessionId: session.id, checkoutUrl: session.url! };
      }

      // TODO: Yapeal integration
      throw new GraphQLError('Yapeal integration coming soon.', { extensions: { code: 'NOT_IMPLEMENTED' } });
    },

    async createStripeConnectOnboardingLink(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const profile = await prisma.teacherProfile.findUnique({
        where: { userId: user!.id },
        include: { user: { include: { profile: true } } },
      });
      if (!profile) {
        throw new GraphQLError('Complete your teacher profile before setting up payouts.', { extensions: { code: 'NOT_FOUND' } });
      }

      let accountId = profile.stripeAccountId;
      if (!accountId) {
        // V2 Core Accounts API - the platform (not the connected account)
        // collects fees and absorbs losses (defaults.responsibilities), and
        // the account only requests the capability it actually needs:
        // receiving transfers into its own Stripe balance. Only these
        // properties - never a top-level `type` (that's the v1 accounts API
        // this replaces; `dashboard: 'express'` here is the v2 equivalent).
        const account = await getStripe().v2.core.accounts.create({
          display_name: profile.user.profile?.displayName || profile.user.email.split('@')[0],
          contact_email: profile.user.email,
          // Placeholder: MyMusic.Coach's own home jurisdiction (matches the
          // Europe/Zurich default used elsewhere) - replace with the
          // teacher's actual country once the application collects one.
          identity: { country: 'ch' },
          dashboard: 'express',
          defaults: {
            responsibilities: {
              fees_collector: 'application',
              losses_collector: 'application',
            },
          },
          configuration: {
            recipient: {
              capabilities: {
                stripe_balance: {
                  stripe_transfers: { requested: true },
                },
              },
            },
          },
        });
        accountId = account.id;
        await prisma.teacherProfile.update({ where: { id: profile.id }, data: { stripeAccountId: accountId } });
      }

      const frontendUrl = getFrontendUrl();
      const accountLink = await getStripe().v2.core.accountLinks.create({
        account: accountId,
        use_case: {
          type: 'account_onboarding',
          account_onboarding: {
            configurations: ['recipient'],
            refresh_url: `${frontendUrl}/dashboard/teacher/payouts?refresh=true`,
            return_url: `${frontendUrl}/dashboard/teacher/payouts?onboarded=true`,
          },
        },
      });
      return { url: accountLink.url };
    },
  },

  Query: {
    async stripeConnectStatus(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const profile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!profile?.stripeAccountId) {
        return { hasAccount: false, onboardingComplete: false, readyToReceivePayments: false, requirementsStatus: null };
      }

      // Always live from the API, never a cached DB flag, for this specific
      // status display - onboarding/compliance state can change on Stripe's
      // side at any time (see the account.updated v1 webhook handler below,
      // which keeps stripePayoutsEnabled - the *checkout-routing* flag -
      // in sync separately; this query is for the teacher's own payouts
      // page, where a live check is worth the extra round-trip).
      const account = await getStripe().v2.core.accounts.retrieve(profile.stripeAccountId, {
        include: ['configuration.recipient', 'requirements'],
      });
      const readyToReceivePayments =
        account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === 'active';
      const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status ?? null;
      const onboardingComplete = requirementsStatus !== 'currently_due' && requirementsStatus !== 'past_due';

      return { hasAccount: true, onboardingComplete, readyToReceivePayments, requirementsStatus };
    },
  },
};
