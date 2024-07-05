"use client";

import React, { useEffect } from 'react';
import {
  ComposerPrimitive,
  MessagePrimitive,
  MessagePrimitiveContentProps,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC, ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/src/app/components/ui/avatar";
import { Button } from "@/src/app/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/src/app/components/ui/tooltip";
import { cn } from "@/src/app/lib/utils";
import { SendHorizonalIcon } from "lucide-react";
import { FlipWords } from "../flip_words";
import { words } from "@/src/app/components/homepage/wordTopLevel";
import { AI } from "@/src/app/actions";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { PortfolioOverview, PortfolioData } from '@/components/PortfolioOverview';

export const Thread: FC = () => {
  const [messages, setMessages] = useUIState<typeof AI>();
  const { continueConversation } = useActions();

  useEffect(() => {
    const handlePortfolioItemClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      handleUserMessage(customEvent.detail);
    };

    window.addEventListener('portfolioItemClick', handlePortfolioItemClick);

    return () => {
      window.removeEventListener('portfolioItemClick', handlePortfolioItemClick);
    };
  }, []);

  const handleUserMessage = async (message: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{message}</UserMessage>,
      },
    ]);

    const responseMessage = await continueConversation(message);

    setMessages((currentMessages) => [
      ...currentMessages,
      responseMessage,
    ]);
  };

  const exampleMessages = [
    {
      heading: 'Tell me about',
      subheading: 'your portfolio',
      message: 'Give me an overview of your portfolio'
    },
    {
      heading: 'What are your',
      subheading: 'key skills?',
      message: 'What are your main skills and expertise?'
    },
    {
      heading: 'Recent projects',
      subheading: 'you worked on',
      message: 'Tell me about your recent projects'
    },
  ];

  return (
    <TooltipProvider>
      <ThreadPrimitive.Root className="bg-background h-full">
        <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth px-4 pt-8">
          <ThreadWelcome />

          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />

          <div className="sticky bottom-0 mt-4 flex w-full max-w-2xl flex-grow flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
            <div className="flex flex-row flex-wrap">
              {messages.length === 0 &&
                exampleMessages.map((example, index) => (
                  <div
                    key={example.heading}
                    className={`cursor-pointer rounded-lg border bg-white p-4 m-2 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                      index > 1 && 'hidden md:block'
                    }`}
                    onClick={() => handleUserMessage(example.message)}
                  >
                    <div className="text-sm font-semibold">{example.heading}</div>
                    <div className="text-sm text-zinc-600">
                      {example.subheading}
                    </div>
                  </div>
                ))}
            </div>
            <Composer onSend={handleUserMessage} />
          </div>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </TooltipProvider>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex flex-grow basis-full flex-col items-center justify-center">
        <Avatar>
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <p className="mt-4 text-lg font-medium">I am<FlipWords words={words} /> <br /></p>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const Composer: FC<{ onSend: (message: string) => void }> = ({ onSend }) => {
  return (
    <ComposerPrimitive.Root
      onSend={(message) => onSend(message)}
      className="relative flex w-full items-end rounded-lg border transition-shadow focus-within:shadow-sm"
    >
      <ComposerPrimitive.Input
        autoFocus
        placeholder="Write a message..."
        rows={1}
        className="placeholder:text-muted-foreground size-full max-h-40 resize-none bg-transparent p-4 pr-12 text-sm outline-none"
      />
      
      <Tooltip>
        <ComposerPrimitive.Send asChild>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "absolute bottom-0 right-0 m-2.5 size-8 p-2 transition-opacity"
              )}
            >
              <SendHorizonalIcon />
              <span className="sr-only">Send</span>
            </Button>
          </TooltipTrigger>
        </ComposerPrimitive.Send>
        <TooltipContent side="bottom">Send</TooltipContent>
      </Tooltip>
    </ComposerPrimitive.Root>
  );
};
// Wrapper component to ensure children are passed correctly
const MessageContentWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MessagePrimitive.Content components={{}}>
      {children}
    </MessagePrimitive.Content>
  );
};

const UserMessage: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MessagePrimitive.Root className="my-4 grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2">
      <div className="bg-muted text-foreground col-start-2 row-start-1 max-w-xl break-words rounded-3xl px-5 py-2.5">
        <MessageContentWrapper>{children}</MessageContentWrapper>
      </div>
    </MessagePrimitive.Root>
  );
};
const AssistantMessage: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MessagePrimitive.Root className="relative my-4 grid w-full max-w-2xl grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      <Avatar className="col-start-1 row-span-full row-start-1 mr-4">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      <div className="text-foreground col-start-2 row-start-1 my-1.5 max-w-xl break-words leading-7">
        <MessagePrimitive.Content>{children}</MessagePrimitive.Content>
      </div>
    </MessagePrimitive.Root>
  );
};