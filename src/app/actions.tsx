"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import ReactMarkdown from 'react-markdown';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateText } from "ai";
import { PortfolioData, PortfolioOverview } from "@/components/client/overview";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});
const model = groq('llama3-8b-8192');

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}
async function fetchAllData(tableName: string) {
  try {
    const result = await db.execute(sql`
      SELECT * FROM ${sql.identifier(tableName)}
    `);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error);
    return [];
  }
}
async function fetchEntityData(query: string, tableName: string) {
  try {
    const response = await fetch('http://localhost:3000/api/embedding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMBEDDING_AUTH_SECRET}`
      },
      body: JSON.stringify({ text: query }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }
    
    const { embedding } = await response.json();

    const result = await db.execute(sql`
      SELECT *, 1 - (embedding <=> ${JSON.stringify(embedding)}::vector) AS similarity
      FROM ${sql.identifier(tableName)}
      ORDER BY similarity DESC
      LIMIT 1
    `);

    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error);
    return null;
  }
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  const history = getMutableAIState();

  const result = await streamUI({
    model: model,
    messages: [
      ...history.get(),
      {
        role: "system",
        content: `You are an AI assistant for a portfolio website. Use the provided tools to retrieve and present information about projects, skills, education, thoughts, work experience, and personal info.`,
      },
      { role: "user", content: input }
    ],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }
      return <div>{content}</div>;
    },
    tools: {
        getPortfolioOverview: {
          description: "Get a comprehensive overview of the entire portfolio",
          parameters: z.object({}),
          generate: async function* () {
            yield <div>Generating portfolio overview...</div>;
            try {
              const data: PortfolioData = {
                projects: await fetchAllData('projects'),
                skills: await fetchAllData('skills'),
                education: await fetchAllData('education'),
                thoughts: await fetchAllData('thoughts'),
                workExperience: await fetchAllData('work_experience'),
                personalInfo: await fetchAllData('personal_info'),
              };
  
              return <PortfolioOverview data={data} />;
            } catch (error) {
              console.error('Error generating portfolio overview:', error);
              return <div>Sorry, an error occurred while generating the portfolio overview.</div>;
            }
          },
        },
        getProject: {
          description: "Get information about a specific project",
          parameters: z.object({
            projectName: z.string().describe("The name or description of the project to retrieve information about"),
          }),
          generate: async function* ({ projectName }) {
            yield <div>Searching for project: {projectName}...</div>;
            try {
              let project;
        
              // First, try to fetch the project directly by name
              const directResult = await db.execute(sql`
                SELECT * FROM projects
                WHERE title = ${projectName}
                LIMIT 1
              `);
        
              if (directResult.rows.length > 0) {
                project = directResult.rows[0];
              } else {
                // If no exact match, fall back to embedding search
                project = await fetchEntityData(projectName, 'projects');
              }
        
              if (!project) {
                return <div>Sorry, I couldn't find a project matching "{projectName}".</div>;
              }
        
              const { embedding: _, ...projectWithoutEmbedding } = project;
        
              const prompt = `
                You are an AI assistant describing a project in an engaging and informative way. 
                Highlight the key aspects, technologies used, and any interesting features.
                
                Describe this project using proper Markdown format. Ensure you use Markdown syntax correctly for headers, lists, and links.
        
                Here's the project data:
                ${JSON.stringify(projectWithoutEmbedding)}
        
                Your response MUST be in this exact Markdown format:
        
                # [Project Title]<Bold it>
        
                [A brief, engaging introduction to the project]
        
                ## Key Features
        
                - [Feature 1]
                - [Feature 2]
                - [Feature 3]
        
                ## Technologies Used
        
                - [Technology 1]
                - [Technology 2]
                - [Technology 3]
        
                ## Project Details<Bold>
        
                [More detailed description of the project, its goals, and implementation. Use proper Markdown formatting for any subheaders, lists, or emphasis needed.]
        
                ## Links
        
                - [GitHub](GitHub link if available)
                - [Live Demo](Live demo link if available)
        
                Make sure to replace the placeholders with actual content from the project data. Use proper Markdown syntax throughout, including for links.
              `;
        
              yield <div>Generating project description...</div>;
        
              const { text: projectMarkdown } = await generateText({
                model: model,
                prompt: prompt,
              });
        
              return (
                <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}>
                  <ReactMarkdown>{projectMarkdown}</ReactMarkdown>
                </div>
              );
            } catch (error) {
              console.error('Error fetching project:', error);
              return <div>Sorry, an error occurred while retrieving the project information.</div>;
            }
          },
        },
      getSkill: {
        description: "Get information about a specific skill",
        parameters: z.object({
          skillName: z.string().describe("The name or description of the skill to retrieve information about"),
        }),
        generate: async function* ({ skillName }) {
          yield <div>Searching for skill: {skillName}...</div>;
          try {
            const skill = await fetchEntityData(skillName, 'skills');
            if (!skill) {
              return <div>Sorry, I couldn't find a skill matching "{skillName}".</div>;
            }

            const { embedding: _, ...skillWithoutEmbedding } = skill;

            const prompt = `
              You are an AI assistant describing a skill in an engaging and informative way. 
              Highlight the key aspects of the skill, its category, and proficiency level.
              
              Describe this skill in a natural, engaging way using pure markdown format:

              Here's the skill data:
              ${JSON.stringify(skillWithoutEmbedding)}

              Your response should be in this format:
              # [Skill Name]

              [A brief, engaging introduction to the skill]

              ## Category
              [Skill category]

              ## Proficiency Level
              [Proficiency level out of 5]

              ## Details
              [More detailed description of the skill, its applications, and importance]

              Make sure to replace the placeholders with actual content from the skill data.
            `;

            yield <div>Generating skill description...</div>;

            const { text: skillMarkdown } = await generateText({
              model: model,
              prompt: prompt,
            });

            return (
              <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}>
                <ReactMarkdown>{skillMarkdown}</ReactMarkdown>
              </div>
            );
          } catch (error) {
            console.error('Error fetching skill:', error);
            return <div>Sorry, an error occurred while retrieving the skill information.</div>;
          }
        },
      },
      getEducation: {
        description: "Get information about education",
        parameters: z.object({
          educationQuery: z.string().describe("The institution or degree to retrieve information about"),
        }),
        generate: async function* ({ educationQuery }) {
          yield <div>Searching for education: {educationQuery}...</div>;
          try {
            const education = await fetchEntityData(educationQuery, 'education');
            if (!education) {
              return <div>Sorry, I couldn't find education information matching "{educationQuery}".</div>;
            }

            const { embedding: _, ...educationWithoutEmbedding } = education;

            const prompt = `
              You are an AI assistant describing educational background in an engaging and informative way. 
              Highlight the key aspects of the education, including the institution, degree, and field of study.
              
              Describe this education in a natural, engaging way using pure markdown format:

              Here's the education data:
              ${JSON.stringify(educationWithoutEmbedding)}

              Your response should be in this format:
              # [Institution Name]

              [A brief, engaging introduction to the educational experience]

              ## Degree
              [Degree name]

              ## Field of Study
              [Field of study]

              ## Duration
              [Start date] - [End date]

              ## Details
              [More detailed description of the education, including key achievements, projects, or experiences]

              Make sure to replace the placeholders with actual content from the education data.
            `;

            yield <div>Generating education description...</div>;

            const { text: educationMarkdown } = await generateText({
              model: model,
              prompt: prompt,
            });

            return (
              <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}>
                <ReactMarkdown>{educationMarkdown}</ReactMarkdown>
              </div>
            );
          } catch (error) {
            console.error('Error fetching education:', error);
            return <div>Sorry, an error occurred while retrieving the education information.</div>;
          }
        },
      },
      getThought: {
        description: "Get information about a thought or blog post",
        parameters: z.object({
          thoughtQuery: z.string().describe("The topic or content to retrieve information about"),
        }),
        generate: async function* ({ thoughtQuery }) {
          yield <div>Searching for thought: {thoughtQuery}...</div>;
          try {
            const thought = await fetchEntityData(thoughtQuery, 'thoughts');
            if (!thought) {
              return <div>Sorry, I couldn't find a thought matching "{thoughtQuery}".</div>;
            }

            const { embedding: _, ...thoughtWithoutEmbedding } = thought;

            const prompt = `
              You are an AI assistant presenting a thought or blog post in an engaging and informative way. 
              Highlight the key aspects of the thought, including the topic and main ideas.
              
              Present this thought in a natural, engaging way using pure markdown format:

              Here's the thought data:
              ${JSON.stringify(thoughtWithoutEmbedding)}

              Your response should be in this format:
              # [Thought Topic]

              [Date added]

              [A brief, engaging introduction to the thought]

              ## Key Points
              - [Key point 1]
              - [Key point 2]
              - [Key point 3]

              ## Details
              [More detailed exposition of the thought, including any arguments, examples, or insights]

              Make sure to replace the placeholders with actual content from the thought data.
            `;

            yield <div>Generating thought presentation...</div>;

            const { text: thoughtMarkdown } = await generateText({
              model: model,
              prompt: prompt,
            });

            return (
              <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}>
                <ReactMarkdown>{thoughtMarkdown}</ReactMarkdown>
              </div>
            );
          } catch (error) {
            console.error('Error fetching thought:', error);
            return <div>Sorry, an error occurred while retrieving the thought information.</div>;
          }
        },
      },
      getWorkExperience: {
        description: "Get information about work experience",
        parameters: z.object({
          workQuery: z.string().describe("The company or position to retrieve information about"),
        }),
        generate: async function* ({ workQuery }) {
          yield <div>Searching for work experience: {workQuery}...</div>;
          try {
            const experience = await fetchEntityData(workQuery, 'work_experience');
            if (!experience) {
              return <div>Sorry, I couldn't find work experience matching "{workQuery}".</div>;
            }

            const { embedding: _, ...experienceWithoutEmbedding } = experience;

            const prompt = `
              You are an AI assistant describing work experience in an engaging and informative way. 
              Highlight the key aspects of the work experience, including the company, position, and responsibilities.
              
              Describe this work experience in a natural, engaging way using pure markdown format:

              Here's the work experience data:
              ${JSON.stringify(experienceWithoutEmbedding)}

              Your response should be in this format:
              # [Company Name] - [Position]

              [A brief, engaging introduction to the work experience]

              ## Duration
              [Start date] - [End date]

              ## Key Responsibilities
              - [Responsibility 1]
              - [Responsibility 2]
              - [Responsibility 3]

              ## Achievements
              [List of key achievements or projects completed during this role]

              ## Skills Developed
              [List of skills developed or enhanced in this role]

              Make sure to replace the placeholders with actual content from the work experience data.
            `;

            yield <div>Generating work experience description...</div>;

            const { text: experienceMarkdown } = await generateText({
              model: model,
              prompt: prompt,
            });

            return (
              <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}>
                <ReactMarkdown>{experienceMarkdown}</ReactMarkdown>
              </div>
            );
          } catch (error) {
            console.error('Error fetching work experience:', error);
            return <div>Sorry, an error occurred while retrieving the work experience information.</div>;
          }
        },
      },
      getPersonalInfo: {
        description: "Get personal information",
        parameters: z.object({
          infoQuery: z.string().describe("The type of personal information to retrieve"),
        }),
        generate: async function* ({ infoQuery }) {
          yield <div>Retrieving personal information: {infoQuery}...</div>;
          try {
            const personalInfo = await fetchEntityData(infoQuery, 'personal_info');
            if (!personalInfo) {
              return <div>Sorry, I couldn't find personal information matching "{infoQuery}".</div>;
            }

            const { embedding: _, ...infoWithoutEmbedding } = personalInfo;

            const prompt = `
              You are an AI assistant presenting personal information in a professional and engaging way. 
              Present the information while maintaining appropriate privacy and professionalism.
              
              Present this personal information in a natural, engaging way using pure markdown format:

              Here's the personal information data:
              ${JSON.stringify(infoWithoutEmbedding)}

              Your response should be in this format:
              # Personal Profile

              [A brief, professional introduction]

              ## Contact Information
              - Email: [Email address]
              - Phone: [Phone number]
              - Location: [Location]

              ## Professional Summary
              [A concise professional summary based on the bio]

              Make sure to replace the placeholders with actual content from the personal information data.
              Do not include any sensitive or private information in the response.
            `;

            yield <div>Generating personal information presentation...</div>;

            const { text: infoMarkdown } = await generateText({
              model: model,
              prompt: prompt,
            });

            return (
              <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', borderRadius: '8px' }}>
                <ReactMarkdown>{infoMarkdown}</ReactMarkdown>
              </div>
            );
          } catch (error) {
            console.error('Error fetching personal information:', error);
            return <div>Sorry, an error occurred while retrieving the personal information.</div>;
          }
        },
      },
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}


export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});