// src/routes/enquiry.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { z } from 'zod';

export async function enquiryRoutes(app: FastifyInstance) {
  // Public: submit enquiry
  app.post('/', async (req, reply) => {
    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(7),
      subject: z.string().min(5),
      message: z.string().min(20),
      packageId: z.string().optional(),
      enquiryType: z.enum(['PACKAGE', 'CORPORATE', 'MICE', 'GENERAL']).default('GENERAL'),
    }).parse(req.body);

    const enquiry = await prisma.enquiry.create({ data: body });
    return reply.status(201).send({ message: 'Enquiry submitted successfully', id: enquiry.id });
  });

  // Admin: list all enquiries
  app.get('/', { preHandler: [authenticate, authorize('ADMIN')] }, async (req, reply) => {
    const { page = 1, limit = 30, isRead } = req.query as { page?: number; limit?: number; isRead?: string };
    const where = isRead !== undefined ? { isRead: isRead === 'true' } : {};
    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return reply.send({ data: enquiries, meta: { total, page, limit } });
  });

  // Admin: mark as read / respond
  app.patch('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, async (req: any, reply) => {
    const body = z.object({
      isRead: z.boolean().optional(),
      response: z.string().optional(),
    }).parse(req.body);

    const enquiry = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: { ...body, ...(body.response ? { respondedAt: new Date() } : {}) },
    });
    return reply.send(enquiry);
  });
}
