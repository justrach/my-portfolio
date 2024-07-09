'use client'
import React from 'react';
import { Button } from '@/components/ui/button';

interface SectionProps {
  title: string;
  separator?: boolean;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, separator = false, children }) => {
  return (
    <div className={`my-8 ${separator ? 'border-t border-gray-200 pt-8' : ''}`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
};

interface SearchRelatedProps {
  relatedQueries: string[];
}

export const SearchRelated: React.FC<SearchRelatedProps> = ({ relatedQueries }) => {
  const handleQueryClick = (query: string) => {
    const event = new CustomEvent('relatedQueryClick', { detail: query });
    window.dispatchEvent(event);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {relatedQueries.map((query, index) => (
        <Button
          key={index}
          onClick={() => handleQueryClick(query)}
          className="p-4 h-auto text-left"
        >
          {query}
        </Button>
      ))}
    </div>
  );
};