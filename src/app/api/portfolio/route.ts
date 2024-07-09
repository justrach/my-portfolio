// File: app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { OpenAIEmbeddings } from "@langchain/openai";
import { eq } from 'drizzle-orm';

const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });

type EntityName = keyof typeof schema;

const isValidEntity = (entity: string): entity is EntityName => {
  return entity in schema;
};

async function generateEmbedding(text: string) {
  return await embeddings.embedQuery(text);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entity = searchParams.get('entity');

  if (!entity || !isValidEntity(entity)) {
    return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  }

  try {
    let data;
    switch (entity) {
      case 'projects':
        data = await db.select().from(schema.projects);
        break;
      case 'skills':
        data = await db.select().from(schema.skills);
        break;
      case 'education':
        data = await db.select().from(schema.education);
        break;
      case 'thoughts':
        data = await db.select().from(schema.thoughts);
        break;
      case 'workExperience':
        data = await db.select().from(schema.workExperience);
        break;
      case 'personalInfo':
        data = await db.select().from(schema.personalInfo);
        break;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch ${entity}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${entity}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entity = searchParams.get('entity');

  if (!entity || !isValidEntity(entity)) {
    return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  }

  try {
    const data = await request.json();
    
    const embeddingFields = ['shortDescription', 'longDescription', 'name', 'description', 'content', 'bio'];
    const fieldToEmbed = embeddingFields.find(field => data[field]);
    
    if (fieldToEmbed) {
      const embeddingArray = await generateEmbedding(data[fieldToEmbed]);
      data.embedding = embeddingArray;
    }

    let newEntry;
    switch (entity) {
      case 'projects':
        // Ensure technologies is an array
        if (typeof data.technologies === 'string') {
          data.technologies = data.technologies.split(',').map((tech: string) => tech.trim());
        }
        newEntry = await db.insert(schema.projects).values(data).returning();
        break;
      case 'skills':
        newEntry = await db.insert(schema.skills).values(data).returning();
        break;
      case 'education':
        newEntry = await db.insert(schema.education).values(data).returning();
        break;
      case 'thoughts':
        newEntry = await db.insert(schema.thoughts).values(data).returning();
        break;
      case 'workExperience':
        newEntry = await db.insert(schema.workExperience).values(data).returning();
        break;
      case 'personalInfo':
        newEntry = await db.insert(schema.personalInfo).values(data).returning();
        break;
    }
    return NextResponse.json(newEntry[0]);
  } catch (error) {
    console.error(`Failed to create ${entity}:`, error);
    return NextResponse.json({ error: `Failed to create ${entity}` }, { status: 500 });
  }
}