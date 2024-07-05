'use client'
import React, { useState } from 'react';
import { TabGroup, Tab, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';

type EntityName = 'projects' | 'skills' | 'education' | 'thoughts' | 'workExperience' | 'personalInfo';

interface FormData {
  [key: string]: string | number | string[] | Float32Array;
}

const tabs: { name: string; entity: EntityName }[] = [
  { name: 'Projects', entity: 'projects' },
  { name: 'Skills', entity: 'skills' },
  { name: 'Education', entity: 'education' },
  { name: 'Thoughts', entity: 'thoughts' },
  { name: 'Work Experience', entity: 'workExperience' },
  { name: 'Personal Info', entity: 'personalInfo' },
];

const formFields: Record<EntityName, { name: string; type: string; placeholder: string }[]> = {
  projects: [
    { name: 'title', type: 'text', placeholder: 'Title' },
    { name: 'shortDescription', type: 'textarea', placeholder: 'Short Description' },
    { name: 'longDescription', type: 'textarea', placeholder: 'Long Description' },
    { name: 'technologies', type: 'text', placeholder: 'Technologies (comma-separated)' },
    { name: 'startDate', type: 'date', placeholder: 'Start Date' },
    { name: 'endDate', type: 'date', placeholder: 'End Date' },
    { name: 'githubLink', type: 'text', placeholder: 'GitHub Link' },
    { name: 'liveLink', type: 'text', placeholder: 'Live Link' },
    { name: 'imageurl', type: 'text', placeholder: 'Image URL' },
  ],
  skills: [
    { name: 'name', type: 'text', placeholder: 'Skill Name' },
    { name: 'category', type: 'text', placeholder: 'Category' },
    { name: 'proficiency', type: 'number', placeholder: 'Proficiency (1-5)' },
    { name: 'imageurl', type: 'text', placeholder: 'Image URL' },
  ],
  education: [
    { name: 'institution', type: 'text', placeholder: 'Institution' },
    { name: 'degree', type: 'text', placeholder: 'Degree' },
    { name: 'fieldOfStudy', type: 'text', placeholder: 'Field of Study' },
    { name: 'startDate', type: 'date', placeholder: 'Start Date' },
    { name: 'endDate', type: 'date', placeholder: 'End Date' },
    { name: 'description', type: 'textarea', placeholder: 'Description' },
    { name: 'imageurl', type: 'text', placeholder: 'Image URL' },
  ],
  thoughts: [
    { name: 'topic', type: 'text', placeholder: 'Topic' },
    { name: 'content', type: 'textarea', placeholder: 'Content' },
    { name: 'dateAdded', type: 'date', placeholder: 'Date Added' },
    { name: 'imageurl', type: 'text', placeholder: 'Image URL' },
  ],
  workExperience: [
    { name: 'company', type: 'text', placeholder: 'Company' },
    { name: 'position', type: 'text', placeholder: 'Position' },
    { name: 'startDate', type: 'date', placeholder: 'Start Date' },
    { name: 'endDate', type: 'date', placeholder: 'End Date' },
    { name: 'description', type: 'textarea', placeholder: 'Description' },
    { name: 'imageurl', type: 'text', placeholder: 'Image URL' },
  ],
  personalInfo: [
    { name: 'fullName', type: 'text', placeholder: 'Full Name' },
    { name: 'email', type: 'email', placeholder: 'Email' },
    { name: 'phone', type: 'tel', placeholder: 'Phone' },
    { name: 'location', type: 'text', placeholder: 'Location' },
    { name: 'bio', type: 'textarea', placeholder: 'Bio' },
    { name: 'imageurl', type: 'text', placeholder: 'Image URL' },
  ],
};

function FormField({ field, register }: { field: { name: string; type: string; placeholder: string }, register: any }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        {...register(field.name)}
        placeholder={field.placeholder}
        className="w-full p-2 border rounded"
      />
    );
  }
  return (
    <input
      {...register(field.name)}
      type={field.type}
      placeholder={field.placeholder}
      className="w-full p-2 border rounded"
    />
  );
}

// This should match the secret in your embedding route
const EMBEDDING_AUTH_SECRET = process.env.NEXT_PUBLIC_EMBEDDING_AUTH_SECRET;

async function generateEmbedding(text: string): Promise<Float32Array> {
  const response = await fetch('/api/embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EMBEDDING_AUTH_SECRET}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const { embedding } = await response.json();
  return new Float32Array(embedding);
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    const entity = tabs[selectedTab].entity;

    try {
      // Generate embedding for relevant fields
      const embeddingFields = ['shortDescription', 'longDescription', 'name', 'description', 'content', 'bio'];
      const fieldToEmbed = embeddingFields.find(field => field in data && typeof data[field] === 'string');

      if (fieldToEmbed) {
        const embedding = await generateEmbedding(data[fieldToEmbed] as string);
        data.embedding = embedding;
      }

      const response = await axios.post(`/api/portfolio`, data, {
        params: { entity },
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 200) {
        throw new Error('Failed to update data');
      }

      alert('Data updated successfully!');
      reset();
    } catch (err) {
      setError(`Error updating data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Portfolio Admin Dashboard</h1>
      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
        <TabList className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl mb-8">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 text-blue-700 rounded-lg
                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
                ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab) => (
            <TabPanel key={tab.name} className="bg-white rounded-xl p-3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {formFields[tab.entity].map((field) => (
                  <FormField key={field.name} field={field} register={register} />
                ))}
                <button 
                  type="submit" 
                  className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Save'}
                </button>
              </form>
              {error && (
                <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}

