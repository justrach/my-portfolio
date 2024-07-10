import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { z } from 'zod';

const enhancedDescriptionSchema = z.object({
  enhancedDescription: z.string()
});

const enhancedDateSchema = z.object({
  enhancedDate: z.string()
});

const MAX_RETRIES = 9;

async function getCompletion(message: string) {
  const { text } = await generateText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    prompt: `You are an AI assistant that enhances project descriptions. Provide an engaging and detailed description based on the given input and output it only in markdown format. Do not create fake information. Only build things based off what has been written.

User input: ${message}`,
    temperature: 0
  });

  return text;
}

export async function POST(req: NextRequest) {
  const { description } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const content = await getCompletion(description);
      const parsedContent = { enhancedDescription: content };
      enhancedDescriptionSchema.parse(parsedContent);
      return NextResponse.json(parsedContent);
    } catch (error) {
      attempts += 1;
      if (attempts >= MAX_RETRIES) {
        return NextResponse.json({ error: 'Failed to generate enhanced description' }, { status: 400 });
      }
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Start date or end date is missing' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }

  const message = `Format these dates: Start Date: ${startDate}, End Date: ${endDate}.

1. If dates are in the same month and year, give the duration in days.
2. If in the same year but different months, give the duration in months.
3. If in different years, give the duration in years.
4. Always state the duration without exact dates.
5. Do not include the current year unless the end date is in the future.
6. If the duration is in days, mention the month and year.
7. For months, mention the year.
8. For years, just mention the duration.
9. Combine days, months, and years as needed.

Output only the duration, e.g., "3 days in June 2023" or "4 months from July 2023 to September 2023". Do not include introductory phrases or labels.`;

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const content = await getCompletion(message);
      const parsedContent = { enhancedDate: content };
      enhancedDateSchema.parse(parsedContent);
      return NextResponse.json(parsedContent);
    } catch (error) {
      attempts += 1;
      if (attempts >= MAX_RETRIES) {
        return NextResponse.json({ error: 'Failed to generate enhanced date' }, { status: 400 });
      }
    }
  }
}