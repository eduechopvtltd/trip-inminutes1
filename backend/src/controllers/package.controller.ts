// src/controllers/package.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import slugify from 'slugify';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/redis.js';

const packageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  type: z.enum(['INTERNATIONAL', 'DOMESTIC', 'HONEYMOON', 'ADVENTURE', 'CORPORATE', 'PILGRIMAGE', 'CRUISE', 'WILDLIFE']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minDuration: z.coerce.number().optional(),
  maxDuration: z.coerce.number().optional(),
  destinationId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'bookings', 'newest']).default('newest'),
  featured: z.coerce.boolean().optional(),
});

const packageCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  highlights: z.array(z.string()).min(1),
  type: z.enum(['INTERNATIONAL', 'DOMESTIC', 'HONEYMOON', 'ADVENTURE', 'CORPORATE', 'PILGRIMAGE', 'CRUISE', 'WILDLIFE']),
  destinationId: z.string(),
  duration: z.number().int().min(1).max(60),
  minGroupSize: z.number().int().min(1).default(1),
  maxGroupSize: z.number().int().max(100).default(30),
  basePrice: z.number().positive(),
  discountedPrice: z.number().positive().optional(),
  coverImage: z.string().url(),
  images: z.array(z.string().url()).default([]),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.array(z.object({
    day: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    activities: z.array(z.string()).default([]),
  })),
  isFeatured: z.boolean().default(false),
  badge: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

// ── GET all packages
export async function getPackages(req: FastifyRequest, reply: FastifyReply) {
  const query = packageQuerySchema.safeParse(req.query);
  if (!query.success) {
    return reply.status(400).send({ error: 'Invalid query params', details: query.error.flatten() });
  }

  const { page, limit, type, minPrice, maxPrice, minDuration, maxDuration,
    destinationId, search, sortBy, featured } = query.data;

  const cacheKey = `packages:${JSON.stringify(query.data)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return reply.send(cached);

  const where: Record<string, unknown> = { isActive: true };
  if (type) where['type'] = type;
  if (destinationId) where['destinationId'] = destinationId;
  if (featured !== undefined) where['isFeatured'] = featured;
  if (minPrice || maxPrice) {
    where['basePrice'] = {
      ...(minPrice && { gte: minPrice }),
      ...(maxPrice && { lte: maxPrice }),
    };
  }
  if (minDuration || maxDuration) {
    where['duration'] = {
      ...(minDuration && { gte: minDuration }),
      ...(maxDuration && { lte: maxDuration }),
    };
  }
  if (search) {
    where['OR'] = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Record<string, unknown> = {};
  const sortOrder = sortBy.endsWith('_asc') ? 'asc' : 'desc';
  if (sortBy.startsWith('price')) {
    orderBy['basePrice'] = sortOrder;
  } else if (sortBy === 'rating') {
    orderBy['averageRating'] = 'desc';
  } else if (sortBy === 'bookings') {
    orderBy['totalBookings'] = 'desc';
  } else {
    orderBy['createdAt'] = 'desc';
  }

  const [total, packages] = await Promise.all([
    prisma.package.count({ where }),
    prisma.package.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        destination: { select: { id: true, name: true, country: true, continent: true } },
      },
    }),
  ]);

  const result = {
    data: packages,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };

  await cache.set(cacheKey, result, 300); // 5 min cache for commercial scale
  return reply.send(result);
}

// ── GET single package by slug
export async function getPackageBySlug(req: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
  const { slug } = req.params;

  const cacheKey = `package:${slug}`;
  const cached = await cache.get(cacheKey);
  if (cached) return reply.send(cached);

  const pkg = await prisma.package.findUnique({
    where: { slug, isActive: true },
    include: {
      destination: true,
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!pkg) return reply.status(404).send({ error: 'Package not found' });

  await cache.set(cacheKey, pkg, 300);
  return reply.send(pkg);
}

// ── CREATE package (admin)
export async function createPackage(req: FastifyRequest, reply: FastifyReply) {
  const body = packageCreateSchema.safeParse(req.body);
  if (!body.success) {
    return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
  }

  const slug = slugify(body.data.title, { lower: true, strict: true });
  const existingSlug = await prisma.package.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const pkg = await prisma.package.create({
    data: { ...body.data, slug: finalSlug },
  });

  await cache.invalidatePattern('packages:*');
  return reply.status(201).send(pkg);
}

// ── UPDATE package (admin)
export async function updatePackage(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = req.params;
  const body = packageCreateSchema.partial().safeParse(req.body);
  if (!body.success) {
    return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
  }

  const pkg = await prisma.package.update({ where: { id }, data: body.data });
  await cache.invalidatePattern('packages:*');
  await cache.del(`package:${pkg.slug}`);
  return reply.send(pkg);
}

// ── DELETE package (admin)
export async function deletePackage(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = req.params;
  await prisma.package.update({ where: { id }, data: { isActive: false } });
  await cache.invalidatePattern('packages:*');
  return reply.send({ message: 'Package deactivated' });
}

// ── GET trending packages
export async function getTrendingPackages(_req: FastifyRequest, reply: FastifyReply) {
  const cacheKey = 'packages:trending';
  const cached = await cache.get(cacheKey);
  if (cached) return reply.send(cached);

  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { totalBookings: 'desc' },
    take: 12,
    include: { destination: { select: { name: true, country: true } } },
  });

  await cache.set(cacheKey, packages, 600); // 10 min
  return reply.send(packages);
}

// ── GET featured packages
export async function getFeaturedPackages(_req: FastifyRequest, reply: FastifyReply) {
  const cacheKey = 'packages:featured';
  const cached = await cache.get(cacheKey);
  if (cached) return reply.send(cached);

  const packages = await prisma.package.findMany({
    where: { isActive: true, isFeatured: true },
    take: 12,
    include: { destination: { select: { name: true, country: true } } },
  });

  await cache.set(cacheKey, packages, 600);
  return reply.send(packages);
}
