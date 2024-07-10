import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";
import { z } from 'zod';
import { createAnthropic } from '@ai-sdk/anthropic';

const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const MAX_RETRIES = 17;

async function getCompletion(anthropic: any, message: any) {
  const model = anthropic('claude-3-5-sonnet-20240620');
  const completion = await anthropic.chat.completions.create({
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
// change
export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }
  const anthropic = createAnthropic({
    // custom settings
  });



  const message = messages[0];
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const content = await getCompletion(anthropic, message);
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