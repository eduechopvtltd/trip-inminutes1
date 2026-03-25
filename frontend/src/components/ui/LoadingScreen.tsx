// src/components/ui/LoadingScreen.tsx
// CSS-only loading screen — no Framer Motion dependency for faster first paint

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-cream flex items-center justify-center z-[100]">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-5 mb-6 animate-pulse">
          <img 
            src="/assets/logo-color.png" 
            alt="TripInMinutes" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand name */}
        <h2 className="font-display font-bold text-navy-900 text-lg tracking-tight mb-1">
          TripInMinutes
        </h2>
        <p className="text-[10px] font-bold text-silk-600 uppercase tracking-[0.3em]">
          Crafting Your Journey
        </p>

        {/* CSS-only progress bar */}
        <div className="mt-8 w-28 h-[2px] bg-gray-100 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-silk-500 to-transparent animate-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
