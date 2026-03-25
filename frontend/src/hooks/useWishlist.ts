// src/hooks/useWishlist.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { wishlistApi } from '@/lib/api';
import { useWishlistStore, useAuthStore } from '@/store/auth.store';

export function useWishlist() {
  const { toggle, has } = useWishlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (packageId: string) => wishlistApi.add(packageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (packageId: string) => wishlistApi.remove(packageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const toggleWishlist = async (packageId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save packages to your wishlist.');
      return;
    }

    const isIn = has(packageId);
    toggle(packageId); // Optimistic local update

    try {
      if (isIn) {
        await removeMutation.mutateAsync(packageId);
        toast.success('Removed from wishlist.');
      } else {
        await addMutation.mutateAsync(packageId);
        toast.success('Saved to wishlist! ❤️');
      }
    } catch {
      toggle(packageId); // Revert on error
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  return {
    toggleWishlist,
    isInWishlist: has,
  };
}
