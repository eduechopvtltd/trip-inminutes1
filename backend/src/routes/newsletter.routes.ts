// src/routes/newsletter.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { z } from 'zod';

export async function newsletterRoutes(app: FastifyInstance) {
  app.post('/subscribe', async (req, reply) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, unsubscribedAt: null },
      create: { email },
    });
    return reply.send({ message: 'Subscribed successfully!' });
  });

  app.post('/unsubscribe', async (req, reply) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    }).catch(() => null); // Ignore if not found
    return reply.send({ message: 'Unsubscribed successfully.' });
  });

  // Admin: get subscriber count & list
  app.get('/subscribers', { preHandler: [authenticate, authorize('ADMIN')] }, async (_req, reply) => {
    const [total, active] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);
    return reply.send({ total, active });
  });
}
