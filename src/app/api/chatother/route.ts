import { createAnthropic } from '@ai-sdk/anthropic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { z } from 'zod';

const enhancedDescriptionSchema = z.object({
  enhancedDescription: z.string()
});

const enhancedDateSchema = z.object({
  enhancedDate: z.string()
});

const MAX_RETRIES = 9;

async function getCompletion(anthropic: any, message: any) {
  const model = anthropic('claude-3-5-sonnet-20240620');
  const completion = await anthropic.chat.completions.create({
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are an AI assistant that enhances project descriptions. Provide an engaging and detailed description based on the given input and output it only in markdown format. Do not create fake information. Only build things based off what has been written"
      },
      {
        role: "user",
        content: message
      }
    ],
    model,
  });
  return completion.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  const { description } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }
  const anthropic = createAnthropic({
    // custom settings
  });

  const message = description;
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const content = await getCompletion(anthropic, message);
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

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }

  const anthropic = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

//   const message = `Transform these dates into a more readable format: Start Date: ${startDate}, End Date: ${endDate}. It should be very easy; so for example if the date is July 23 to July 27th, just say the project lasted 5 days. If it is July X 2023 to July Y 2024, say it lasted a year from July 2023 to July 2024. Do not give the exact dates if that is asked. Just give the duration in a human readable format. Do not say the project as well. Just say that it lasted X days or X months or X years. Do not include the year if it is the current year. If the start date is in the past, do not include the year. If the end date is in the future, do not include the year. If the start date is in the past and the end date is in the future, do not include the year. If the start date is in the future and the end date is in the future, do not include the year. If the start date is in the past and the end date is in the past, do not include the year. If the start date is in the future, do not include the year. If it lasted x days, just say it lasted x days in (Month, YEAR). If it lasted x months, just say it lasted x months in (YEAR). If it lasted x years, just say it lasted x years. If it lasted x years and x months, just say it lasted x years and x months. If it lasted x years and x months and x days, just say it lasted x years, x months, and x days. If it lasted X days in (month) always add it lased X days in Month YEAR`;
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
      const content = await getCompletion(anthropic, message);
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
