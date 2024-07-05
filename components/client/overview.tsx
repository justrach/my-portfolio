// File: components/PortfolioOverview.tsx
'use client';

import React, { useCallback } from 'react';
import { MessagePrimitive } from "@assistant-ui/react";
import { Avatar, AvatarFallback } from "@/src/app/components/ui/avatar";

export interface PortfolioData {
  personalInfo: Array<{
    fullName: string;
    email: string;
    location: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency: number;
  }>;
  projects: Array<{
    title: string;
    shortDescription: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  thoughts: Array<{
    topic: string;
    content: string;
  }>;
}

interface PortfolioOverviewProps {
  data: PortfolioData;
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
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {content}
  </div>
);

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ data }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const action = target.closest('[data-action]')?.getAttribute('data-action');
    if (action) {
      const event = new CustomEvent('portfolioItemClick', { detail: action });
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <MessagePrimitive.Root className="relative my-4 grid w-full max-w-2xl grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      <Avatar className="col-start-1 row-span-full row-start-1 mr-4">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <div className="text-foreground col-start-2 row-start-1 my-1.5 max-w-xl break-words leading-7" onClick={handleClick}>
        <OverviewSection
          title="Personal Information"
          content={
            <div>
              <p><strong>Name:</strong> <ClickableItem text={data.personalInfo[0]?.fullName} action={`Tell me more about ${data.personalInfo[0]?.fullName}`} /></p>
              <p><strong>Email:</strong> {data.personalInfo[0]?.email}</p>
              <p><strong>Location:</strong> {data.personalInfo[0]?.location}</p>
            </div>
          }
        />
        <OverviewSection
          title="Skills"
          content={
            <ul className="list-disc pl-5">
              {data.skills.map((skill, index) => (
                <li key={index}>
                  <ClickableItem 
                    text={`${skill.name} - ${skill.category} (Proficiency: ${skill.proficiency}/5)`}
                    action={`Tell me more about the skill: ${skill.name}`}
                  />
                </li>
              ))}
            </ul>
          }
        />
        <OverviewSection
          title="Projects"
          content={
            <div>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-2">
                  <ClickableItem 
                    text={project.title}
                    action={`Tell me more about the project: ${project.title}`}
                  />
                  <p className="text-sm">{project.shortDescription}</p>
                </div>
              ))}
            </div>
          }
        />
        <OverviewSection
          title="Education"
          content={
            <div>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <ClickableItem 
                    text={edu.institution}
                    action={`Tell me more about the education at ${edu.institution}`}
                  />
                  <p className="text-sm">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-sm">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          }
        />
        <OverviewSection
          title="Work Experience"
          content={
            <div>
              {data.workExperience.map((exp, index) => (
                <div key={index} className="mb-2">
                  <ClickableItem 
                    text={`${exp.company} - ${exp.position}`}
                    action={`Tell me more about the work experience at ${exp.company}`}
                  />
                  <p className="text-sm">{exp.startDate} - {exp.endDate}</p>
                  <p className="text-sm">{exp.description}</p>
                </div>
              ))}
            </div>
          }
        />
        <OverviewSection
          title="Recent Thoughts"
          content={
            <div>
              {data.thoughts.slice(0, 3).map((thought, index) => (
                <div key={index} className="mb-2">
                  <ClickableItem 
                    text={thought.topic}
                    action={`Tell me more about the thought: ${thought.topic}`}
                  />
                  <p className="text-sm">{thought.content.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </MessagePrimitive.Root>
  );
};