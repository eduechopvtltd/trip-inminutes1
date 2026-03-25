// src/controllers/flight.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { amadeusService } from '../services/amadeus.service.js';

export const flightController = {
  /**
   * GET /api/v1/flights/search
   */
  search: async (req: FastifyRequest, reply: FastifyReply) => {
    const { origin, destination, departureDate, adults, travelClass } = req.query as any;

    if (!origin || !destination || !departureDate) {
      return reply.status(400).send({ error: 'Origin, destination, and departureDate are required' });
    }

    try {
      const flights = await amadeusService.searchFlights({
        origin,
        destination,
        departureDate,
        adults: parseInt(adults || '1'),
        travelClass,
      });

      return reply.send({ success: true, data: flights });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  },

  /**
   * POST /api/v1/flights/price
   */
  price: async (req: FastifyRequest, reply: FastifyReply) => {
    const { flightOffer } = req.body as any;

    if (!flightOffer) {
      return reply.status(400).send({ error: 'Flight offer is required' });
    }

    try {
      const priceResult = await amadeusService.getFlightPrice(flightOffer);
      return reply.send({ success: true, data: priceResult });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  },
};
