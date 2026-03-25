// src/routes/wishlist.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function wishlistRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        package: {
          include: { destination: { select: { name: true, country: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(items);
  });

  app.post('/:packageId', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { packageId } = req.params;
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_packageId: { userId: req.user!.id, packageId } },
    });
    if (existing) return reply.status(409).send({ error: 'Already in wishlist' });
    const item = await prisma.wishlistItem.create({ data: { userId: req.user!.id, packageId } });
    return reply.status(201).send(item);
  });

  app.delete('/:packageId', { preHandler: [authenticate] }, async (req: any, reply) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.id, packageId: req.params.packageId },
    });
    return reply.send({ message: 'Removed from wishlist' });
  });
}
