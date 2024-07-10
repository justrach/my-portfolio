'use client';

import React, { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import ProjectTimeline, { Project } from './project/project_timeline';

interface ProjectOverviewProps {
  projects: Project[];
}

const ClickableItem: React.FC<{ text: string; action: string }> = ({ text, action }) => (
  <span 
    className="cursor-pointer text-blue-600 hover:underline"
    data-action={action}
  >
    {text}
  </span>
);

const OverviewSection: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{content}</CardContent>
  </Card>
);

const ProjectOverviewSection: React.FC<ProjectOverviewProps> = ({ projects }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const action = target.closest('[data-action]')?.getAttribute('data-action');
    if (action) {
      const event = new CustomEvent('portfolioItemClick', { detail: action });
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4" onClick={handleClick}>
      <OverviewSection
        title="Projects"
        content={
          <div>
            <ProjectTimeline projects={projects} />
          </div>
        }
      />
    </div>
  );
};

export default ProjectOverviewSection;