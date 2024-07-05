'use client'

import { useState, useRef, useEffect } from 'react'
import { useActions, useUIState } from 'ai/rsc'
import ReactMarkdown from 'react-markdown'
import { AI } from '../actions'

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const { continueConversation } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setMessages((messages) => [
      ...messages,
      { id: String(Date.now()), role: 'user', display: inputValue },
    ])
    setInputValue('')

    const aiMessage = await continueConversation(inputValue)
    setMessages((messages) => [...messages, aiMessage])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
      <div className="flex-grow overflow-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {typeof message.display === 'string' ? (
                <ReactMarkdown>{message.display}</ReactMarkdown>
              ) : (
                message.display
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  )
}