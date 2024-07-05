// app/api/updateData/route.ts

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

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entity = searchParams.get('entity');

  if (!entity || !isValidEntity(entity)) {
    return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  }

  try {
    const data = await request.json();

    if (entity === 'projects' && data.technologies && !Array.isArray(data.technologies)) {
      data.technologies = data.technologies.split(',').map((tech: string) => tech.trim());
    }

    const embeddingFields = ['shortDescription', 'longDescription', 'name', 'description', 'content', 'bio'];
    const fieldToEmbed = embeddingFields.find(field => data[field]);

    if (fieldToEmbed) {
      const embeddingArray = await generateEmbedding(data[fieldToEmbed]);
      data.embedding = embeddingArray;
    }

    let updatedEntry;
    switch (entity) {
      case 'projects':
        updatedEntry = await db.update(schema.projects).set(data).where(eq(schema.projects.id, data.id)).returning();
        break;
      case 'skills':
        updatedEntry = await db.update(schema.skills).set(data).where(eq(schema.skills.id, data.id)).returning();
        break;
      case 'education':
        updatedEntry = await db.update(schema.education).set(data).where(eq(schema.education.id, data.id)).returning();
        break;
      case 'thoughts':
        updatedEntry = await db.update(schema.thoughts).set(data).where(eq(schema.thoughts.id, data.id)).returning();
        break;
      case 'workExperience':
        updatedEntry = await db.update(schema.workExperience).set(data).where(eq(schema.workExperience.id, data.id)).returning();
        break;
      case 'personalInfo':
        updatedEntry = await db.update(schema.personalInfo).set(data).where(eq(schema.personalInfo.id, data.id)).returning();
        break;
      default:
        return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
    }
    return NextResponse.json(updatedEntry[0]);
  } catch (error) {
    console.error(`Failed to update ${entity}:`, error);
    return NextResponse.json({ error: `Failed to update ${entity}` }, { status: 500 });
  }
}