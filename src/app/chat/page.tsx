// 'use client'
// import { useState, useRef, useEffect } from 'react'
// import { useActions, useUIState } from 'ai/rsc'
// import ReactMarkdown from 'react-markdown'
// import { AI } from '../actions'
// import { FiSend } from 'react-icons/fi'
// import { motion, useViewportScroll, useTransform } from 'framer-motion'
// import { Button } from '@/components/ui/button'
// import { FlipWords } from '../components/ui/flip_words'
// import { words } from '../components/homepage/wordTopLevel'
// import { PlaceholdersAndVanishInput } from '../components/ui/acc_ui/newInput'

// const exampleMessages = [
//   {
//     heading: 'Tell me about',
//     subheading: 'your portfolio',
//     message: 'Give me an overview of your portfolio'
//   },
//   {
//     heading: 'What are your',
//     subheading: 'key skills?',
//     message: 'What are your main skills and expertise?'
//   },
//   {
//     heading: 'Recent projects',
//     subheading: 'you worked on',
//     message: 'Tell me about your recent projects'
//   },
// ];

// export default function ChatPage() {
//   const [inputValue, setInputValue] = useState('')
//   const { continueConversation } = useActions()
//   const [messages, setMessages] = useUIState<typeof AI>()
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const chatContainerRef = useRef<HTMLDivElement>(null)
// const [typingIndex, setTypingIndex] = useState({});
//   const { scrollY } = useViewportScroll()
//   const scale = useTransform(scrollY, [0, 300], [1, 0.8])

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     await sendMessage(inputValue)
//   }

//   const sendMessage = async (message: string) => {
//     if (!message.trim()) return
//     setMessages((messages) => [
//       ...messages,
//       { id: String(Date.now()), role: 'user', display: message },
//     ])
//     setInputValue('')
//     const aiMessage = await continueConversation(message)
//     setMessages((messages) => [...messages, aiMessage])
//   }

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
//     }
//   }, [messages])

//   useEffect(() => {
//     const handlePortfolioItemClick = (event: CustomEvent) => {
//       const action = event.detail
//       sendMessage(action)
//     }

//     window.addEventListener('portfolioItemClick', handlePortfolioItemClick as EventListener)

//     return () => {
//       window.removeEventListener('portfolioItemClick', handlePortfolioItemClick as EventListener)
//     }
//   }, [])

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div ref={chatContainerRef} className="flex-grow overflow-auto p-6">
//         <motion.div 
//           className="max-w-3xl mx-auto space-y-6"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           {messages.length === 0 && (
//             <motion.div 
//               className="text-center mb-8"
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               style={{ scale }}
//             >
//               <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome, I am<FlipWords words={words}/>  </h1>
//               <p className="text-xl text-gray-600 mb-8">What would you like to know about me?</p>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {exampleMessages.map((example, index) => (
//                   <Button
//                     key={index}
//                     onClick={() => sendMessage(example.message)}
//                     className="p-4 h-auto text-left"
//                   >
//                     <div>
//                       <h3 className="font-semibold">{example.heading}</h3>
//                       <p className="text-sm text-gray-500 mt-1 text-center">{example.subheading}</p>
//                     </div>
//                   </Button>
//                 ))}
//               </div>
//             </motion.div>
//           )}
//           {messages.map((message, index) => (
//             <motion.div
//               key={message.id}
//               className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.3, delay: index * 0.1 }}
//             >
//               <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
//                 {message.role === 'assistant' && (
//                   <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold mb-2">
//                     R
//                   </div>
//                 )}
//                 <div
//                   className={`p-4 rounded-lg ${
//                     message.role === 'user'
//                       ? 'bg-gray-200 text-gray-800 shadow'
//                       : 'bg-white text-gray-800 shadow'
//                   }`}
//                 >
//                   {typeof message.display === 'string' ? (
//                     <ReactMarkdown className="prose">{message.display}</ReactMarkdown>
//                   ) : (
//                     message.display
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//           <div ref={messagesEndRef} />
//         </motion.div>
//       </div>
//       <div className="bg-white border-t border-gray-200 p-4">
//         <PlaceholdersAndVanishInput
//           placeholders={[
//             "Ask me anything...",
//             "What can I help you with?",
//             "Have a question? Ask away!"
//           ]}
//           onChange={(e) => setInputValue(e.target.value)}
//           onSubmit={handleSubmit}
//         />
//       </div>
//     </div>
//   )
// }
// 'use client'
// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import ReactFlow, {
//   addEdge,
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   NodeTypes,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { useActions, useUIState } from 'ai/rsc'
// import { AI } from '../actions'
// import { motion, useViewportScroll, useTransform } from 'framer-motion'
// import { Button } from '@/components/ui/button'
// import { FlipWords } from '../components/ui/flip_words'
// import { words } from '../components/homepage/wordTopLevel'
// import { PlaceholdersAndVanishInput } from '../components/ui/acc_ui/newInput'
// import { CardComponent } from '../components/ui/acc_ui/Card';

