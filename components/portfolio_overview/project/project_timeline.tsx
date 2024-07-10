'use client'
import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ProjectItem from './ProjectItem'; // Adjust the path as necessary

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
            .map((project, index) => (
              <ProjectItem
                key={index}
                project={project}
                defaultImageUrl={defaultImageUrl}
                getBadgeClasses={getBadgeClasses}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export default ProjectTimeline;