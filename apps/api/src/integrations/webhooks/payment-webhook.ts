import type { Request, Response } from 'express';
import Stripe from 'stripe';
import type { PrismaClient } from '@my-music-coach/database';
import { logger } from '../../utils/logger.js';

export function createStripeWebhookHandler(
  prisma: PrismaClient,
  stripeSecretKey: string,
  stripeWebhookSecret: string,
) {
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' });

  return async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    let event: Stripe.Event;
    try {
      // Use raw body for Stripe signature verification. Note: Ensure `req.body` is raw.
      // In a real express app, you'd need `express.raw({type: 'application/json'})` for this route.
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        stripeWebhookSecret,
      );
    } catch (err) {
      logger.warn({ err }, 'Stripe webhook signature verification failed');
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`);
      return;
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(prisma, paymentIntent.id);
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(prisma, paymentIntent.id);
      }
      res.json({ received: true });
    } catch (err) {
      logger.error({ err, eventId: event.id }, 'Error processing Stripe webhook');
      res.status(500).send('Internal Server Error');
    }
  };
}

async function handlePaymentSucceeded(prisma: PrismaClient, providerRef: string) {
  const payment = await prisma.payment.findFirst({
    where: { providerRef, provider: 'STRIPE' },
    include: { enrollment: true, eventBooking: true },
  });

  if (!payment) {
    logger.warn({ providerRef }, 'Stripe payment not found in DB');
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'SUCCEEDED' },
  });

  // Fulfill enrollment if it's for a course
  if (payment.enrollment) {
    // This could call Moodle sync directly or wait for the scheduler
    logger.info({ enrollmentId: payment.enrollment.id }, 'Enrollment fulfilled via payment');
  }

  // Fulfill event booking
  if (payment.eventBooking) {
    await prisma.eventBooking.update({
      where: { id: payment.eventBooking.id },
      data: { status: 'CONFIRMED' },
    });
    logger.info({ eventBookingId: payment.eventBooking.id }, 'Event booking fulfilled via payment');
  }
}

async function handlePaymentFailed(prisma: PrismaClient, providerRef: string) {
  await prisma.payment.updateMany({
    where: { providerRef, provider: 'STRIPE' },
    data: { status: 'FAILED' },
  });
}
