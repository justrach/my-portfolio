import { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAnimation } from 'framer-motion';

export const useInViewAnimation = (delay: number = 1000) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        controls.start({ opacity: 1, y: 0, transition: { duration: 1 } });
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [inView, controls, delay]);

  return { ref, controls };
};