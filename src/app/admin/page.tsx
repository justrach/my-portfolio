'use client'
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useAnimation, AnimationControls } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

type EntityName = 'projects' | 'skills' | 'education' | 'thoughts' | 'workExperience' | 'personalInfo';

interface FormData {
  [key: string]: string | number | string[] | Float32Array | Date;
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
    { name: 'label', type: 'text', placeholder: 'Label (hackathon, application, webApp)' },
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

const EMBEDDING_AUTH_SECRET = process.env.NEXT_PUBLIC_EMBEDDING_AUTH_SECRET;

async function generateEmbedding(text: string): Promise<Float32Array> {
  const response = await axios.post('/api/embedding', { text }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EMBEDDING_AUTH_SECRET}`,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to generate embedding');
  }

  const { embedding } = response.data;
  return new Float32Array(embedding);
}

function FormField({ field, register }: { field: { name: string; type: string; placeholder: string }, register: any }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        {...register(field.name)}
        placeholder={field.placeholder}
        className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    );
  }
  return (
    <input
      {...register(field.name)}
      type={field.type}
      placeholder={field.placeholder}
      className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    />
  );
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const [data, setData] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const entity = tabs[selectedTab].entity;
      const response = await axios.get(`/api/fetchData?entity=${entity}`);
      const filteredData = response.data.map((item: any) => {
        const { embedding, ...rest } = item;
        return rest;
      });
      setData({ [entity]: filteredData });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const convertNaturalLanguageDates = async (text: string) => {
    try {
      const response = await axios.post('/api/chat', {
        messages: [{ role: 'user', content: text }],
      });
      return response.data;
    } catch (error) {
      console.error('Error converting dates:', error);
      toast({
        title: "Error",
        description: 'Failed to convert dates',
      });
    }
  };

  const handleDateRangeConversion = async () => {
    const dateRangeText = watch('dateRange') as string;
    if (dateRangeText) {
      const convertedDateRange = await convertNaturalLanguageDates(dateRangeText);
      if (convertedDateRange && convertedDateRange.startDate && convertedDateRange.endDate) {
        setValue('startDate', new Date(convertedDateRange.startDate));
        setValue('endDate', new Date(convertedDateRange.endDate));
      }
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    const entity = tabs[selectedTab].entity;

    try {
      const embeddingFields = ['shortDescription', 'longDescription', 'name', 'description', 'content', 'bio'];
      const fieldToEmbed = embeddingFields.find(field => field in data && typeof data[field] === 'string');

      if (fieldToEmbed) {
        const embedding = await generateEmbedding(data[fieldToEmbed] as string);
        data.embedding = embedding;
      }

      if (selectedItem && selectedItem.id) {
        // Update existing item
        const response = await axios.post(`/api/updateData`, data, {
          params: { entity },
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
          throw new Error('Failed to update data');
        }

      } else {
        // Add new item
        const response = await axios.post(`/api/portfolio`, data, {
          params: { entity },
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
          throw new Error('Failed to add data');
        }
      }

      fetchData();
      toast({
        title: "Success",
        description: "Data updated successfully.",
      });
      reset();
      setSelectedItem(null);
    } catch (err) {
      setError(`Error updating data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: `Error updating data: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    for (const key in item) {
      if (key === 'startDate' || key === 'endDate') {
        setValue(key, new Date(item[key]));
      } else {
        setValue(key, item[key]);
      }
    }
  };

  const handleAddClick = () => {
    setSelectedItem({});
    for (const field of formFields[tabs[selectedTab].entity]) {
      setValue(field.name, '');
    }
  };

  const handleDeleteClick = async () => {
    const entity = tabs[selectedTab].entity;
    try {
      const response = await axios.delete(`/api/deleteData`, {
        params: { entity, id: confirmDelete.id },
      });

      if (response.status !== 200) {
        throw new Error('Failed to delete data');
      }

      fetchData();
      toast({
        title: "Success",
        description: "Data deleted successfully.",
      });
      setConfirmDelete(null);
    } catch (err) {
      console.error(`Error deleting data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: `Error deleting data: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
      setConfirmDelete(null);
    }
  };

  const handleCancelClick = () => {
    reset();
    setSelectedItem(null);
  };

  const startDate = watch('startDate') as Date;
  const endDate = watch('endDate') as Date;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8">Portfolio Admin Dashboard</h1>
      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
        <TabList className="flex p-1 space-x-1 bg-blue-900/20 dark:bg-gray-800 rounded-xl mb-8">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 text-blue-700 dark:text-gray-100 rounded-lg
                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 dark:ring-offset-gray-800 ring-white ring-opacity-60
                ${selected ? 'bg-white dark:bg-gray-700 shadow' : 'text-blue-100 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-gray-600 hover:text-white'}`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab) => (
            <TabPanel key={tab.name} className="bg-white dark:bg-gray-800 rounded-xl p-3">
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleAddClick}
                      className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600"
                    >
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                    <ScrollArea className="h-[400px] w-full">
                      <DialogHeader>
                        <DialogTitle>{selectedItem && selectedItem.id ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        <DialogDescription>
                          {selectedItem && selectedItem.id ? 'Edit the details of the item.' : 'Add a new item to the list.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
                        {formFields[tab.entity].map((field) => (
                          <FormField key={field.name} field={field} register={register} />
                        ))}
                        {(tab.entity === 'projects' || tab.entity === 'education' || tab.entity === 'workExperience') && (
                          <div>
                            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                            <div className="flex items-center">
                              <input
                                id="dateRange"
                                {...register('dateRange')}
                                placeholder="e.g., 7th July to 15th December 2023"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleDateRangeConversion}
                                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              >
                                Convert
                              </button>
                            </div>
                            <div className="mt-4">
                              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                              <DatePicker
                                id="startDate"
                                selected={startDate}
                                onChange={(date) => setValue('startDate', date!)}
                                dateFormat="yyyy-MM-dd"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                              />
                            </div>
                            <div className="mt-4">
                              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                              <DatePicker
                                id="endDate"
                                selected={endDate}
                                onChange={(date) => setValue('endDate', date!)}
                                dateFormat="yyyy-MM-dd"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <button 
                            type="submit" 
                            className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                            disabled={loading}
                          >
                            {loading ? 'Submitting...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelClick}
                            className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                      {error && (
                        <div className="mt-4 p-2 bg-red-100 dark:bg-red-700 border border-red-400 text-red-700 dark:text-red-100 rounded">
                          {error}
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ) : (
                  <Table className="bg-white dark:bg-gray-800">
                    <TableCaption className="text-gray-900 dark:text-gray-100">A list of your recent {tab.name.toLowerCase()}.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(data[tab.entity]?.[0] || {}).map((key) => (
                          <TableHead key={key} className="text-gray-900 dark:text-gray-100">{key}</TableHead>
                        ))}
                        <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data[tab.entity]?.map((item: any) => (
                        <TableRow key={item.id}>
                          {Object.keys(item).map((key) => (
                            <TableCell key={key} className="text-gray-900 dark:text-gray-100">{item[key]}</TableCell>
                          ))}
                          <TableCell className="flex space-x-2 text-gray-900 dark:text-gray-100">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-600"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                                <ScrollArea className="h-[400px] w-full">
                                  <DialogHeader>
                                    <DialogTitle>Edit Item</DialogTitle>
                                    <DialogDescription>
                                      Edit the details of the item.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
                                    {formFields[tab.entity].map((field) => (
                                      <FormField key={field.name} field={field} register={register} />
                                    ))}
                                    {(tab.entity === 'projects' || tab.entity === 'education' || tab.entity === 'workExperience') && (
                                      <div>
                                        <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                                        <div className="flex items-center">
                                          <input
                                            id="dateRange"
                                            {...register('dateRange')}
                                            placeholder="e.g., 7th July to 15th December 2023"
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                          />
                                          <button
                                            type="button"
                                            onClick={handleDateRangeConversion}
                                            className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                          >
                                            Convert
                                          </button>
                                        </div>
                                        <div className="mt-4">
                                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                          <DatePicker
                                            id="startDate"
                                            selected={startDate}
                                            onChange={(date) => setValue('startDate', date!)}
                                            dateFormat="yyyy-MM-dd"
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                          />
                                        </div>
                                        <div className="mt-4">
                                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                          <DatePicker
                                            id="endDate"
                                            selected={endDate}
                                            onChange={(date) => setValue('endDate', date!)}
                                            dateFormat="yyyy-MM-dd"
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <button 
                                        type="submit" 
                                        className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                                        disabled={loading}
                                      >
                                        {loading ? 'Submitting...' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelClick}
                                        className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                  {error && (
                                    <div className="mt-4 p-2 bg-red-100 dark:bg-red-700 border border-red-400 text-red-700 dark:text-red-100 rounded">
                                      {error}
                                    </div>
                                  )}
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-600"
                                  onClick={() => setConfirmDelete(item)}
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                                <DialogHeader>
                                  <DialogTitle>Confirm Deletion</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this item? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={handleDeleteClick}>Delete</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={Object.keys(data[tab.entity]?.[0] || {}).length} className="text-gray-900 dark:text-gray-100">Total</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">Total Count: {data[tab.entity]?.length}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                )}
              </div>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
