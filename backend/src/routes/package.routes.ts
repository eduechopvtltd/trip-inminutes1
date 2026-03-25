// src/routes/package.routes.ts
import type { FastifyInstance } from 'fastify';
import {
  getPackages, getPackageBySlug, createPackage,
  updatePackage, deletePackage, getTrendingPackages, getFeaturedPackages,
} from '../controllers/package.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export async function packageRoutes(app: FastifyInstance) {
  app.get('/', getPackages);
  app.get('/trending', getTrendingPackages as any);
  app.get('/featured', getFeaturedPackages as any);
  app.get('/:slug', getPackageBySlug as any);

  // Admin only
  app.post('/', { preHandler: [authenticate, authorize('ADMIN')] }, createPackage as any);
  app.put('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, updatePackage as any);
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, deletePackage as any);
}
