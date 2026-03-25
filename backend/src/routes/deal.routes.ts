// src/routes/deal.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { z } from 'zod';

export async function dealRoutes(app: FastifyInstance) {
  // Public: list active deals
  app.get('/', async (_req, reply) => {
    const deals = await prisma.deal.findMany({
      where: { isActive: true, validFrom: { lte: new Date() }, validTo: { gte: new Date() } },
      orderBy: { discountValue: 'desc' },
    });
    return reply.send(deals);
  });

  // Public: validate coupon code
  app.post('/validate', async (req, reply) => {
    const { code, amount } = z.object({
      code: z.string().min(1),
      amount: z.number().positive(),
    }).parse(req.body);

    const deal = await prisma.deal.findFirst({
      where: { code, isActive: true, validFrom: { lte: new Date() }, validTo: { gte: new Date() } },
    });
    if (!deal) return reply.status(404).send({ error: 'Invalid or expired coupon code' });

    if (deal.usageLimit && deal.usedCount >= deal.usageLimit)
      return reply.status(400).send({ error: 'Coupon usage limit reached' });

    if (deal.minAmount && amount < Number(deal.minAmount))
      return reply.status(400).send({ error: `Minimum order value of ₹${deal.minAmount} required` });

    const discount = deal.discountType === 'PERCENTAGE'
      ? Math.min(
          (amount * Number(deal.discountValue)) / 100,
          deal.maxDiscount ? Number(deal.maxDiscount) : Infinity,
        )
      : Number(deal.discountValue);

    return reply.send({
      valid: true,
      dealId: deal.id,
      title: deal.title,
      discount,
      finalAmount: amount - discount,
    });
  });

  // Admin: create deal
  app.post('/', { preHandler: [authenticate, authorize('ADMIN')] }, async (req, reply) => {
    const data = z.object({
      title: z.string(),
      description: z.string(),
      code: z.string().optional(),
      discountType: z.enum(['PERCENTAGE', 'FLAT']),
      discountValue: z.number().positive(),
      minAmount: z.number().optional(),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().int().optional(),
      validFrom: z.string().datetime(),
      validTo: z.string().datetime(),
    }).parse(req.body);

    const deal = await prisma.deal.create({
      data: { ...data, validFrom: new Date(data.validFrom), validTo: new Date(data.validTo) },
    });
    return reply.status(201).send(deal);
  });

  // Admin: toggle active
  app.patch('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, async (req: any, reply) => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const deal = await prisma.deal.update({ where: { id: req.params.id }, data: { isActive } });
    return reply.send(deal);
  });
}
