import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Clock, Check } from 'lucide-react';
import { cn, formatCurrency, getOptimizedImageUrl } from '@/lib/utils';
import { useWishlist } from '@/hooks/index';
import type { Package } from '@/types';

interface PackageCardProps {
  pkg: Package;
  variant?: 'default' | 'dark' | 'compact';
  rank?: number;
}

function PackageCard({ pkg, variant = 'default', rank }: PackageCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const isFav = isInWishlist(pkg.id);
  const displayPrice = (pkg.discountedPrice ?? pkg.basePrice) || 0;
  const hasDiscount = !!pkg.discountedPrice && pkg.discountedPrice < pkg.basePrice;

  const fallbackImage = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80';

  return (
    <div
      className={cn(
        'card card-hover group relative flex flex-col h-full transition-transform duration-300 ease-out hover:-translate-y-1.5',
        variant === 'dark' && 'bg-white/5 border-white/8 hover:bg-white/8 hover:border-gold/30',
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-pkg bg-gray-100">
        <img
          src={imgError ? fallbackImage : getOptimizedImageUrl(pkg.coverImage, 600)}
          alt={pkg.title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-800/60 via-transparent to-transparent" />

        {rank && (
          <div className="absolute top-3 left-3 w-8 h-8 bg-silk rounded-full flex items-center justify-center text-navy-800 text-xs font-black shadow-sm">
            #{rank}
          </div>
        )}

        {pkg.badge && !rank && (
          <span className="absolute top-3 left-3 bg-white/95 text-navy-800 text-[10px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
            {pkg.badge}
          </span>
        )}

        <span className="absolute bottom-3 right-3 bg-navy-800/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Clock size={9} /> <span className="font-num">{(pkg.duration || 0)}N/{(pkg.duration || 0) + 1}D</span>
        </span>

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(pkg.id); }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
            isFav ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-400 hover:text-red-500',
          )}
        >
          <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Body */}
      <Link to={`/packages/${pkg.slug}`} className="flex flex-col flex-1 p-4">
        <div className={cn(
          'text-[10px] font-bold tracking-[0.12em] uppercase mb-1 flex items-center gap-1',
          'text-gray-400',
        )}>
          <MapPin size={9} /> {pkg.destination?.name || 'Unknown'}, {pkg.destination?.country || 'Destinations'}
        </div>

        <h3 className={cn(
          'font-display font-semibold text-[15px] leading-tight mb-2 h-[40px] line-clamp-2 overflow-hidden',
          variant === 'dark' ? 'text-white' : 'text-navy-800',
        )}>
          {pkg.title}
        </h3>

        <div className={cn(
          'flex flex-wrap gap-x-3 gap-y-1 mb-4 flex-1 h-[32px] overflow-hidden',
          variant === 'dark' ? 'text-white/50' : 'text-gray-500',
        )}>
          {(pkg.inclusions || []).slice(0, 3).map((inc) => (
            <span key={inc} className="text-[11px] flex items-center gap-1">
              <Check size={9} className="text-emerald-500 shrink-0" />
              <span className="truncate max-w-[120px]">{inc}</span>
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-gray-100/10">
          <div>
            <p className={cn('text-[10px] uppercase tracking-wide mb-0.5', variant === 'dark' ? 'text-white/40' : 'text-gray-400')}>
              Starting from
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className={cn('font-num font-bold text-[20px] leading-none', variant === 'dark' ? 'text-white' : 'text-navy-800')}>
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through font-num">{formatCurrency(pkg.basePrice)}</span>
              )}
            </div>
            <p className={cn('text-[10px]', variant === 'dark' ? 'text-white/40' : 'text-gray-400')}>/ person</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className={cn('text-sm font-semibold font-num', variant === 'dark' ? 'text-white' : 'text-navy-800')}>
                {(pkg.averageRating || 0).toFixed(1)}
              </span>
            </div>
            <p className={cn('text-[10px] font-num', variant === 'dark' ? 'text-white/40' : 'text-gray-400')}>
              ({(pkg.reviewCount || 0).toLocaleString()})
            </p>
          </div>
        </div>

        <button className={cn(
          'w-full mt-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
          variant === 'dark'
            ? 'bg-white/8 border border-white/15 text-white hover:bg-silk hover:text-navy-800 hover:border-silk'
            : 'border border-navy-200 text-navy-800 hover:bg-navy-800 hover:text-white',
        )}>
          View Package →
        </button>
      </Link>
    </div>
  );
}

export default memo(PackageCard);
