import Stripe from 'stripe';
import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required but was not set.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

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
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price_data: { currency, product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=${type}&ref=${refId}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          metadata: { userId: user.id, type, refId },
        });
        return { sessionId: session.id, checkoutUrl: session.url! };
      }

      // TODO: Yapeal integration
      throw new GraphQLError('Yapeal integration coming soon.', { extensions: { code: 'NOT_IMPLEMENTED' } });
    },

    async handleWebhook(_: unknown, { provider, payload }: any, { prisma }: GraphQLContext) {
      if (provider === 'STRIPE') {
        const event = payload as Stripe.Event;
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.CheckoutSession;
          const { userId, type, refId } = session.metadata ?? {};

          const payment = await prisma.payment.create({
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

          if (type === 'course') {
            await prisma.enrollment.upsert({
              where: { userId_courseId: { userId: userId!, courseId: refId! } },
              update: { paymentId: payment.id },
              create: { userId: userId!, courseId: refId!, paymentId: payment.id },
            });
          } else if (type === 'booking') {
            await prisma.booking.update({ where: { id: refId }, data: { paymentId: payment.id, status: 'CONFIRMED' } });
          } else if (type === 'event') {
            await prisma.eventBooking.upsert({
              where: { userId_eventId: { userId: userId!, eventId: refId! } },
              update: { paymentId: payment.id, status: 'CONFIRMED' },
              create: { userId: userId!, eventId: refId!, paymentId: payment.id, status: 'CONFIRMED' },
            });
          }
        }
      }
      return true;
    },
  },
};
