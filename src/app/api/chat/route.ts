import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const MAX_RETRIES = 17;

async function getCompletion(groq2: OpenAI, message: any) {
  const model = 'llama3-8b-8192';
  const completion = await groq2.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Convert the following natural language date ranges into the format YYYY-MM-DD and return only the JSON format with fields "startDate" and "endDate":
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}`
      },
      message
    ],
    model,
  });

  return completion.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }

  const groq2 = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  const message = messages[0];
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const content = await getCompletion(groq2, message);
      const parsedContent = JSON.parse(content || ''); // Handle null by providing a default value
      dateRangeSchema.parse(parsedContent);
      // console.log(parsedContent)
      return NextResponse.json(parsedContent);
    } catch (error) {
      attempts += 1;
      if (attempts >= MAX_RETRIES) {
        return NextResponse.json({ error: 'Invalid date range format' }, { status: 400 });
      }
    }
  }
}