// Phase 5 commercial terms - single lesson, prepaid packages, upfront-term
// subscriptions. Kept in one place per "explicit stored commercial terms,
// not scattered UI calculations, so the business can change defaults later
// without altering existing contracts": every purchase snapshots the
// numbers this module produces onto the purchase row at checkout time, so
// a later change here (or to the AdminSetting rows below) only affects
// future purchases.
//
// Decisions made here in the absence of a stated answer (Prompt 5 asked
// for exactly this list when requirements are ambiguous) - each is a
// reasonable, conservative default, explicit and easy to revisit:
//   1. Renewal: NOT implemented this phase - a subscription purchase is a
//      single upfront payment for a fixed term (6 or 12 months) with no
//      auto-renewal. Renewing at term end requires a new purchase.
//   2. Cancellation at term end: a student can cancel anytime
//      (cancelSubscription); cancellation takes effect immediately (access
//      revoked), no partial refund for the unused remainder - there is no
//      proration engine in this phase (see #4).
//   3. Failed payment: not applicable this phase - there is no recurring
//      charge to fail (the whole term is paid upfront via one Stripe
//      Checkout session, using the existing one-time-payment
//      infrastructure, not a Stripe Subscription object).
//   4. Proration: none. Changing plans or terms takes a new purchase, not
//      a prorated swap of the current one.
//   5. Unused monthly included hours: do NOT roll over - the
//      includedHoursPerMonth figure is descriptive/informational for this
//      phase (no per-month hour-consumption ledger exists yet, only the
//      lesson-package credit ledger does). Implementing real monthly-hour
//      tracking and rollover policy is follow-up work alongside true
//      recurring billing (see the schema.prisma comment on this section).

export const ALLOWED_PACKAGE_SIZES = [5, 10, 20] as const;
export const ALLOWED_SUBSCRIPTION_TERM_MONTHS = [6, 12] as const;

export function isValidPackageSize(value: unknown): value is (typeof ALLOWED_PACKAGE_SIZES)[number] {
  return ALLOWED_PACKAGE_SIZES.includes(value as any);
}
export function isValidSubscriptionTermMonths(value: unknown): value is (typeof ALLOWED_SUBSCRIPTION_TERM_MONTHS)[number] {
  return ALLOWED_SUBSCRIPTION_TERM_MONTHS.includes(value as any);
}

// AdminSetting keys - see apps/api/src/resolvers/admin.ts's existing
// adminSettings/updateAdminSetting for how these are read/written. Default
// discounts match the requested business default (10%/20%) and apply only
// when no override is stored.
export const SUBSCRIPTION_DISCOUNT_SETTING_KEY: Record<6 | 12, string> = {
  6: 'subscription_discount_pct_6mo',
  12: 'subscription_discount_pct_12mo',
};
const DEFAULT_SUBSCRIPTION_DISCOUNT_PCT: Record<6 | 12, number> = { 6: 10, 12: 20 };

export function defaultSubscriptionDiscountPct(termMonths: 6 | 12): number {
  return DEFAULT_SUBSCRIPTION_DISCOUNT_PCT[termMonths];
}

// Minimal shape needed from PrismaClient - avoids importing the generated
// client type into this otherwise-pure module.
interface AdminSettingReader {
  adminSetting: { findUnique(args: { where: { key: string } }): Promise<{ value: string } | null> };
}

/**
 * Reads the live discount setting for a term (see admin.ts's adminSettings
 * / updateAdminSetting), falling back to the requested 10%/20% business
 * default when no override is stored. Only ever used at the moment of
 * purchase - the result gets snapshotted onto SubscriptionPurchase.
 * discountPct, never re-read for an existing purchase.
 */
export async function currentSubscriptionDiscountPct(prisma: AdminSettingReader, termMonths: 6 | 12): Promise<number> {
  const setting = await prisma.adminSetting.findUnique({ where: { key: SUBSCRIPTION_DISCOUNT_SETTING_KEY[termMonths] } });
  if (!setting) return defaultSubscriptionDiscountPct(termMonths);
  const parsed = Number(setting.value);
  return Number.isFinite(parsed) ? parsed : defaultSubscriptionDiscountPct(termMonths);
}

/**
 * The full-term upfront price for a subscription, in the same currency
 * unit as monthlyPrice (not cents) - integer-cents arithmetic internally
 * to avoid floating-point drift, then converted back.
 *   equivalentMonthlyTotal = monthlyPrice x termMonths
 *   total = equivalentMonthlyTotal x (100 - discountPct) / 100
 */
export function computeSubscriptionTotal(monthlyPrice: number, termMonths: number, discountPct: number): number {
  const monthlyCents = Math.round(monthlyPrice * 100);
  const totalCentsBeforeDiscount = monthlyCents * termMonths;
  const totalCentsAfterDiscount = Math.round((totalCentsBeforeDiscount * (100 - discountPct)) / 100);
  return totalCentsAfterDiscount / 100;
}

/** The pre-discount total, for showing the "effective hourly price" / savings comparison honestly (never a misleading number). */
export function computeSubscriptionUndiscountedTotal(monthlyPrice: number, termMonths: number): number {
  return Math.round(monthlyPrice * 100 * termMonths) / 100;
}
