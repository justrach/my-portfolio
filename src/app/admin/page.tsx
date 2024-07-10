'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon } from 'lucide-react';
import {
  Dialog,
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

type EntityName = 'projects' | 'skills' | 'education' | 'thoughts' | 'workExperience' | 'personalInfo';

interface FormData {
  [key: string]: string | number | string[] | Float32Array | Date;
}

interface LoginFormData {
  username: string;
  password: string;
}

const tabs = [
  { name: 'Projects', entity: 'projects' },
  { name: 'Skills', entity: 'skills' },
  { name: 'Education', entity: 'education' },
  { name: 'Thoughts', entity: 'thoughts' },
  { name: 'Work Experience', entity: 'workExperience' },
  { name: 'Personal Info', entity: 'personalInfo' },
];

const formFields = {
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
    { name: 'label', type: 'text', placeholder: 'Label' },
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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const [data, setData] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const loginForm = useForm<LoginFormData>();
  const handleLogin: SubmitHandler<LoginFormData> = async (loginData) => {
    try {
      const response = await axios.post('/api/auth', loginData);
      if (response.data.success) {
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Logged in successfully.",
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };
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
    if (isAuthenticated) {
      fetchData();
    }
  }, [selectedTab, isAuthenticated]);

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
        const response = await axios.post(`/api/updateData`, data, {
          params: { entity },
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
          throw new Error('Failed to update data');
        }
      } else {
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
    setSelectedItem(null);
    reset();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8">Portfolio Admin Dashboard</h1>
      {!isAuthenticated ? (
    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
    <div>
      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
      <input
        id="username"
        type="text"
        {...loginForm.register('username', { required: true })}
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
      <input
        id="password"
        type="password"
        {...loginForm.register('password', { required: true })}
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
    <Button type="submit">Login</Button>
  </form>
      ) : (
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
                          <DialogTitle>{selectedItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                          <DialogDescription>
                            {selectedItem ? 'Edit the details of the item.' : 'Add a new item to the list.'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
                          {formFields[tab.entity as EntityName].map((field) => (
                            <div key={field.name}>
                              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.placeholder}
                              </label>
                              {field.type === 'textarea' ? (
                                <textarea
                                  id={field.name}
                                  {...register(field.name)}
                                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              ) : field.type === 'date' ? (
                                <DatePicker
                                  selected={watch(field.name) as Date}
                                  onChange={(date: Date | null) => date && setValue(field.name, date)}
                                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  id={field.name}
                                  {...register(field.name)}
                                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              )}
                            </div>
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
                                <Button
                                  type="button"
                                  onClick={handleDateRangeConversion}
                                  className="ml-2"
                                >
                                  Convert
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <Button type="submit" disabled={loading}>
                              {loading ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type="button" onClick={handleCancelClick} variant="outline">
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {data[tab.entity] && data[tab.entity][0] && Object.keys(data[tab.entity][0]).map((key) => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data[tab.entity]?.map((item: any) => (
                          <TableRow key={item.id}>
                            {Object.keys(item).map((key) => (
                              <TableCell key={key}>{item[key]}</TableCell>
                            ))}
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button onClick={() => handleEditClick(item)} variant="outline" size="sm">
                                      <PencilIcon className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                                    <ScrollArea className="h-[400px] w-full">
                                      <DialogHeader>
                                        <DialogTitle>Edit Item</DialogTitle>
                                        <DialogDescription>Make changes to the item here.</DialogDescription>
                                      </DialogHeader>
                                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
                                        {formFields[tab.entity as EntityName].map((field) => (
                                          <div key={field.name}>
                                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                              {field.placeholder}
                                            </label>
                                            {field.type === 'textarea' ? (
                                              <textarea
                                                id={field.name}
                                                {...register(field.name)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                              />
                                            ) : field.type === 'date' ? (
                                              <DatePicker
                                                selected={watch(field.name) as Date}
                                                onChange={(date: Date | null) => date && setValue(field.name, date)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                              />
                                            ) : (
                                              <input
                                                type={field.type}
                                                id={field.name}
                                                {...register(field.name)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                              />
                                            )}
                                          </div>
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
                                              <Button
                                                type="button"
                                                onClick={handleDateRangeConversion}
                                                className="ml-2"
                                              >
                                                Convert
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <Button type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                          </Button>
                                          <Button type="button" onClick={handleCancelClick} variant="outline">
                                            Cancel
                                          </Button>
                                        </div>
                                        </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setConfirmDelete(item)} variant="destructive" size="sm">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this item? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => setConfirmDelete(null)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteClick} variant="destructive">
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
                  )}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      )}
    </div>
  );
}