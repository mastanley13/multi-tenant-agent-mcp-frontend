'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Send, 
  Menu, 
  Bot, 
  User, 
  Sparkles, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import ReactMarkdown from 'react-markdown'
import { Session } from 'next-auth'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

interface ChatWindowProps {
  conversationId: string | null
  onToggleSidebar: () => void
  sidebarOpen: boolean
  session?: Session | null
}

export function ChatWindow({
  conversationId,
  onToggleSidebar,
  sidebarOpen,
  session
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setStreamingMessage('')

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let streamingContent = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setStreamingMessage('')
                setIsLoading(false)
                
                if (streamingContent.trim()) {
                  const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: streamingContent,
                    role: 'assistant',
                    createdAt: new Date().toISOString()
                  }
                  setMessages(prev => [...prev, assistantMessage])
                }
                
                if (conversationId) {
                  await fetchMessages()
                }
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  streamingContent += parsed.content
                  setStreamingMessage(streamingContent)
                }
              } catch (e) {
                // Ignore parse errors for malformed chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setIsLoading(false)
      setStreamingMessage('')
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getPersonalizedWelcome = () => {
    const hour = new Date().getHours()
    let greeting = 'Hello'
    
    if (hour < 12) greeting = 'Good morning'
    else if (hour < 17) greeting = 'Good afternoon'
    else greeting = 'Good evening'
    
    const userName = session?.user?.name?.split(' ')[0] || 'there'
    
    return {
      greeting,
      userName,
      locationInfo: session?.locationId ? `Location ID: ${session.locationId.slice(-8)}` : null,
      planInfo: session?.planId ? `${session.planId.replace('_', ' ').toUpperCase()} Plan` : null
    }
  }

  const quickActions = [
    {
      icon: Users,
      label: 'Recent Contacts',
      action: 'Show me my recent contacts',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      label: 'Sales Pipeline',
      action: 'What deals are in my pipeline?',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Calendar,
      label: 'Today\'s Calendar',
      action: 'Show me today\'s appointments',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      label: 'Performance',
      action: 'Show me my business metrics',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const welcome = getPersonalizedWelcome()

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {conversationId ? 'AI Assistant' : 'New Conversation'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {session?.userType || 'GoHighLevel'} Assistant
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Online</span>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 lg:px-6">
        <div className="space-y-6 max-w-4xl mx-auto py-6">
          {messages.length === 0 && !conversationId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              {/* Personalized Welcome */}
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
                >
                  {welcome.greeting}, {welcome.userName}! 👋
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-600 dark:text-slate-400 mb-4 max-w-2xl mx-auto"
                >
                  I'm your AI-powered GoHighLevel assistant. I can help you manage contacts, 
                  analyze your sales pipeline, schedule appointments, and much more.
                </motion.p>
                
                {(welcome.locationInfo || welcome.planInfo) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-8"
                  >
                    {welcome.locationInfo && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{welcome.locationInfo}</span>
                      </div>
                    )}
                    {welcome.planInfo && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{welcome.planInfo}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
              >
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => setInput(action.action)}
                    className="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {action.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click to get started
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-10 h-10 shadow-lg">
                <AvatarFallback className={
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }>
                  {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl ${
                message.role === 'user' ? 'ml-auto' : 'mr-auto'
              }`}>
                <div
                  className={`px-6 py-4 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
                <div className={`text-xs text-slate-500 dark:text-slate-400 mt-2 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Streaming Message */}
          <AnimatePresence>
            {streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start space-x-3"
              >
                <Avatar className="w-10 h-10 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl">
                  <div className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-lg">
                    <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                      {streamingMessage}
                    </ReactMarkdown>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoading && !streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start space-x-3"
              >
                <Avatar className="w-10 h-10 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <LoadingSpinner size="sm" />
                  <span className="ml-3 text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 lg:p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
      >
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me anything about your GoHighLevel account, ${welcome.userName}...`}
              disabled={isLoading}
              className="min-h-[3rem] px-4 py-3 pr-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {input && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400 rounded">
                  ⏎
                </kbd>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 