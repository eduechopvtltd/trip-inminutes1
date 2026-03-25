// src/controllers/booking.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { emailService } from '../services/email.service.js';

const createBookingSchema = z.object({
  packageId: z.string().optional(),
  bookingType: z.enum(['PACKAGE', 'FLIGHT', 'HOTEL', 'CUSTOM']).default('PACKAGE'),
  travelDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  adults: z.number().int().min(1).max(20).default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  travelers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string().optional(),
    passportNumber: z.string().optional(),
    passportExpiry: z.string().optional(),
  })).min(1),
  specialRequests: z.string().max(1000).optional(),
});

// ── Create booking
export async function createBooking(req: FastifyRequest, reply: FastifyReply) {
  const body = createBookingSchema.safeParse(req.body);
  if (!body.success) {
    return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
  }

  const userId = req.user!.id;
  let totalAmount = 0;

  if (body.data.packageId) {
    const pkg = await prisma.package.findUnique({ where: { id: body.data.packageId } });
    if (!pkg || !pkg.isActive) {
      return reply.status(404).send({ error: 'Package not found' });
    }
    const price = Number(pkg.discountedPrice ?? pkg.basePrice);
    totalAmount = price * (body.data.adults + body.data.children * 0.5);
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      packageId: body.data.packageId,
      bookingType: body.data.bookingType,
      travelDate: new Date(body.data.travelDate),
      returnDate: body.data.returnDate ? new Date(body.data.returnDate) : null,
      adults: body.data.adults,
      children: body.data.children,
      infants: body.data.infants,
      travelers: body.data.travelers,
      specialRequests: body.data.specialRequests,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
    include: {
      package: { select: { title: true, coverImage: true } },
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  // Notify user
  await emailService.sendBookingConfirmation(
    booking.user.email,
    booking.user.firstName,
    booking.bookingRef,
    booking.package?.title ?? 'Custom Booking',
    totalAmount,
  );

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'Booking Received',
      message: `Your booking #${booking.bookingRef} is confirmed and under review.`,
      type: 'BOOKING',
      actionUrl: `/dashboard/bookings/${booking.id}`,
    },
  });

  return reply.status(201).send(booking);
}

// ── Get user bookings
export async function getUserBookings(req: FastifyRequest, reply: FastifyReply) {
  const query = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']).optional(),
  }).safeParse(req.query);

  if (!query.success) return reply.status(400).send({ error: 'Invalid query' });

  const { page, limit, status } = query.data;
  const userId = req.user!.id;

  const where = { userId, ...(status && { status }) };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        package: { select: { title: true, coverImage: true, duration: true } },
        payments: { select: { id: true, amount: true, status: true, method: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return reply.send({
    data: bookings,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// ── Get single booking
export async function getBookingById(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: {
      package: true,
      payments: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!booking) return reply.status(404).send({ error: 'Booking not found' });
  return reply.send(booking);
}

// ── Cancel booking
export async function cancelBooking(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { reason } = z.object({ reason: z.string().min(10).max(500) }).parse(req.body);
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });

  if (!booking) return reply.status(404).send({ error: 'Booking not found' });
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    return reply.status(400).send({ error: 'Booking cannot be cancelled in its current state' });
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
  });

  return reply.send({ message: 'Booking cancelled', booking: updated });
}

// ── Admin: get all bookings
export async function getAllBookings(req: FastifyRequest, reply: FastifyReply) {
  const query = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    status: z.string().optional(),
    search: z.string().optional(),
  }).parse(req.query);

  const { page, limit, status, search } = query;
  const where: Record<string, unknown> = {};
  if (status) where['status'] = status;
  if (search) {
    where['OR'] = [
      { bookingRef: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        package: { select: { title: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return reply.send({
    data: bookings,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// ── Admin: update booking status
export async function updateBookingStatus(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { status } = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']),
  }).parse(req.body);

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return reply.status(404).send({ error: 'Booking not found' });

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { 
      status,
      ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
      ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
    },
  });

  return reply.send(updated);
}

