import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const MAX_RETRIES = 17;

async function getCompletion(message: any) {
  const { text } = await generateText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    prompt: `Convert the following natural language date ranges into the format YYYY-MM-DD and return only the JSON format with fields "startDate" and "endDate":
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}

User input: ${message.content}`
  });

  return text;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }

  const message = messages[0];
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const content = await getCompletion(message);
      const parsedContent = JSON.parse(content || '{}');
      dateRangeSchema.parse(parsedContent);
      return NextResponse.json(parsedContent);
    } catch (error) {
      attempts += 1;
      if (attempts >= MAX_RETRIES) {
        return NextResponse.json({ error: 'Invalid date range format' }, { status: 400 });
      }
    }
  }
}