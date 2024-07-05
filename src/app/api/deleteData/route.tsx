// app/api/deleteData/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

type EntityName = keyof typeof schema;

const isValidEntity = (entity: string): entity is EntityName => {
  return entity in schema;
};

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entity = searchParams.get('entity');
  const id = searchParams.get('id');

  if (!entity || !isValidEntity(entity) || !id) {
    return NextResponse.json({ error: 'Invalid entity or id' }, { status: 400 });
  }

  try {
    let deletedEntry;
    switch (entity) {
      case 'projects':
        deletedEntry = await db.delete(schema.projects).where(eq(schema.projects.id, Number(id))).returning();
        break;
      case 'skills':
        deletedEntry = await db.delete(schema.skills).where(eq(schema.skills.id, Number(id))).returning();
        break;
      case 'education':
        deletedEntry = await db.delete(schema.education).where(eq(schema.education.id, Number(id))).returning();
        break;
      case 'thoughts':
        deletedEntry = await db.delete(schema.thoughts).where(eq(schema.thoughts.id, Number(id))).returning();
        break;
      case 'workExperience':
        deletedEntry = await db.delete(schema.workExperience).where(eq(schema.workExperience.id, Number(id))).returning();
        break;
      case 'personalInfo':
        deletedEntry = await db.delete(schema.personalInfo).where(eq(schema.personalInfo.id, Number(id))).returning();
        break;
      default:
        return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
    }
    return NextResponse.json(deletedEntry[0]);
  } catch (error) {
    console.error(`Failed to delete ${entity}:`, error);
    return NextResponse.json({ error: `Failed to delete ${entity}` }, { status: 500 });
  }
}
