'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Sun, Moon, Bot, User, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useSocket } from '@/hooks/use-socket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChatMessage } from '@/components/chat-message'
import { TypingIndicator } from '@/components/typing-indicator'
import { ConnectionStatus } from '@/components/connection-status'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const [message, setMessage] = useState('')
  const { theme, setTheme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    isConnected,
    isAgentReady,
    sendMessage,
    clearChat,
    messages,
    isTyping,
    error
  } = useSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (!message.trim() || !isConnected || !isAgentReady) return
    
    sendMessage(message)
    setMessage('')
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    clearChat()
    inputRef.current?.focus()
  }

  const canSend = message.trim() && isConnected && isAgentReady

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              GoHighLevel AI Assistant
            </h1>
            <ConnectionStatus 
              isConnected={isConnected} 
              isAgentReady={isAgentReady}
              error={error}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            disabled={!isConnected || messages.length === 0}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ChatMessage message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start space-x-3"
              >
                <Avatar className="w-8 h-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary/50 rounded-lg px-4 py-3 max-w-xs">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-destructive/10 border-t border-destructive/20"
          >
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !isConnected 
                  ? "Connecting to server..." 
                  : !isAgentReady 
                    ? "AI Agent is starting up..." 
                    : "Ask me anything about GoHighLevel..."
              }
              disabled={!isConnected}
              className={cn(
                "pr-12 py-3 text-base resize-none min-h-[48px] transition-all",
                "focus:ring-2 focus:ring-primary/20",
                !isConnected && "bg-muted",
                error && "border-destructive/30"
              )}
            />
            {message.trim() && (
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "absolute right-1 bottom-1 h-8 w-8 transition-all",
                  canSend 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                    : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                )}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3 max-w-4xl mx-auto">
          {messages.length === 1 && (
            <>
              <QuickActionButton 
                onClick={() => sendMessage("Show me my recent contacts")}
                disabled={!canSend}
              >
                📞 Recent Contacts
              </QuickActionButton>
              <QuickActionButton 
                onClick={() => sendMessage("What deals are in my pipeline?")}
                disabled={!canSend}
              >
                💰 Sales Pipeline
              </QuickActionButton>
              <QuickActionButton 
                onClick={() => sendMessage("Show me my appointments for today")}
                disabled={!canSend}
              >
                📅 Today's Calendar
              </QuickActionButton>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function QuickActionButton({ 
  children, 
  onClick, 
  disabled 
}: { 
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="text-xs bg-background/50 hover:bg-background border-border/50 hover:border-border transition-all"
    >
      {children}
    </Button>
  )
} 