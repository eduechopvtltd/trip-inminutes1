// src/services/amadeus.service.ts
import Amadeus from 'amadeus';

class AmadeusService {
  private amadeus: any;

  constructor() {
    this.amadeus = new Amadeus({
      clientId:     process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    });
  }

  /**
   * Search for flight offers
   * @param origin - IATA code (e.g. DEL)
   * @param destination - IATA code (e.g. DXB)
   * @param departureDate - YYYY-MM-DD
   * @param adults - Number of adults
   * @param travelClass - ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
   */
  async searchFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    adults: number;
    travelClass?: string;
  }) {
    try {
      const response = await this.amadeus.shopping.flightOffersSearch.get({
        originLocationCode:      params.origin,
        destinationLocationCode: params.destination,
        departureDate:           params.departureDate,
        adults:                  params.adults,
        travelClass:             params.travelClass ?? 'ECONOMY',
        max:                     10, // Limit to 10 for demo
      });

      return response.data;
    } catch (error: any) {
      console.error('Amadeus Flight Search Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch flight offers from Amadeus');
    }
  }

  /**
   * Get pricing for a specific flight offer
   */
  async getFlightPrice(flightOffer: any) {
    try {
      const response = await this.amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer],
          },
        })
      );
      return response.data;
    } catch (error: any) {
      console.error('Amadeus Flight Pricing Error:', error.response?.data || error.message);
      throw new Error('Failed to verify flight pricing');
    }
  }
}

export const amadeusService = new AmadeusService();
