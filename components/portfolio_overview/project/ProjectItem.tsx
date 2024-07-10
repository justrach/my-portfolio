import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useInViewAnimation } from '../useInViewAnimation';

interface ProjectItemProps {
  project: {
    title: string;
    short_description: string;
    imageurl?: string;
    start_date: string;
    label?: string;
  };
  defaultImageUrl: string;
  getBadgeClasses: (label: string) => string;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, defaultImageUrl, getBadgeClasses }) => {
  const { ref, controls } = useInViewAnimation();

  const pulseAnimation = {
    scale: [1, 1.5, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const labels = project.label ? project.label.split(',') : [];

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start sm:items-center mb-8 relative opacity-0 transform -translate-y-4"
      ref={ref}
      animate={controls}
    >
      <div
        className="w-full sm:w-1/2 text-left sm:text-right pr-0 sm:pr-6 mb-4 sm:mb-0 order-2 sm:order-1 cursor-pointer"
        data-action={`Tell me more about the project: ${project.title}`}
      >
        <h4
          className="font-semibold text-sm hover:underline flex flex-col items-start sm:items-end"
        >
          {project.title}
          <div className="flex flex-col mt-2">
            {labels.map((label, idx) => (
              <span
                key={idx}
                className={`mt-1 px-2 py-1 text-xs rounded-full ${getBadgeClasses(label)}`}
              >
                {label.trim() === 'winner'
                  ? 'winner 🏆'
                  : label.trim() === 'open source'
                  ? 'OSS'
                  : label.trim()}
              </span>
            ))}
          </div>
        </h4>
        <p className="text-xs mt-1 hidden sm:block">{project.short_description}</p>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 sm:top-0 sm:transform sm:-translate-y-1/2 flex items-center justify-center">
        <motion.div
          className="w-3 h-3 bg-purple-400 rounded-full"
          initial={{ scale: 0 }}
          animate={pulseAnimation}
        />
      </div>
      <div
        className="w-full sm:w-1/2 pl-8 sm:pl-6 flex items-center order-1 sm:order-2 mb-4 sm:mb-0 cursor-pointer"
        data-action={`Tell me more about the project: ${project.title}`}
      >
        <div className="w-12 h-12 relative overflow-hidden rounded-full">
          <Image
            src={project.imageurl || defaultImageUrl}
            alt={project.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectItem;