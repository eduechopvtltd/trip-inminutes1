// src/hooks/usePackages.ts
import { useQuery } from '@tanstack/react-query';
import { packagesApi } from '@/lib/api';
import type { Package, PackageFilters, PaginatedResponse } from '@/types';

export function usePackages(filters: PackageFilters = {}) {
  return useQuery<PaginatedResponse<Package>>({
    queryKey: ['packages', filters],
    queryFn: () => packagesApi.list(filters).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useTrendingPackages() {
  return useQuery<Package[]>({
    queryKey: ['packages', 'trending'],
    queryFn: () => packagesApi.trending().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedPackages() {
  return useQuery<Package[]>({
    queryKey: ['packages', 'featured'],
    queryFn: () => packagesApi.featured().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePackage(slug: string) {
  return useQuery<Package>({
    queryKey: ['package', slug],
    queryFn: () => packagesApi.bySlug(slug).then((r) => r.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
