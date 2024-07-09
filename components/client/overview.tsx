'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import EducationTimeline from '../portfolio_overview/education_timeline';
import ProjectTimeline from '../portfolio_overview/project_timeline';

export interface PortfolioData {
  personalInfo: Array<{
    full_name: string;
    email: string;
    location: string;
    imageurl: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency: number;
  }>;
  projects: Array<{
    title: string;
    shortDescription: string;
    imageurl: string;
    start_date: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    start_date: string;
    end_date: string;
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
  <Card className="mb-4">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{content}</CardContent>
  </Card>
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
    <div className="w-full max-w-2xl mx-auto p-4" onClick={handleClick}>
      <OverviewSection
        title="Personal Information"
        content={
          <div className="flex flex-col items-center">
            <div className="mb-4">
              {/* <p>{Object.keys(data.personalInfo[0])}</p> */}
              <p><strong>Name:</strong> <ClickableItem text={data.personalInfo[0]?.full_name} action={`Tell me more about ${data.personalInfo[0]?.full_name}`} /></p>
              <p><strong>Email:</strong> {data.personalInfo[0]?.email}</p>
              <p><strong>Location:</strong> {data.personalInfo[0]?.location}</p>
            </div>
            <Image 
              src={data.personalInfo[0]?.imageurl}
              alt="Personal Image"
              width={150}
              height={150}
              className="rounded-full"
            />
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
            <ProjectTimeline projects={data.projects} />
          </div>
        }
      />
     <OverviewSection
        title="Education"
        content={<EducationTimeline education={data.education} />}
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
  );
};