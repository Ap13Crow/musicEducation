import Stripe from 'stripe';
import type { PrismaClient } from '@my-music-coach/database';

// mymusic.coach Plus - one subscription that includes every paid course on
// the platform (like Coursera Plus). Billed by Stripe as a recurring
// Checkout subscription; prices are admin settings (membership.monthlyPrice,
// membership.yearlyPrice, CHF) and the membership is not on sale until one
// is set.
//
// Our PlatformMembership row is kept in step with Stripe without relying on
// extra webhook events being configured in the Stripe dashboard: it is
// written when checkout completes, and re-read from Stripe whenever the
// stored period has run out (at most once an hour per member), which is
// exactly when a renewal or a cancellation would have changed it.

export const MEMBERSHIP_PLANS = ['MONTHLY', 'YEARLY'] as const;
export type MembershipPlan = (typeof MEMBERSHIP_PLANS)[number];
export const MEMBERSHIP_PRICE_KEYS: Record<MembershipPlan, string> = {
  MONTHLY: 'membership.monthlyPrice',
  YEARLY: 'membership.yearlyPrice',
};
// On sale only once more than this many courses are published (unset: no
// minimum) - a membership is only worth it with a real catalogue.
export const MEMBERSHIP_LAUNCH_KEY = 'membership.launchAfterCourses';
const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);
const RECHECK_MS = 60 * 60 * 1000;

function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Payments are not configured.');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export interface MembershipOffer {
  currency: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  available: boolean;
  // Courses published now, and how many must be passed before launch.
  publishedCourses: number;
  launchAfterCourses: number | null;
}

export async function membershipOffer(prisma: PrismaClient): Promise<MembershipOffer> {
  const [rows, publishedCourses] = await Promise.all([
    prisma.adminSetting.findMany({ where: { key: { in: [...Object.values(MEMBERSHIP_PRICE_KEYS), MEMBERSHIP_LAUNCH_KEY] } } }),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
  ]);
  const price = (plan: MembershipPlan) => {
    const value = Number(rows.find((row: { key: string }) => row.key === MEMBERSHIP_PRICE_KEYS[plan])?.value);
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
  };
  const monthlyPrice = price('MONTHLY');
  const yearlyPrice = price('YEARLY');
  const launch = Number(rows.find((row: { key: string }) => row.key === MEMBERSHIP_LAUNCH_KEY)?.value);
  const launchAfterCourses = Number.isInteger(launch) && launch > 0 ? launch : null;
  const launched = launchAfterCourses === null || publishedCourses > launchAfterCourses;
  return {
    currency: 'CHF',
    monthlyPrice,
    yearlyPrice,
    available: Boolean(monthlyPrice || yearlyPrice) && launched,
    publishedCourses,
    launchAfterCourses,
  };
}

// Stripe moved current_period_end from the subscription to its items in
// newer API versions - read whichever is there.
export function periodEnd(subscription: Stripe.Subscription): Date {
  const sub: any = subscription;
  const seconds = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? sub.cancel_at ?? Math.floor(Date.now() / 1000);
  return new Date(Number(seconds) * 1000);
}

export async function saveSubscription(prisma: PrismaClient, userId: string, plan: string, subscription: Stripe.Subscription) {
  const data = {
    plan,
    status: subscription.status,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null,
    currentPeriodEnd: periodEnd(subscription),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    checkedAt: new Date(),
  };
  return prisma.platformMembership.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}

export function membershipIsActive(membership: { status: string; currentPeriodEnd: Date } | null, now = new Date()): boolean {
  return Boolean(membership && ACTIVE_STATUSES.has(membership.status) && membership.currentPeriodEnd > now);
}

// The member's row, refreshed from Stripe once its period has passed.
export async function currentMembership(prisma: PrismaClient, userId: string) {
  const membership = await prisma.platformMembership.findUnique({ where: { userId } });
  if (!membership) return null;
  const now = Date.now();
  if (membership.currentPeriodEnd.getTime() > now || now - membership.checkedAt.getTime() < RECHECK_MS) return membership;
  try {
    const subscription = await stripe().subscriptions.retrieve(membership.stripeSubscriptionId);
    return await saveSubscription(prisma, userId, membership.plan, subscription);
  } catch {
    // Stripe unreachable: keep what we know, try again in an hour.
    return prisma.platformMembership.update({ where: { userId }, data: { checkedAt: new Date() } });
  }
}

export async function hasActiveMembership(prisma: PrismaClient, userId: string): Promise<boolean> {
  return membershipIsActive(await currentMembership(prisma, userId));
}

export async function createMembershipCheckout(prisma: PrismaClient, user: { id: string; email?: string | null }, plan: MembershipPlan, frontendUrl: string) {
  const offer = await membershipOffer(prisma);
  const price = plan === 'MONTHLY' ? offer.monthlyPrice : offer.yearlyPrice;
  if (!price || !offer.available) throw new Error('This membership plan is not on sale yet.');
  if (await hasActiveMembership(prisma, user.id)) throw new Error('You already have an active membership.');
  const metadata = { userId: user.id, type: 'membership', refId: plan };
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: offer.currency.toLowerCase(),
          product_data: { name: `mymusic.coach Plus (${plan === 'MONTHLY' ? 'monthly' : 'yearly'})`, description: 'Every course on mymusic.coach included' },
          unit_amount: Math.round(price * 100),
          recurring: { interval: plan === 'MONTHLY' ? 'month' : 'year' },
        },
        quantity: 1,
      },
    ],
    ...(user.email ? { customer_email: user.email } : {}),
    metadata,
    subscription_data: { metadata },
    success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=membership&ref=${plan}`,
    cancel_url: `${frontendUrl}/membership?cancelled=1`,
  });
  return { sessionId: session.id, checkoutUrl: session.url! };
}

// Called from the Stripe webhook when a membership checkout completes.
export async function activateMembershipFromCheckout(prisma: PrismaClient, session: Stripe.Checkout.Session) {
  const { userId, refId } = session.metadata ?? {};
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!userId || !subscriptionId) return null;
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  return saveSubscription(prisma, userId, refId === 'YEARLY' ? 'YEARLY' : 'MONTHLY', subscription);
}

// customer.subscription.updated / deleted, when Stripe sends them.
export async function syncMembershipSubscription(prisma: PrismaClient, subscription: Stripe.Subscription) {
  const membership = await prisma.platformMembership.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (!membership) return null;
  return saveSubscription(prisma, membership.userId, membership.plan, subscription);
}

export async function setMembershipCancellation(prisma: PrismaClient, userId: string, cancel: boolean) {
  const membership = await prisma.platformMembership.findUnique({ where: { userId } });
  if (!membership || !membershipIsActive(membership)) throw new Error('No active membership.');
  const subscription = await stripe().subscriptions.update(membership.stripeSubscriptionId, { cancel_at_period_end: cancel });
  return saveSubscription(prisma, userId, membership.plan, subscription);
}
