// src/routes/user.routes.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function userRoutes(app: FastifyInstance) {
  // Update own profile
  app.patch('/profile', { preHandler: [authenticate] }, async (req, reply) => {
    const body = z.object({
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().datetime().optional(),
      nationality: z.string().optional(),
      passportNumber: z.string().optional(),
      passportExpiry: z.string().datetime().optional(),
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: body,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, nationality: true,
        dateOfBirth: true, passportNumber: true,
      },
    });
    return reply.send({ user });
  });

  // Change password
  app.patch('/change-password', { preHandler: [authenticate] }, async (req, reply) => {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return reply.status(400).send({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
    return reply.send({ message: 'Password changed successfully' });
  });

  // Get notifications
  app.get('/notifications', { preHandler: [authenticate] }, async (req, reply) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return reply.send(notifications);
  });

  // Mark single notification read
  app.patch('/notifications/:id/read', { preHandler: [authenticate] }, async (req: any, reply) => {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    return reply.send({ ok: true });
  });

  // Mark ALL notifications read
  app.patch('/notifications/read-all', { preHandler: [authenticate] }, async (req, reply) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    return reply.send({ message: 'All notifications marked as read' });
  });

  // Admin: list all users
  app.get('/', { preHandler: [authenticate, authorize('ADMIN')] }, async (req, reply) => {
    const { page = 1, limit = 20, search } = req.query as { page?: number; limit?: number; search?: string };
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { firstName: { contains: search, mode: 'insensitive' as const } }] }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, isEmailVerified: true, createdAt: true,
          _count: { select: { bookings: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return reply.send({ data: users, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } });
  });

  // Admin: toggle user active status
  app.patch('/:id/toggle-active', { preHandler: [authenticate, authorize('ADMIN')] }, async (req: any, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
    });
    return reply.send({ message: `User ${updated.isActive ? 'activated' : 'deactivated'}`, isActive: updated.isActive });
  });

  // Avatar upload
  app.post('/avatar', { preHandler: [authenticate] }, async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.status(400).send({ error: 'No file uploaded' });

    // In a real prod setup with Cloudinary:
    // const result = await cloudinary.uploader.upload(data.file);
    // const avatarUrl = result.secure_url;
    
    // For now, we simulate a successful upload and use a placeholder or the original filename
    // to update the user's profile.
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user!.id}`;

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: avatarUrl },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, nationality: true,
        dateOfBirth: true, passportNumber: true,
      },
    });

    return reply.send({ user: updated });
  });
}
