// src/middleware/auth.middleware.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Role } from '@prisma/client';
import { jwtUtils } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/redis.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: Role;
    };
  }
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const token = jwtUtils.extractFromHeader(req.headers.authorization);
  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'No token provided' });
  }

  // Check token blacklist (logged out tokens)
  const isBlacklisted = await cache.get<boolean>(`blacklist:${token}`);
  if (isBlacklisted) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Token revoked' });
  }

  try {
    const payload = jwtUtils.verifyAccess(token);

    // Check user still active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User not found or deactivated' });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
  } catch {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export function authorize(...roles: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `This action requires one of: ${roles.join(', ')} role`,
      });
    }
  };
}
