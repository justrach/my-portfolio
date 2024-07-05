// app/api/fetchData/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

type EntityName = keyof typeof schema;

const isValidEntity = (entity: string): entity is EntityName => {
  return entity in schema;
};

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
      default:
        return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch ${entity}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${entity}` }, { status: 500 });
  }
}