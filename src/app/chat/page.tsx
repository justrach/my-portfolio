'use client'
import { useState, useRef, useEffect } from 'react'
import { useActions, useUIState } from 'ai/rsc'
import ReactMarkdown from 'react-markdown'
import { AI } from '../actions'
import { FiSend } from 'react-icons/fi'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FlipWords } from '../components/ui/flip_words'
import { words } from '../components/homepage/wordTopLevel'
import { PlaceholdersAndVanishInput } from '../components/ui/acc_ui/newInput'

const exampleMessages = [
  {
    heading: 'Tell me about',
    subheading: 'your portfolio',
    message: 'Give me an overview of your portfolio'
  },
  {
    heading: 'What are your',
    subheading: 'some projects you have done?',
    message: 'List projects you have worked on'
  },
  {
    heading: 'What are your',
    subheading: 'favourite programming languages?',
    message: 'Tell me about your programming languages'
  },
];

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const { continueConversation } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [typingIndex, setTypingIndex] = useState({});
  const { scrollY } = useViewportScroll()
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await sendMessage(inputValue)
  }

  const sendMessage = async (message: string) => {
    if (!message.trim()) return
    setMessages((messages) => [
      ...messages,
      { id: String(Date.now()), role: 'user', display: message },
    ])
    setInputValue('')
    const aiMessage = await continueConversation(message)
    setMessages((messages) => [...messages, aiMessage])
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handlePortfolioItemClick = (event: CustomEvent) => {
      const action = event.detail
      sendMessage(action)
    }

    window.addEventListener('portfolioItemClick', handlePortfolioItemClick as EventListener)

    return () => {
      window.removeEventListener('portfolioItemClick', handlePortfolioItemClick as EventListener)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div ref={chatContainerRef} className="flex-grow overflow-auto p-4 sm:p-6">
        <motion.div 
          className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {messages.length === 0 && (
            <motion.div 
              className="text-center mb-6 sm:mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ scale }}
            >
          <h1 className="text-xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-4">
               Hey nice to see you on my portfolio website! I am<FlipWords words={words}/>  
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 sm:mb-8">
                What would you like to know about me?
              </p>
            </motion.div>
          )}
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`max-w-[85%] sm:max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold mb-1 sm:mb-2 text-xs sm:text-base">
                    R
                  </div>
                )}
               <div
                  className={`p-3 sm:p-4 text-sm sm:text-base ${
                    message.role === 'user'
                      ? 'bg-gray-200 rounded-full dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow'
                      : 'bg-white rounded-xl dark:bg-black text-gray-800 dark:text-gray-200 shadow'
                  }`}
                >
                  {typeof message.display === 'string' ? (
                    <ReactMarkdown className="prose max-w-none">{message.display}</ReactMarkdown>
                  ) : (
                    message.display
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </motion.div>
      </div>
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center justify-end space-x-2 mb-3">
          <Label htmlFor="custom-input-mode" className="text-sm ">Custom Input</Label>
          <Switch
            id="custom-input-mode"
            checked={showCustomInput}
            onCheckedChange={setShowCustomInput}
          />
        </div>
        {showCustomInput ? (
          <PlaceholdersAndVanishInput
            placeholders={[
              "Ask me anything...",
              "What can I help you with?",
              "Have a question? Ask away!"
            ]}
            onChange={(e) => setInputValue(e.target.value)}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="overflow-x-auto sm:overflow-x-visible flex sm:grid sm:grid-cols-3 gap-3 scrollbar-hide">
            {exampleMessages.map((example, index) => (
              <Button
                key={index}
                onClick={() => sendMessage(example.message)}
                className="p-2 h-auto text-center text-sm min-w-[200px] sm:min-w-[auto]"
              >
                <div>
                  <h3 className="font-semibold ">{example.heading}</h3>
                  <p className="text-xs  mt-1">{example.subheading}</p>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}