// src/middleware/error.middleware.ts
import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function errorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode = error.statusCode ?? 500;

  // Zod validation errors re-wrapped by fastify
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      details: error.validation,
    });
  }

  // Prisma unique constraint
  if ((error as { code?: string }).code === 'P2002') {
    return reply.status(409).send({ error: 'Resource already exists' });
  }

  // Prisma not found
  if ((error as { code?: string }).code === 'P2025') {
    return reply.status(404).send({ error: 'Resource not found' });
  }

  console.error('[Error]', error.message, error.stack);

  return reply.status(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
}

// ─────────────────────────────────────────────────
// src/utils/helpers.ts
// ─────────────────────────────────────────────────
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
}

export function paginate(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
