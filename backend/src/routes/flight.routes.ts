// src/routes/flight.routes.ts
import type { FastifyInstance } from 'fastify';
import { flightController } from '../controllers/flight.controller.js';

export async function flightRoutes(app: FastifyInstance) {
  // GET /api/v1/flights/search?origin=DEL&destination=DXB&departureDate=2024-12-01&adults=1
  app.get('/search', flightController.search);

  // POST /api/v1/flights/price
  // body: { flightOffer: { ... } }
  app.post('/price', flightController.price);
}
