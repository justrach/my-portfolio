// File: db/schema.ts
import { pgTable, serial, text, date, integer, varchar, vector } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description').notNull(),
  technologies: text('technologies').array().notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  githubLink: varchar('github_link', { length: 255 }),
  liveLink: varchar('live_link', { length: 255 }),
  embedding: vector('embedding', { dimensions: 1536 }),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  proficiency: integer('proficiency').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
});

export const education = pgTable('education', {
  id: serial('id').primaryKey(),
  institution: varchar('institution', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 255 }).notNull(),
  fieldOfStudy: varchar('field_of_study', { length: 255 }).notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  description: text('description'),
  embedding: vector('embedding', { dimensions: 1536 }),
});

export const thoughts = pgTable('thoughts', {
  id: serial('id').primaryKey(),
  topic: varchar('topic', { length: 255 }).notNull(),
  content: text('content').notNull(),
  dateAdded: date('date_added').notNull().defaultNow(),
  embedding: vector('embedding', { dimensions: 1536 }),
});

export const workExperience = pgTable('work_experience', {
  id: serial('id').primaryKey(),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  description: text('description'),
  embedding: vector('embedding', { dimensions: 1536 }),
});

export const personalInfo = pgTable('personal_info', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  location: varchar('location', { length: 255 }),
  bio: text('bio'),
  imageurl : varchar('imageurl', { length: 255 }),
  embedding: vector('embedding', { dimensions: 1536 }),
});

