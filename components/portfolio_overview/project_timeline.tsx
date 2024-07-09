import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

interface Project {
  title: string;
  shortDescription: string;
  imageurl?: string;
  start_date: string;
  label?: 'hackathon' | 'application' | 'webApp';
}

interface ProjectTimelineProps {
  projects: Project[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
  const [timelineHeight, setTimelineHeight] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

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
    scale: [1, 1.5, 1],
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

  const defaultImageUrl = 'https://portfolio.rachit.ai/no-LOGO.webp';

  const formatYear = (date: string): number => new Date(date).getFullYear();

  const groupedProjects = projects.reduce((acc: Record<number, Project[]>, project: Project) => {
    const year = formatYear(project.start_date);
    if (!acc[year]) acc[year] = [];
    acc[year].push(project);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedProjects).sort((a, b) => Number(b) - Number(a));

  const getBadgeClasses = (label: string) => {
    switch (label) {
      case 'hackathon':
        return 'bg-orange-500 text-white';
      case 'application':
        return 'bg-black text-white';
      case 'webApp':
        return 'bg-blue-500 text-white';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full px-4 sm:px-0" ref={timelineRef}>
      <motion.div
        className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 top-0 w-0.5 bg-purple-300 origin-top"
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
        <div key={year} className="mb-8">
          <h2 className="text-center font-bold text-lg my-4">{year}</h2>
          {groupedProjects[Number(year)].map((project, index) => {
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
                className="flex flex-col sm:flex-row items-start sm:items-center mb-8 relative opacity-0 transform -translate-y-4"
                ref={ref}
                animate={itemControls}
              >
                <div className="w-full sm:w-1/2 text-left sm:text-right pr-0 sm:pr-6 mb-4 sm:mb-0 order-2 sm:order-1">
                  <h4
                    className="font-semibold text-sm text-black cursor-pointer hover:underline flex items-center justify-start sm:justify-end"
                    data-action={`Tell me more about the project: ${project.title}`}
                  >
                    {project.title}
                    {project.label && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${getBadgeClasses(
                          project.label
                        )}`}
                      >
                        {project.label}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs mt-1">{project.shortDescription}</p>
                </div>
                <div className="absolute left-0 sm:left-1/2 top-0 sm:top-1/2 transform sm:-translate-y-1/2 flex items-center justify-center">
                  <motion.div
                    className="w-3 h-3 bg-purple-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={pulseAnimation}
                  />
                </div>
                <div className="w-full sm:w-1/2 pl-8 sm:pl-6 flex items-center order-1 sm:order-2 mb-4 sm:mb-0">
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
          })}
        </div>
      ))}
    </div>
  );
};

export default ProjectTimeline;