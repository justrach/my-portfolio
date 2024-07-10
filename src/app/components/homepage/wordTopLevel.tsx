'use client'
import { FlipWords } from "@/src/app/components/ui/flip_words";
import React from "react";


export const words = ['Rach','Rach Pradhan'];



export default function AccentryComponent() {
  const words = ['rach', 'a developer', 'a designer', 'a creator'];

  return (
    <div className="h-[40rem] flex justify-center items-center px-4">
      <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Hi there. I am 
        <FlipWords words={words} /> <br />
      Talk to me
      </div>
    </div>
  );
}
