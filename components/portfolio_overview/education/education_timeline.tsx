'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from 'next-themes';
import EducationItem from './EducationItem'; // Adjust the path as necessary

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
  const { theme } = useTheme();

  useEffect(() => {
    if (timelineRef.current) {
      setTimelineHeight(timelineRef.current.offsetHeight);
    }
  }, [education]);

  useEffect(() => {
    controls.start({
      scaleY: 1,
      transition: { duration: 1.5, ease: 'easeInOut' }
    });
  }, [timelineHeight, controls]);

  const extensionAnimation = {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const sortedEducation = [...education].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <div className="relative w-full px-4 sm:px-0" ref={timelineRef}>
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 top-0 w-0.5 bg-orange-200 dark:bg-orange-700 origin-top"
        style={{ height: timelineHeight }}
        initial={{ scaleY: 0 }}
        animate={controls}
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-orange-500 dark:bg-orange-900"
          animate={extensionAnimation}
        />
      </motion.div>
      {sortedEducation.map((edu, index) => (
        <EducationItem key={index} edu={edu}  />
      ))}
    </div>
  );
};

export default EducationTimeline;