// const exampleMessages = [
//   {
//     heading: 'Tell me about',
//     subheading: 'your portfolio',
//     message: 'Give me an overview of your portfolio'
//   },
//   {
//     heading: 'What are your',
//     subheading: 'key skills?',
//     message: 'What are your main skills and expertise?'
//   },
//   {
//     heading: 'Recent projects',
//     subheading: 'you worked on',
//     message: 'Tell me about your recent projects'
//   },
// ];

// const InitialNode = ({ data }) => {
//   const { scrollY } = useViewportScroll()
//   const scale = useTransform(scrollY, [0, 300], [1, 0.8])

//   return (
//     <motion.div 
//       className="text-center mb-8 bg-white p-6 rounded-lg shadow-lg"
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       style={{ scale }}
//     >
//       <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome, I am<FlipWords words={words}/>  </h1>
//       <p className="text-xl text-gray-600 mb-8">What would you like to know about me?</p>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {exampleMessages.map((example, index) => (
//           <Button
//             key={index}
//             onClick={() => data.onSendMessage(example.message)}
//             className="p-4 h-auto text-left"
//           >
//             <div>
//               <h3 className="font-semibold">{example.heading}</h3>
//               <p className="text-sm text-gray-500 mt-1 text-center">{example.subheading}</p>
//             </div>
//           </Button>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// const nodeTypes: NodeTypes = {
//   initialNode: InitialNode,
//   cardNode: CardComponent,
// };

// export default function NodeBasedChat() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [inputValue, setInputValue] = useState('')
//   const { continueConversation } = useActions()
//   const [messages, setMessages] = useUIState<typeof AI>()

//   const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     await sendMessage(inputValue)
//   }

//   const sendMessage = async (message: string) => {
//     if (!message.trim()) return
//     setInputValue('')
//     const aiMessage = await continueConversation(message)
    
//     const newNode = {
//       id: String(Date.now()),
//       type: 'cardNode',
//       position: { x: Math.random() * 500, y: Math.random() * 500 },
//       data: { ...aiMessage.display.props.data, title: message },
//     };

//     setNodes((nds) => [...nds, newNode]);
//     setEdges((eds) => addEdge({
//       id: `e${nodes.length}-${newNode.id}`,
//       source: nodes.length > 0 ? nodes[nodes.length - 1].id : 'initial',
//       target: newNode.id,
//     }, eds));
//   }

//   useEffect(() => {
//     setNodes([
//       {
//         id: 'initial',
//         type: 'initialNode',
//         position: { x: 0, y: 0 },
//         data: { onSendMessage: sendMessage },
//       },
//     ]);
//   }, []);

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         nodeTypes={nodeTypes}
//       >
//         <Controls />
//         <MiniMap />
//         <Background variant="dots" gap={12} size={1} />
//       </ReactFlow>
//       <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
//         <PlaceholdersAndVanishInput
//           placeholders={[
//             "Ask me anything...",
//             "What can I help you with?",
//             "Have a question? Ask away!"
//           ]}
//           onChange={(e) => setInputValue(e.target.value)}
//           onSubmit={handleSubmit}
//         />
//       </div>
//     </div>
//   );
// }
'use client'
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useActions, useUIState } from 'ai/rsc'
import { AI } from '../actions'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FlipWords } from '../components/ui/flip_words'
import { words } from '../components/homepage/wordTopLevel'
import { PlaceholdersAndVanishInput } from '../components/ui/acc_ui/newInput'
import { AIResponseCard } from '../components/ui/acc_ui/card_2';

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

const InitialNode = ({ data }) => {
  const { scrollY } = useViewportScroll()
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  return (
    <motion.div 
      className="text-center mb-8 bg-white p-6 rounded-lg shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ scale, width: 300 }}
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, I am<FlipWords words={words}/>  </h1>
      <p className="text-lg text-gray-600 mb-4">What would you like to know about me?</p>
      <div className="flex flex-col gap-2">
        {exampleMessages.map((example, index) => (
          <Button
            key={index}
            onClick={() => data.onSendMessage(example.message)}
            className="p-2 h-auto text-left"
            variant="outline"
          >
            <div>
              <h3 className="font-semibold">{example.heading}</h3>
              <p className="text-sm text-gray-500">{example.subheading}</p>
            </div>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
const nodeTypes: NodeTypes = {
  initialNode: InitialNode,
  aiResponseNode: AIResponseCard,
};

const getRandomPosition = () => ({
  x: Math.random() * window.innerWidth * 0.8,
  y: Math.random() * window.innerHeight * 0.8,
});

export default function NodeBasedChat() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [inputValue, setInputValue] = useState('')
  const { continueConversation } = useActions()
  const [messages] = useUIState<typeof AI>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await sendMessage(inputValue)
  }

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return
    setInputValue('')
    await continueConversation(message)
  }, [continueConversation])

  useEffect(() => {
    const newNodes = messages.map((message, index) => ({
      id: `node-${index}`,
      type: 'aiResponseNode',
      position: getRandomPosition(),
      data: message,
    }));

    const initialNode = {
      id: 'initial',
      type: 'initialNode',
      position: { x: window.innerWidth / 2 - 150, y: 50 },
      data: { onSendMessage: sendMessage },
    };

    setNodes([initialNode, ...newNodes]);
  }, [messages, sendMessage, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
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
  );
}