import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { z } from 'zod';

const enhancedDescriptionSchema = z.object({
  enhancedDescription: z.string()
});

const MAX_RETRIES = 5;

async function getCompletion(groq2: OpenAI, message: any) {
  const model = 'llama3-8b-8192';
  const completion = await groq2.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an AI assistant that enhances project descriptions. Provide an engaging and detailed description based on the given input."
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