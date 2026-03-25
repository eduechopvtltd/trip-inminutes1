// src/routes/payment.routes.ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { prisma } from '../lib/prisma.js';

export async function paymentRoutes(app: FastifyInstance) {
  // Create Razorpay order for a booking
  app.post('/create-order', { preHandler: [authenticate] }, async (req, reply) => {
    const { bookingId } = z.object({ bookingId: z.string() }).parse(req.body);

    // Verify the booking belongs to this user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user!.id },
    });
    if (!booking) return reply.status(404).send({ error: 'Booking not found' });
    if (booking.paymentStatus === 'PAID') {
      return reply.status(400).send({ error: 'Booking already paid' });
    }

    const order = await paymentService.createOrder(bookingId);
    return reply.send(order);
  });

  // Verify payment after Razorpay callback
  app.post('/verify', { preHandler: [authenticate] }, async (req, reply) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
    }).parse(req.body);

    const result = await paymentService.confirmPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    return reply.send(result);
  });

  // Razorpay webhook (server-side event, no auth)
  app.post('/webhook', async (req, reply) => {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const { createHmac } = await import('crypto');
      const expectedSig = createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (expectedSig !== signature) {
        return reply.status(400).send({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body as { event: string; payload: { payment: { entity: { order_id: string; id: string } } } };

    if (event.event === 'payment.captured') {
      const { order_id, id } = event.payload.payment.entity;
      await paymentService.confirmPayment(order_id, id, 'webhook-verified');
    }

    return reply.send({ received: true });
  });

  // Get payment history for a booking
  app.get('/booking/:bookingId', { preHandler: [authenticate] }, async (req: any, reply) => {
    const payments = await prisma.payment.findMany({
      where: {
        bookingId: req.params.bookingId,
        booking: { userId: req.user!.id },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(payments);
  });
}
