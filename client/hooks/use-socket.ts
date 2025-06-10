'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  message: string
  sender: 'user' | 'assistant'
  timestamp: string
  isTyping?: boolean
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  isAgentReady: boolean
  sendMessage: (message: string) => void
  clearChat: () => void
  messages: ChatMessage[]
  isTyping: boolean
  error: string | null
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAgentReady, setIsAgentReady] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
    
    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    })

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      setError(null)
      reconnectAttempts.current = 0
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
      setIsTyping(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setError('Failed to connect to server')
      setIsConnected(false)
      
      reconnectAttempts.current++
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Unable to connect after multiple attempts')
      }
    })

    // Agent status
    socketInstance.on('connection_status', (data) => {
      setIsAgentReady(data.agentReady)
      if (!data.agentReady) {
        setError('Agent is initializing, please wait...')
      } else {
        setError(null)
      }
    })

    // Chat events
    socketInstance.on('agent_response', (data) => {
      setMessages(prev => [...prev, {
        id: data.messageId || Date.now().toString(),
        message: data.message,
        sender: 'assistant',
        timestamp: data.timestamp || new Date().toISOString()
      }])
      setIsTyping(false)
    })

    socketInstance.on('agent_typing', (data) => {
      setIsTyping(data.typing)
    })

    socketInstance.on('chat_cleared', () => {
      setMessages([])
    })

    socketInstance.on('error', (data) => {
      setError(data.message)
      setIsTyping(false)
    })

    setSocket(socketInstance)

    // Add welcome message
    setMessages([{
      id: 'welcome',
      message: '👋 Hello! I\'m your GoHighLevel AI Assistant. I can help you manage your CRM, contacts, opportunities, calendar, and much more. What would you like to do today?',
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }])

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const sendMessage = (message: string) => {
    if (!socket || !isConnected || !isAgentReady) {
      setError('Not connected to server or agent not ready')
      return
    }

    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setError(null)
    
    socket.emit('chat_message', {
      message: message.trim(),
      timestamp: userMessage.timestamp
    })
  }

  const clearChat = () => {
    if (socket && isConnected) {
      socket.emit('clear_chat')
    }
  }

  return {
    socket,
    isConnected,
    isAgentReady,
    sendMessage,
    clearChat,
    messages,
    isTyping,
    error
  }
} 