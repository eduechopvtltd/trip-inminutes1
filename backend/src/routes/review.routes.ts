// src/routes/review.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { z } from 'zod';

export async function reviewRoutes(app: FastifyInstance) {
  // Create review (authenticated)
  app.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const body = z.object({
      packageId: z.string(),
      rating: z.number().int().min(1).max(5),
      title: z.string().min(5).max(100),
      body: z.string().min(20).max(2000),
      images: z.array(z.string().url()).default([]),
    }).parse(req.body);

    const review = await prisma.review.create({
      data: { ...body, userId: req.user!.id, status: 'PENDING' },
    });

    // Recompute avg rating
    const stats = await prisma.review.aggregate({
      where: { packageId: body.packageId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { id: true },
    });
    await prisma.package.update({
      where: { id: body.packageId },
      data: { averageRating: stats._avg.rating ?? 0, reviewCount: stats._count.id },
    });

    return reply.status(201).send(review);
  });

  // Get approved reviews for a package (public)
  app.get('/package/:packageId', async (req: any, reply) => {
    const reviews = await prisma.review.findMany({
      where: { packageId: req.params.packageId, status: 'APPROVED' },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return reply.send(reviews);
  });

  // Admin: approve / reject
  app.patch('/:id/status', { preHandler: [authenticate, authorize('ADMIN')] }, async (req: any, reply) => {
    const { status } = z.object({ status: z.enum(['APPROVED', 'REJECTED']) }).parse(req.body);
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { status } });
    return reply.send(review);
  });
}
