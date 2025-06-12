'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, LogOut, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Conversation {
  id: string
  title: string
  updatedAt: string
  messageCount: number
  lastMessage: string
}

interface ChatSidebarProps {
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
}

export function ChatSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewChat
}: ChatSidebarProps) {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    onNewChat()
    await fetchConversations() // Refresh conversations list
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            AI Assistant
          </h1>
          <Button
            onClick={handleNewChat}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Chat
          </Button>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
          <Avatar className="w-8 h-8">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback>
              {session?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email || ''}
            </p>
          </div>
          <Button
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No conversations yet
              </p>
              <p className="text-gray-400 text-xs">
                Start a new chat to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors
                    ${selectedConversationId === conversation.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {conversation.title || 'New Chat'}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {conversation.messageCount} messages
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 