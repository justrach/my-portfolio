'use client'
import React from 'react';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
    <code>{children}</code>
  </pre>
);

export default function HowToSetUpDrizzle() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">How to Set Up Drizzle ORM</h1>
      
      <ol className="list-decimal space-y-6 pl-6">
        <li>
          <h2 className="text-xl font-semibold mb-2">Install dependencies</h2>
          <CodeBlock>
            npm install drizzle-orm @neondatabase/serverless dotenv
            npm install -D drizzle-kit
          </CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Set up environment variables</h2>
          <p>Create a <code>.env</code> file in your project root and add your Neon database URL:</p>
          <CodeBlock>
            DATABASE_URL=postgres://user:password@your-neon-db-url/dbname
          </CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Create Drizzle config file</h2>
          <p>Create a file named <code>drizzle.config.ts</code> in your project root:</p>
          <CodeBlock>
            {`import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});`}
          </CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Set up database connection</h2>
          <p>Create a file named <code>db/index.ts</code>:</p>
          <CodeBlock>
            {`import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);`}
          </CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Define your schema</h2>
          <p>Create a file named <code>db/schema.ts</code> and define your database schema using Drizzle&#39;s syntax.</p>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Add scripts to package.json</h2>
          <CodeBlock>
            {`"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "db:migrate": "drizzle-kit migrate"
}`}
          </CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Generate migrations</h2>
          <CodeBlock>npm run db:generate</CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Push changes to your database</h2>
          <CodeBlock>npm run db:push</CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Enable pgvector in your Neon database</h2>
          <p>Run the following SQL command in your Neon SQL editor:</p>
          <CodeBlock>CREATE EXTENSION IF NOT EXISTS vector;</CodeBlock>
        </li>

        <li>
          <h2 className="text-xl font-semibold mb-2">Use Drizzle in your API routes</h2>
          <p>Import and use the db object in your API routes to perform database operations.</p>
        </li>
      </ol>
    </div>
  );
}