import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, AnimationControls } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

interface Project {
  title: string;
  shortDescription: string;
  imageurl?: string;
  start_date: string; // assuming a startDate property is added
}

interface ProjectTimelineProps {
  projects: Project[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
  const [timelineHeight, setTimelineHeight] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const controls: AnimationControls = useAnimation();

  useEffect(() => {
    if (timelineRef.current) {
      setTimelineHeight(timelineRef.current.offsetHeight);
    }
  }, [projects]);

  useEffect(() => {
    controls.start({
      scaleY: 1,
      transition: { duration: 1.5, ease: 'easeInOut' }
    });
  }, [timelineHeight, controls]);

  const pulseAnimation = {
    scale: [1, 2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const extensionAnimation = {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const defaultImageUrl = 'https://portfolio.rachit.ai/vroom.webp';

  // Helper function to format year
  const formatYear = (date: string): number => new Date(date).getFullYear();

  // Group projects by year
  const groupedProjects = projects.reduce((acc: Record<number, Project[]>, project: Project) => {
    const year = formatYear(project.start_date);
    if (!acc[year]) acc[year] = [];
    acc[year].push(project);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(groupedProjects).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="relative w-full" ref={timelineRef}>
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 top-0 w-0.5 bg-purple-300 origin-top"
        style={{ height: timelineHeight }}
        initial={{ scaleY: 0 }}
        animate={controls}
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-purple-400"
          animate={extensionAnimation}
        />
      </motion.div>
      {sortedYears.map((year) => (
        <div key={year}>
          <h2 className="text-center font-bold text-lg my-4">{year}</h2>
          {groupedProjects[Number(year)].map((project, index) => {
            const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
            const itemControls: AnimationControls = useAnimation();

            useEffect(() => {
              if (inView) {
                const timer = setTimeout(() => {
                  itemControls.start({ opacity: 1, y: 0, transition: { duration: 1 } });
                }, 1000); // 1-second delay before animation starts
                return () => clearTimeout(timer);
              }
            }, [inView, itemControls]);

            return (
              <motion.div
                key={index}
                className="flex items-center mb-8 relative opacity-0 transform -translate-y-4"
                ref={ref}
                animate={itemControls}
              >
                <div className="w-1/2 text-right pr-6">
                  <h4
                    className="font-semibold text-sm text-black cursor-pointer hover:underline"
                    data-action={`Tell me more about the project: ${project.title}`}
                  >
                    {project.title}
                  </h4>
                  <p className="text-xs">{project.shortDescription}</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                  <motion.div
                    className="w-3 h-3 bg-purple-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={pulseAnimation}
                  />
                </div>
                <div className="w-1/2 pl-6 flex items-center">
                  <Image
                    src={project.imageurl || defaultImageUrl}
                    className="rounded-full"
                    alt={project.title}
                    width={48}
                    height={48}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ProjectTimeline;