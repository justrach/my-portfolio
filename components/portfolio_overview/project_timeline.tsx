'use client'
import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export interface Project {
  title: string;
  short_description: string;
  imageurl?: string;
  start_date: string;
  label?: string;
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

  const sortedYears = Object.keys(groupedProjects).sort((a, b) => Number(a) - Number(b));

  const getBadgeClasses = (label: string) => {
    switch (label.trim()) {
      case 'hackathon':
        return 'bg-orange-500 text-white text-center';
      case 'application':
        return 'bg-black text-white text-center';
      case 'webapp':
        return 'bg-blue-500 text-white text-center';
      case 'company':
        return 'bg-blue-700 text-white text-center';
      case 'top 200 app':
        return 'bg-blue-500 text-white text-center';
      case 'OSS':
        return 'bg-purple-500 text-white text-center';
      case 'winner':
        return 'bg-yellow-500 text-white text-center';
      case '1st hackathon':
        return 'bg-pink-500 text-white text-center';
      case 'YC Interview(S24)':
      case 'YC Interview(W24)':
        return 'bg-orange-400 text-white text-center';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full px-4 sm:px-0" ref={timelineRef}>
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
      {sortedYears.reverse().map((year) => (
        <div key={year} className="mb-8">
          <h2 className="text-center font-bold text-lg my-4">{year}</h2>
          {groupedProjects[Number(year)]
            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
            .map((project, index) => {
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

              const labels = project.label ? project.label.split(',') : [];

              return (
                <motion.div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center mb-8 relative opacity-0 transform -translate-y-4"
                  ref={ref}
                  animate={itemControls}
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
            })}
        </div>
      ))}
    </div>
  );
};

export default ProjectTimeline;