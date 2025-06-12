'use client'

import { useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  conversationId?: string
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (message: string, conversationId?: string) => Promise<void>
  clearMessages: () => void
}

export function useChat(): UseChatReturn {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    if (!session) {
      setError('Please sign in to send messages')
      return
    }

    if (!message.trim()) return

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      conversationId
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          conversationId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle SSE stream
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let assistantMessage = ''
      const assistantMessageId = (Date.now() + 1).toString()

      // Add placeholder for assistant message
      const assistantPlaceholder: ChatMessage = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        conversationId
      }

      setMessages(prev => [...prev, assistantPlaceholder])

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              setIsLoading(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.content) {
                assistantMessage += parsed.content
                
                // Update the assistant message in real-time
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ))
              }

              if (parsed.tool_calls) {
                // Handle tool calls if needed
                console.log('Tool calls:', parsed.tool_calls)
              }

            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return // Request was cancelled
      }
      
      console.error('Chat error:', error)
      setError(error.message || 'An error occurred while sending the message')
      
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [session])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  }
} 