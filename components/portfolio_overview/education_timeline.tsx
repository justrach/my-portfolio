import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  start_date: string;
  end_date: string;
}

interface EducationTimelineProps {
  education: Education[];
}

const EducationTimeline: React.FC<EducationTimelineProps> = ({ education }) => {
  const [timelineHeight, setTimelineHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    if (timelineRef.current) {
      setTimelineHeight(timelineRef.current.offsetHeight);
    }
  }, [education]);

  useEffect(() => {
    controls.start({
      scaleY: 1,
      transition: { duration: 1.5, ease: "easeInOut" }
    });
  }, [timelineHeight, controls]);

  const pulseAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const extensionAnimation = {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const formatYear = (date: string) => {
    return new Date(date).getFullYear();
  };

  return (
    <div className="relative w-full px-4 sm:px-0" ref={timelineRef}>
      <motion.div
        className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 top-0 w-0.5 bg-green-300 origin-top"
        style={{ height: timelineHeight }}
        initial={{ scaleY: 0 }}
        animate={controls}
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-green-400"
          animate={extensionAnimation}
        />
      </motion.div>
      {education.map((edu, index) => {
        const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
        const itemControls = useAnimation();
        
        useEffect(() => {
          if (inView) {
            const timer = setTimeout(() => {
              itemControls.start({ opacity: 1, y: 0, transition: { duration: 1 } });
            }, 1000);
            return () => clearTimeout(timer);
          }
        }, [inView, itemControls]);

        return (
          <motion.div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center mb-12 relative opacity-0 transform -translate-y-4"
            ref={ref}
            animate={itemControls}
          >
            <div className="w-full sm:w-1/2 text-left sm:text-right pr-0 sm:pr-8 mb-4 sm:mb-0 order-2 sm:order-1">
              <h3 className="font-bold">{edu.institution}</h3>
              <p>{edu.degree}</p>
              <p>{formatYear(edu.start_date)} to {formatYear(edu.end_date)}</p>
            </div>
            <div className="absolute left-0 sm:left-1/2 top-0 sm:top-1/2 transform sm:-translate-y-1/2 flex items-center justify-center">
              <motion.div
                className="w-4 h-4 bg-green-400 rounded-full"
                initial={{ scale: 0 }}
                animate={pulseAnimation}
              />
            </div>
            <div className="w-full sm:w-1/2 pl-8 sm:pl-8 flex items-center order-1 sm:order-2 mb-4 sm:mb-0">
              <div className="w-16 h-16 relative">
                <Image src="/education.svg" alt="Education icon" layout="fill" objectFit="contain" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EducationTimeline;