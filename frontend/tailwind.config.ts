// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#020617', // Midnight
          900: '#0f172a',
          950: '#050a14', // Deeper Midnight
          DEFAULT: '#020617',
        },
        gold: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#C5A059', // Champagne Gold
          600: '#A68A48',
          700: '#876F3A',
          800: '#68562C',
          900: '#493C1E',
          DEFAULT: '#C5A059',
          light: '#DBC089',
          pale:  '#F2E9D5',
        },
        silk: {
          50:  '#FFFFFF',
          100: '#FDFCFB',
          200: '#F8F7F4',
          300: '#EFEDE9',
          400: '#E5E2DD',
          500: '#BBA88B', // Darker Silk for contrast
          600: '#9A8D77',
          DEFAULT: '#F8F7F4',
        },
        platinum: {
          50:  '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          DEFAULT: '#E9ECEF',
        },
        cream: {
          DEFAULT: '#FDFCFB',
          50: '#FDFCFB',
          100: '#FDFCFB',
          200: '#F8F9FA',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        accent:  ['"Cormorant Garamond"', 'serif'],
        num:     ['"DM Sans"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 4px 32px rgba(10,22,40,0.09)',
        'card-hover': '0 16px 64px rgba(10,22,40,0.16)',
        gold: '0 8px 32px rgba(201,168,76,0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(160deg, #0A1628 0%, #1a2f5a 40%, #0d2247 70%, #1a0a2e 100%)',
        'silk-gradient': 'linear-gradient(160deg, #FDFCFB 0%, #F8F7F4 40%, #EFEDE9 70%, #E5E2DD 100%)',
        'gold-gradient': 'linear-gradient(90deg, #C9A84C 0%, #E8C97A 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0A1628 0%, #162040 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.4,0,0.2,1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34,1.56,0.64,1)',
        'smooth': 'cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
