import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const MAX_RETRIES = 3;

async function getCompletion(groq: OpenAI, messages: any[]) {
  const model = 'llama3-70b-8192';
  const completion = await groq.chat.completions.create({
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `You are an AI assistant for Rach Pradhan's portfolio website. Your primary function is to provide information about Rach's projects, skills, education, thoughts, work experience, and personal information. Always maintain a professional and friendly tone. If you don't have specific information or if a question is inappropriate, politely state that you can't provide that information. Use the following guidelines:

        1. Projects: Discuss Rach's projects in detail, highlighting technologies used, challenges overcome, and outcomes achieved.
        2. Skills: Elaborate on Rach's technical and soft skills, providing context on how they've been applied in various projects or work experiences.
        3. Education: Share information about Rach's educational background, including degrees, institutions, and any notable achievements or coursework.
        4. Thoughts/Blog Posts: Summarize and discuss any thoughts or blog posts Rach has written, focusing on the main ideas and their relevance to his work or industry.
        5. Work Experience: Provide details about Rach's professional experiences, including roles, responsibilities, and key accomplishments.
        6. Personal Information: Share appropriate personal information that Rach has made public, such as professional interests or career goals. Respect privacy by not disclosing sensitive personal details.

        Always base your responses on the information provided in the conversation history and any additional context given. If you're unsure about something, it's okay to say so rather than making assumptions. Encourage further questions and engage in a helpful, informative dialogue.`
      },
      ...messages
    ],
    model,
  });
  return completion.choices[0].message;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 400 });
  }

  const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const response = await getCompletion(groq, messages);
      return NextResponse.json(response);
    } catch (error) {
      attempts += 1;
      if (attempts >= MAX_RETRIES) {
        console.error('Error generating response:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
      }
    }
  }
}