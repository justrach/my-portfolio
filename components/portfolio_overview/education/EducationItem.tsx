import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useInViewAnimation } from '../useInViewAnimation';

interface EducationItemProps {
  edu: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    start_date: string;
    end_date: string;
  };
}

const EducationItem: React.FC<EducationItemProps> = ({ edu}) => {
  const { ref, controls } = useInViewAnimation();
//   const educationImage = theme === 'dark' 
//     ? 'https://portfolio.rachit.ai/education_dark.png'
//     : 'https://portfolio.rachit.ai/education.png';
const educationImage = 'https://portfolio.rachit.ai/education.png';

  const formatYear = (date: string) => new Date(date).getFullYear();

  const pulseAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center mb-12 relative opacity-0 transform -translate-y-4"
      ref={ref}
      animate={controls}
    >
      <div className="w-full text-center mb-4">
        <div className="w-16 h-16 relative mx-auto mb-4 rounded-xl overflow-hidden">
          <Image 
            src={educationImage} 
            alt="Education icon" 
            layout="fill" 
            objectFit="contain" 
            sizes="(max-width: 768px) 100vw, 200px"
            className="rounded-xl"
          />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100">{edu.institution}</h3>
        <p className="text-gray-700 dark:text-gray-300">{edu.degree}</p>
        <div className="flex justify-center mt-2">
          <span className="mt-1 px-2 py-1 text-xs rounded-full bg-blue-500 text-white text-center">
            {formatYear(edu.start_date)} to {formatYear(edu.end_date)}
          </span>
        </div>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 sm:top-0 sm:transform sm:-translate-y-1/2 flex items-center justify-center">
        <motion.div
          className="w-4 h-4 bg-blue-400 dark:bg-blue-700 rounded-full"
          initial={{ scale: 0 }}
          animate={pulseAnimation}
        />
      </div>
    </motion.div>
  );
};

export default EducationItem;