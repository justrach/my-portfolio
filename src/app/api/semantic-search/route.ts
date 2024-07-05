// File: app/api/semantic-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embedding.data[0].embedding;

    const results = await Promise.all(
      Object.entries(schema).map(async ([entityName, table]) => {
        const entityResults = await db.execute(sql`
          SELECT *, 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
          FROM ${sql.identifier(table._.name)}
          ORDER BY similarity DESC
          LIMIT 5
        `);
        return { entityName, results: entityResults };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in semantic search:', error);
    return NextResponse.json({ error: 'Failed to perform semantic search' }, { status: 500 });
  }
}