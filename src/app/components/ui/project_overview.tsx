'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from 'lucide-react';
import { techColors } from '@/consts/techcolors';

interface Project {
  id: string;
  title: string;
  shortDescription: string;
  technologies: string[];
  github_link?: string;
  live_demo_link?: string;
}

interface ProjectOverviewProps {
  projects: Project[];
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projects }) => {
  const handleProjectClick = (projectTitle: string) => {
    const event = new CustomEvent('portfolioItemClick', { 
      detail: `Tell me more about the project: ${projectTitle}`
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8">My Projects</h2>
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="w-3/4 mx-auto"
          >
            <Card 
              className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={() => handleProjectClick(project.title)}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{project.shortDescription}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => {
                    const lowerCaseTech = tech.toLowerCase();
                    const { bgColor, textColor } = techColors[lowerCaseTech as keyof typeof techColors] || { bgColor: 'gray', textColor: 'white' };
                    return (
                      <Badge 
                        key={techIndex} 
                        variant="secondary" 
                        style={{ backgroundColor: bgColor, color: textColor }}
                        className="text-xs px-2 py-1"
                      >
                        {tech}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  {project.github_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.github_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {project.live_demo_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.live_demo_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectOverview;