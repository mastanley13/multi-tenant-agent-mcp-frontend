'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserProfileCard } from '@/components/ui/user-profile-card'
import { 
  Plus, 
  LogOut, 
  MessageSquare, 
  Building2, 
  Star, 
  X,
  ChevronDown,
  Settings,
  Crown,
  MapPin,
  Sparkles,
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react'
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
  onClose?: () => void
  isMobile?: boolean
}

export function ChatSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onClose,
  isMobile = false
}: ChatSidebarProps) {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
    if (isMobile && onClose) {
      onClose()
    }
    await fetchConversations()
  }

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const getUserName = () => {
    return session?.user?.name?.split(' ')[0] || 'User'
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Good {getTimeOfDay()}, {getUserName()}!
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleNewChat}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            
            {isMobile && onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced User Profile Card */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <UserProfileCard session={session} variant="compact" />
          
          {/* User Menu Dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 z-10"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden backdrop-blur-xl">
                  <div className="p-3 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Button>
                    <Button
                      onClick={() => signOut()}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">24</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Requests</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">12</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">This Week</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">95%</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Success</p>
          </div>
        </motion.div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="text-sm ml-2">Loading conversations...</span>
              </div>
            </motion.div>
          ) : conversations.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                No conversations yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                Start a new chat to begin your AI-powered CRM journey with personalized assistance
              </p>
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start chatting
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Recent Conversations
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {conversations.length}
                </span>
              </div>
              
              {conversations.map((conversation, index) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                    w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                    ${selectedConversationId === conversation.id
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 shadow-xl scale-[1.02]'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg hover:scale-[1.01]'
                    }
                  `}
                >
                  {selectedConversationId === conversation.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {conversation.title || 'New Chat'}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                        {formatDate(conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-3 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {conversation.messageCount} messages
                        </span>
                        {conversation.messageCount > 5 && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      {selectedConversationId === conversation.id && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-purple-500" fill="currentColor" />
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  )
} 