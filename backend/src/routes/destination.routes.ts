// src/routes/destination.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { cache } from '../lib/redis.js';
import { z } from 'zod';
import slugify from 'slugify';

export async function destinationRoutes(app: FastifyInstance) {
  // Public: list destinations
  app.get('/', async (req, reply) => {
    const { isDomestic, popular } = req.query as { isDomestic?: string; popular?: string };
    const cacheKey = `destinations:${isDomestic ?? 'all'}:${popular ?? 'all'}`;
    const cached = await cache.get(cacheKey);
    if (cached) return reply.send(cached);

    const where: Record<string, unknown> = {};
    if (isDomestic !== undefined) where['isDomestic'] = isDomestic === 'true';
    if (popular === 'true') where['isPopular'] = true;

    const destinations = await prisma.destination.findMany({
      where,
      orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
    });

    await cache.set(cacheKey, destinations, 600);
    return reply.send(destinations);
  });

  // Public: single destination by slug
  app.get('/:slug', async (req: any, reply) => {
    const cacheKey = `destination:${req.params.slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) return reply.send(cached);

    const dest = await prisma.destination.findUnique({
      where: { slug: req.params.slug },
      include: {
        packages: {
          where: { isActive: true },
          take: 8,
          orderBy: { totalBookings: 'desc' },
          include: { destination: { select: { name: true, country: true } } },
        },
      },
    });

    if (!dest) return reply.status(404).send({ error: 'Destination not found' });
    await cache.set(cacheKey, dest, 600);
    return reply.send(dest);
  });

  // Admin: create destination
  app.post('/', { preHandler: [authenticate, authorize('ADMIN')] }, async (req, reply) => {
    const body = z.object({
      name: z.string().min(2),
      country: z.string().min(2),
      continent: z.string().min(2),
      description: z.string().min(20),
      coverImage: z.string().url(),
      images: z.array(z.string().url()).default([]),
      isPopular: z.boolean().default(false),
      isDomestic: z.boolean().default(false),
      metaTitle: z.string().optional(),
      metaDesc: z.string().optional(),
    }).parse(req.body);

    let slug = slugify(body.name, { lower: true, strict: true });
    const existing = await prisma.destination.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const dest = await prisma.destination.create({ data: { ...body, slug } });
    await cache.invalidatePattern('destinations:*');
    return reply.status(201).send(dest);
  });

  // Admin: update destination
  app.patch('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, async (req: any, reply) => {
    const body = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      coverImage: z.string().url().optional(),
      images: z.array(z.string().url()).optional(),
      isPopular: z.boolean().optional(),
      isDomestic: z.boolean().optional(),
    }).parse(req.body);

    const dest = await prisma.destination.update({ where: { id: req.params.id }, data: body });
    await cache.invalidatePattern('destinations:*');
    await cache.del(`destination:${dest.slug}`);
    return reply.send(dest);
  });
}
