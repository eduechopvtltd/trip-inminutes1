// src/components/layout/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setIsTransitioning(true);
      window.scrollTo(0, 0);
      // Let the CSS animation play, then remove the class
      const timer = setTimeout(() => setIsTransitioning(false), 350);
      prevPath.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        key={pathname}
        className={`flex-1 ${isTransitioning ? 'animate-page-in' : ''}`}
        style={{ animation: 'pageIn 0.35s ease-out both' }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
