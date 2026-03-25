// src/routes/auth.routes.ts
import type { FastifyInstance } from 'fastify';
import {
  register, login, refreshToken, logout,
  verifyEmail, forgotPassword, resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/refresh', refreshToken);
  app.post('/logout', { preHandler: [authenticate] }, logout);
  app.post('/verify-email', verifyEmail);
  app.post('/forgot-password', forgotPassword);
  app.post('/reset-password', resetPassword);

  // Get current user (me)
  app.get('/me', { preHandler: [authenticate] }, async (req, reply) => {
    const user = await import('../lib/prisma.js').then(({ prisma }) =>
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, avatar: true, role: true,
          isEmailVerified: true, isPhoneVerified: true,
          dateOfBirth: true, nationality: true,
          createdAt: true,
        },
      })
    );
    return reply.send({ user });
  });
}
