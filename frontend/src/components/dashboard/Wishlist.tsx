// src/components/dashboard/Wishlist.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import PackageCard from '@/components/ui/PackageCard';
import type { Package } from '@/types';

export default function Wishlist() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.list().then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">
      <h1 className="font-display font-bold text-2xl text-navy-800 mb-6">My Wishlist</h1>
      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading wishlist…</p>
      ) : !items || items.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500 mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-gray-400 mb-4">Save packages you love by clicking the heart icon.</p>
          <Link to="/packages" className="btn btn-navy btn-sm">Browse Packages</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-5">{items.length} saved package{items.length > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item: { id: string; package: Package }) => (
              <PackageCard key={item.id} pkg={item.package} />
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
