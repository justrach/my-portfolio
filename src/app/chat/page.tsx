'use client'
import { useState, useRef, useEffect } from 'react'
import { useActions, useUIState } from 'ai/rsc'
import ReactMarkdown from 'react-markdown'
import { AI } from '../actions'
import { FiSend } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

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

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const { continueConversation } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
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
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the AI Chatbot</h1>
              <p className="text-xl text-gray-600 mb-8">How can I assist you today?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exampleMessages.map((example, index) => (
                  <Button
                    key={index}
                    onClick={() => sendMessage(example.message)}
                    className="p-4 h-auto text-left"
                  >
                    <h3 className="font-semibold">{example.heading}</h3>
                    <p className="text-sm text-gray-500">{example.subheading}</p>
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
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mb-2">
                    R
                  </div>
                )}
                <div
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
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
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" className="rounded-l-none">
            <FiSend className="mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}