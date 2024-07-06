import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from 'lucide-react';

interface CardComponentProps {
  data: {
    [key: string]: any;
  };
}

export const CardComponent: React.FC<CardComponentProps> = ({ data }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{data.title || 'Untitled'}</CardTitle>
        {data.summary && <p className="text-sm text-gray-500">{data.summary}</p>}
      </CardHeader>
      <CardContent>
        {Object.entries(data).map(([key, value]) => {
          if (['title', 'summary', 'github_link', 'live_demo_link', 'technologies'].includes(key)) return null;
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
        })}
        {data.technologies && data.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.technologies.map((tech: string, index: number) => (
              <Badge key={index} variant="secondary">{tech}</Badge>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          {data.github_link && (
            <Button variant="outline" size="sm" asChild>
              <a href={data.github_link} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          )}
          {data.live_demo_link && (
            <Button variant="outline" size="sm" asChild>
              <a href={data.live_demo_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};