'use client'
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { db } from '@/db';
import { projects, education, workExperience, skills } from '@/db/schema';
import { Badge } from '@/components/ui/badge';
import SkillsPieChart from './SkillsPieChart';
import { CodingLanguagesPieChart } from '@/components/client/codingLanguagesPieChart';

interface Project {
  id: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  technologies: string[];
  startDate: string | null;
  endDate: string | null;
  githubLink: string | null;
  liveLink: string | null;
  imageurl: string | null;
  label: string | null;
  embedding: number[] | null;
}

interface WorkExperience {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

interface Education {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Skill {
  name: string;
  // Add other properties if needed
}

interface Data {
  projects: Project[];
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
}

const PDFGenerator: React.FC = () => {
  const [data, setData] = useState<Data>({ projects: [], education: [], workExperience: [], skills: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await db.select().from(projects);
        const educationData = await db.select().from(education);
        const workExperienceData = await db.select().from(workExperience);
        const skillsData = await db.select().from(skills);
        setData({ projects: projectsData, education: educationData, workExperience: workExperienceData, skills: skillsData });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const generatePDF = async () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;

    const inputWidth = input.offsetWidth;
    const inputHeight = input.offsetHeight;

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [inputWidth, inputHeight]
    });

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: inputWidth
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, inputWidth, inputHeight, '', 'FAST');

    // Add footer text
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text('Generated with rachpradhan.com/download', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });

    pdf.save('rach_pradhan_resume.pdf');
  };

  const getBadgeClasses = (label: string): string => {
    switch (label.trim().toLowerCase()) {
      case 'hackathon': return 'bg-orange-500 text-white';
      case 'application': return 'bg-black text-white';
      case 'webapp': return 'bg-blue-500 text-white';
      case 'company': return 'bg-blue-700 text-white';
      case 'top 200 app': return 'bg-blue-500 text-white';
      case 'oss': return 'bg-purple-500 text-white';
      case 'winner': return 'bg-yellow-500 text-white';
      case '1st hackathon': return 'bg-pink-500 text-white';
      case 'yc interview(s24)':
      case 'yc interview(w24)': return 'bg-orange-400 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const sortChronologically = <T extends { startDate?: string | null }>(items: T[]): T[] => {
    return items.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA;
    });
  };

  const renderBadges = (labels: string): JSX.Element[] | null => {
    if (!labels) return null;
    return labels.split(',').map((label, index) => (
      <Badge key={index} className={`mr-2 mb-2 text-xs px-2 py-1 ${getBadgeClasses(label.trim())}`}>
        {label.trim()}
      </Badge>
    ));
  };

  const renderWorkExperience = (item: WorkExperience): JSX.Element => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold">{item.position} at {item.company}</h3>
      <p className="text-sm text-gray-600 mb-2">{item.startDate} - {item.endDate || 'Present'}</p>
      <p className="text-sm mb-2">{item.description}</p>
      {item.technologies && (
        <div className="mt-2">
          {renderBadges(item.technologies.join(','))}
        </div>
      )}
    </div>
  );

  const renderProject = (item: Project): JSX.Element => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold">{item.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{item.startDate} - {item.endDate || 'Present'}</p>
      <p className="text-sm mb-2">{item.shortDescription}</p>
      {item.technologies && (
        <div className="mt-2">
          {renderBadges(item.technologies.join(','))}
        </div>
      )}
      {item.label && (
        <div className="mt-2">
          {renderBadges(item.label)}
        </div>
      )}
      {item.githubLink && (
        <a href={item.githubLink} className="block mt-2 text-xs text-blue-600 hover:underline">GitHub</a>
      )}
      {item.liveLink && (
        <a href={item.liveLink} className="block mt-2 text-xs text-blue-600 hover:underline">Live Demo</a>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <div id="pdf-content" className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Rach Pradhan</h1>
        <p className="mb-6 text-lg">Portfolio: <a href="https://rachpradhan.com" className="text-blue-600 hover:underline">rachpradhan.com</a></p>
        
        <Card className="mb-8">
          <CodingLanguagesPieChart/>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Work Experience</h2>
          </CardHeader>
          <CardContent>
            {sortChronologically(data.workExperience).map((item, index) => (
              <React.Fragment key={index}>
                {renderWorkExperience(item)}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Projects</h2>
          </CardHeader>
          <CardContent>
            {sortChronologically(data.projects).map((item, index) => (
              <React.Fragment key={index}>
                {renderProject(item)}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Education</h2>
          </CardHeader>
          <CardContent>
            {sortChronologically(data.education).map((edu, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold">{edu.degree} in {edu.fieldOfStudy}</h3>
                <p className="text-base">{edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate || 'Present'}</p>
                {edu.description && <p className="mt-2 text-sm">{edu.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={generatePDF} className="text-lg py-2 px-4">Download Resume PDF</Button>
      </div>
      <p className="text-center text-xs mt-4 text-gray-500">Generated with rachpradhan.com/download</p>
    </div>
  );
};

export default PDFGenerator;