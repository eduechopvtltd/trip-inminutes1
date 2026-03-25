// src/hooks/useFlights.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { flightsApi } from '@/lib/api';

export function useFlightSearch(params: { 
  origin: string; 
  destination: string; 
  departureDate: string; 
  adults: number; 
  travelClass?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['flights', 'search', params],
    queryFn: async () => {
      const { data } = await flightsApi.search(params);
      return data.data; // Response is { success: true, data: [...] }
    },
    enabled: !!params.origin && !!params.destination && !!params.departureDate && params.enabled !== false,
    staleTime: 0, // Flight prices change fast, don't cache too long
  });
}

export function useFlightPricing() {
  return useMutation({
    mutationFn: async (flightOffer: any) => {
      const { data } = await flightsApi.price(flightOffer);
      return data.data;
    },
  });
}
