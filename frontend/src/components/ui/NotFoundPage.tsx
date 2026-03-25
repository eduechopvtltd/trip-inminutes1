// src/components/ui/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="font-display font-black text-[120px] leading-none text-gold-pale mb-2 select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-800 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Looks like this destination doesn't exist on our map. Let's get you back to exploring amazing travel deals.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn btn-navy">
            <Home size={15} /> Go Home
          </Link>
          <Link to="/packages" className="btn btn-outline">
            <Search size={15} /> Browse Packages
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
