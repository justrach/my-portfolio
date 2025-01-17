'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { techColors } from '../../../../../consts/techcolors';
import { LinkPreview } from './link_preview';
import { Skeleton } from '@/components/ui/skeleton';

interface CardComponentProps {
  data: {
    [key: string]: any;
  };
}
interface CustomWindow extends Window {
  twttr?: {
    widgets: {
      load: () => void;
    };
  };
}

declare var window: CustomWindow;
export const CardComponent: React.FC<CardComponentProps> = ({ data }) => {
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);
  const [enhancedDuration, setEnhancedDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [twitterLoading, setTwitterLoading] = useState<boolean>(true);
  const [twitterEmbedHtml, setTwitterEmbedHtml] = useState<string | null>(null);

  useEffect(() => {
    const enhanceDescription = async () => {
      try {
        const response = await axios.post('/api/chatother', { description: data.longDescription });
        setEnhancedDescription(response.data.enhancedDescription);
      } catch (error) {
        console.error("Error enhancing description:", error);
      }
    };

    const enhanceDuration = async () => {
      try {
        const response = await axios.get('/api/chatother', {
          params: { startDate: data.startDate, endDate: data.endDate }
        });
        setEnhancedDuration(response.data.enhancedDate);
      } catch (error) {
        console.error("Error enhancing duration:", error);
      }
    };

    const fetchTwitterEmbed = async (url: string) => {
      try {
        const response = await axios.get('/api/twitter_embedded', {
          params: { url }
        });
        setTwitterEmbedHtml(response.data.html);
      } catch (error) {
        console.error("Error fetching Twitter embed:", error);
      } finally {
        setTwitterLoading(false);
      }
    };

    const fetchEnhancements = async () => {
      setLoading(true);
      if (data.longDescription) {
        await enhanceDescription();
      }
      if (data.startDate && data.endDate) {
        await enhanceDuration();
      }
      if (data.liveLink && (data.liveLink.includes('x.com') || data.liveLink.includes('twitter.com'))) {
        await fetchTwitterEmbed(data.liveLink);
      } else {
        setTwitterLoading(false);
      }
      setLoading(false);
    };

    fetchEnhancements();
  }, [data.longDescription, data.startDate, data.endDate, data.liveLink]);

  useEffect(() => {
    if (twitterEmbedHtml) {
      if (typeof window !== 'undefined' && twitterEmbedHtml && window.twttr) {
        window.twttr.widgets.load();
        } else {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [twitterEmbedHtml]);

  const renderDescription = (description: string) => {
    if (description.length > 300) {
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Want to read more?</AccordionTrigger>
            <AccordionContent>
              <ReactMarkdown>{description}</ReactMarkdown>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }
    return <ReactMarkdown>{description}</ReactMarkdown>;
  };

  const renderLiveLink = (link: string) => {
    if (twitterEmbedHtml) {
      return (
        <div key="liveLink" className="mb-4" dangerouslySetInnerHTML={{ __html: twitterEmbedHtml }}></div>
      );
    }
    return (
      <div key="liveLink" className="mb-4">
        <LinkPreview url={link} className="font-bold text-blue-300">
          Link to Project
        </LinkPreview>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto min-h-[400px]">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto min-h-[400px]">
      <CardHeader>
        <CardTitle>{data.title || 'Untitled'}</CardTitle>
        {data.summary && <p className="text-sm text-gray-500">{data.summary}</p>}
      </CardHeader>
      <CardContent>
        {enhancedDescription && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold  mb-2">What is it?</h2>
            {data.shortDescription}
            {renderDescription(enhancedDescription)}
          </div>
        )}
        {/* {Object.entries(data).map(([key, value]) => {
          if (['id', 'title', 'summary', 'liveLink', 'technologies', 'longDescription', 'startDate', 'endDate'].includes(key)) return null;
          if (typeof value === 'string' || typeof value === 'number') {
            return (
              <div key={key} className="mb-4">
                <h2 className="text-lg font-semibold capitalize mb-2">{key.replace(/_/g, ' ')}</h2>
                <p>{value}</p>
              </div>
            );
          }
          if (Array.isArray(value)) {
            return (
              <div key={key} className="mb-4">
                <h2 className="text-lg font-semibold capitalize mb-2">{key.replace(/_/g, ' ')}</h2>
                <ul className="list-disc pl-5">
                  {value.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })} */}
        {enhancedDuration && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold capitalize mb-2">Duration</h2>
            <p>{enhancedDuration}</p>
          </div>
        )}
        {data.liveLink && renderLiveLink(data.liveLink)}
        {data.technologies && data.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.technologies.map((tech: string, index: number) => {
              const lowerCaseTech = tech.toLowerCase();
              const { bgColor, textColor } = techColors[lowerCaseTech as keyof typeof techColors] || { bgColor: 'gray', textColor: 'white' };
              return (
                <Badge key={index} variant="secondary" style={{ backgroundColor: bgColor, color: textColor }}>{tech}</Badge>
              );
            })}
          </div>
        )}
        {data.github_link && (
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href={data.github_link} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};