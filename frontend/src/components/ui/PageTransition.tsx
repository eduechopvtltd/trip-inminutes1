// src/components/ui/PageTransition.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full flex-1 flex flex-col will-change-[opacity,transform]"
    >
      {children}
    </motion.div>
  );
}
