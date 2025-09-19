
import type { ReactNode } from "react";
import { motion } from 'framer-motion';

const pageTransition = {
  initial: { opacity: 0, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
};

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
