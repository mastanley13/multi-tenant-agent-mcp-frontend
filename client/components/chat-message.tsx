'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { Copy, User, Bot } from 'lucide-react'

import { ChatMessage as ChatMessageType } from '@/hooks/use-socket'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const { theme } = useTheme()
  const isUser = message.sender === 'user'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={cn(
      "flex items-start space-x-3 max-w-4xl mx-auto",
      isUser && "flex-row-reverse space-x-reverse"
    )}>
      <Avatar className={cn(
        "w-8 h-8 shrink-0",
        isUser ? "bg-chat-user" : "bg-primary"
      )}>
        <AvatarFallback className={cn(
          isUser 
            ? "bg-chat-user text-white dark:bg-chat-user-dark" 
            : "bg-primary text-primary-foreground"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col space-y-1 min-w-0 flex-1",
        isUser && "items-end"
      )}>
        <div className={cn(
          "group relative rounded-lg px-4 py-3 max-w-[85%] break-words",
          isUser 
            ? "bg-chat-user text-white dark:bg-chat-user-dark ml-12" 
            : "bg-chat-assistant dark:bg-chat-assistant-dark mr-12"
        )}>
          {isUser ? (
            <p className="chat-message whitespace-pre-wrap">{message.message}</p>
          ) : (
            <div className="chat-message prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const code = String(children).replace(/\n$/, '')
                    
                    if (!inline && match) {
                      return (
                        <div className="relative group">
                          <SyntaxHighlighter
                            style={theme === 'dark' ? oneDark : oneLight}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md !mt-2 !mb-2"
                            {...props}
                          >
                            {code}
                          </SyntaxHighlighter>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )
                    }
                    
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-4 italic my-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.message}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Copy button for entire message */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(message.message)}
            className={cn(
              "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0",
              isUser 
                ? "left-1 text-white/70 hover:text-white hover:bg-white/10" 
                : "right-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        
        <span className={cn(
          "text-xs text-muted-foreground px-1",
          isUser && "text-right"
        )}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}) 