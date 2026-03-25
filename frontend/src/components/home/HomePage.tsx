// src/components/home/HomePage.tsx
import HeroSection from './HeroSection';
import {
  TrendingSection,
  DestinationsSection,
  BudgetSection,
  PopularSection,
  ServicesSection,
  CorporateMICESection,
  ReviewsSection,
  TermsSection,
} from './Sections';
import { LazySection } from '@/components/ui/index';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      
      <LazySection><TrendingSection /></LazySection>
      <LazySection><DestinationsSection /></LazySection>
      <LazySection><BudgetSection /></LazySection>
      <LazySection><PopularSection /></LazySection>
      <LazySection><ServicesSection /></LazySection>
      <LazySection><CorporateMICESection /></LazySection>
      <LazySection><ReviewsSection /></LazySection>
      <LazySection><TermsSection /></LazySection>
    </>
  );
}
