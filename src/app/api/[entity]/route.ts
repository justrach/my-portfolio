// File: app/api/[entity]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { entity: string } }
) {
  const { entity } = params;

  if (!(entity in schema)) {
    return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  }

  try {
    const data = await db.select().from(schema[entity as keyof typeof schema]);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch ${entity}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${entity}` }, { status: 500 });
  }
}