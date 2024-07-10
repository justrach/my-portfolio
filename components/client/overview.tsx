'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import EducationTimeline from '../portfolio_overview/education/education_timeline';
import ProjectTimeline from '../portfolio_overview/project/project_timeline';
import { Avatar } from '../ui/avatar';
import { AvatarFallback, AvatarImage } from '@/src/app/components/ui/avatar';
import { Badge } from '../ui/badge';

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
    short_description: string;
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
          <Card className="w-full max-w-md p-6  rounded-lg ">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage src="https://portfolio.rachit.ai/photo_2024-07-09%2016.25.10.jpeg" />
              <AvatarFallback>RP</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Hi, I'm <ClickableItem text={data.personalInfo[0]?.full_name} action={`Tell me more about ${data.personalInfo[0]?.full_name}`} />
              </div>
              <div className="text-gray-500 dark:text-gray-400">me@rachit.ai</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            I&#39;ve just graduated from NUS and here's my profile!
          </div>
          <div className="mt-2 text-gray-500 dark:text-gray-400">
            Currently working on a few projects, but hey, the emails are always open for a chat!
          </div>
          <div className="mt-4 flex gap-2">
            <a href="https://twitter.com/rachpradhan" target="_blank" rel="noopener noreferrer">
              <Badge variant="secondary" className="bg-black dark:bg-gray-700 text-white hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-white">
                X
              </Badge>
            </a>
            <a href="https://www.linkedin.com/in/rachpradhan/" target="_blank" rel="noopener noreferrer">
              <Badge variant="secondary" className="bg-blue-400 dark:bg-blue-500 text-white hover:bg-blue-900 dark:hover:bg-blue-700 hover:text-white">
                LINKEDIN
              </Badge>
            </a>
          </div>
        </Card>
          // <div className="flex flex-col items-center">
          //   <div className="mb-4">
          //     {/* <p>{Object.keys(data.personalInfo[0])}</p> */}
          //     <p><strong>Name:</strong> <ClickableItem text={data.personalInfo[0]?.full_name} action={`Tell me more about ${data.personalInfo[0]?.full_name}`} /></p>
          //     <p><strong>Email:</strong> {data.personalInfo[0]?.email}</p>
          //     <p><strong>Location:</strong> {data.personalInfo[0]?.location}</p>
          //   </div>
          //   <Image 
          //     src={data.personalInfo[0]?.imageurl}
          //     alt="Personal Image"
          //     width={150}
          //     height={150}
          //     className="rounded-full"
          //   />
          // </div>
          // <UserComponent></UserComponent>
        }
      />
      {/* <OverviewSection
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
      /> */}
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