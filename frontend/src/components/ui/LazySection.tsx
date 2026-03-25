// src/components/ui/LazySection.tsx
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

/**
 * A wrapper component that only renders its children when it enters the viewport.
 * Useful for optimizing the initial load of long pages like the Home page.
 */
export default function LazySection({ 
  children, 
  threshold = 0.05, 
  rootMargin = '200px 0px', 
  className 
}: LazySectionProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true, // Only trigger once for performance
  });

  return (
    <div ref={ref} className={className}>
      {inView ? children : <div className="min-h-[200px]" />}
    </div>
  );
}
