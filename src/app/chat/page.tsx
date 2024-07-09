'use client'
import { useState, useRef, useEffect } from 'react'
import { useActions, useUIState } from 'ai/rsc'
import ReactMarkdown from 'react-markdown'
import { AI } from '../actions'
import { FiSend } from 'react-icons/fi'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div ref={chatContainerRef} className="flex-grow overflow-auto p-6">
        <motion.div 
          className="max-w-3xl mx-auto space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {messages.length === 0 && (
            <motion.div 
              className="text-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ scale }}
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome, I am<FlipWords words={words}/>  </h1>
              <p className="text-xl text-gray-600 mb-8">What would you like to know about me?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exampleMessages.map((example, index) => (
                  <Button
                    key={index}
                    onClick={() => sendMessage(example.message)}
                    className="p-4 h-auto text-center"
                  >
                    <div>
                      <h3 className="font-semibold">{example.heading}</h3>
                      <p className="text-sm text-gray-500 mt-1">{example.subheading}</p>
                    </div>
                  </Button>
                ))}
              </div>
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
              <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold mb-2">
                    R
                  </div>
                )}
                <div
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gray-200 text-gray-800 shadow'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  {typeof message.display === 'string' ? (
                    <ReactMarkdown className="prose">{message.display}</ReactMarkdown>
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
      <div className="bg-white border-t border-gray-200 p-4">
        <PlaceholdersAndVanishInput
          placeholders={[
            "Ask me anything...",
            "What can I help you with?",
            "Have a question? Ask away!"
          ]}
          onChange={(e) => setInputValue(e.target.value)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}