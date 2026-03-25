// src/routes/booking.routes.ts
import type { FastifyInstance } from 'fastify';
import { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings, updateBookingStatus } from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export async function bookingRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [authenticate] }, createBooking);
  app.get('/my', { preHandler: [authenticate] }, getUserBookings);
  app.get('/my/:id', { preHandler: [authenticate] }, getBookingById as any);
  app.patch('/my/:id/cancel', { preHandler: [authenticate] }, cancelBooking as any);
  
  // Admin only
  app.get('/', { preHandler: [authenticate, authorize('ADMIN')] }, getAllBookings);
  app.patch('/:id/status', { preHandler: [authenticate, authorize('ADMIN')] }, updateBookingStatus as any);
}
