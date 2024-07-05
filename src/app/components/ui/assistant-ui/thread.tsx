"use client";

import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";

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
export const Thread: FC = () => {
  const [messages, setMessages] = useUIState<typeof AI>()
  const { continueConversation } = useActions()
   const exampleMessages = [
    {
      heading: 'What are some cool facts',
      subheading: 'about you?',
      message: `How is fuckballs repo looking like`
    },
    {
      heading: 'Why do you eat ',
      subheading: 'beef?',
      message: 'What is the price of $DOGE right now?'
    },
    {
      heading: 'I would like to buy',
      subheading: '42 $DOGE',
      message: `I would like to buy 42 $DOGE`
    },
 
  ]
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
        onClick={async () => {
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{example.message}</UserMessage>,
            },
          ]);

          const responseMessage = await continueConversation(
            example.message
          );

          setMessages((currentMessages) => [
            ...currentMessages,
            responseMessage,
          ]);
        }}
      >
        <div className="text-sm font-semibold">{example.heading}</div>
        <div className="text-sm text-zinc-600">
          {example.subheading}
        </div>
      </div>
    ))}
</div>
            <Composer />
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

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="relative flex w-full items-end rounded-lg border transition-shadow focus-within:shadow-sm">
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

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="my-4 grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2">
      <div className="bg-muted text-foreground col-start-2 row-start-1 max-w-xl break-words rounded-3xl px-5 py-2.5">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative my-4 grid w-full max-w-2xl grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      <Avatar className="col-start-1 row-span-full row-start-1 mr-4">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      <div className="text-foreground col-start-2 row-start-1 my-1.5 max-w-xl break-words leading-7">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};
