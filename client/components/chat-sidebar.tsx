'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  MapPin
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

  const getPlanBadge = (planId?: string) => {
    if (!planId) return null
    
    const planColors = {
      'starter': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'unlimited': 'bg-blue-100 text-blue-700 border-blue-200',
      'saas_pro': 'bg-purple-100 text-purple-700 border-purple-200',
      'agency': 'bg-orange-100 text-orange-700 border-orange-200'
    }
    
    const planNames = {
      'starter': 'Starter',
      'unlimited': 'Unlimited',
      'saas_pro': 'SaaS Pro',
      'agency': 'Agency Pro'
    }
    
    const planId_lower = planId.toLowerCase()
    const colorClass = planColors[planId_lower as keyof typeof planColors] || 'bg-gray-100 text-gray-700 border-gray-200'
    const planName = planNames[planId_lower as keyof typeof planNames] || planId
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        <Crown className="w-3 h-3 mr-1" />
        {planName}
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col shadow-xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            AI Assistant
          </motion.h1>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleNewChat}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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

        {/* User Info Card */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div 
            className={`
              p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 
              border border-slate-200/50 dark:border-slate-600/50 cursor-pointer transition-all duration-300
              hover:shadow-lg hover:scale-[1.02]
              ${userMenuOpen ? 'shadow-lg scale-[1.02]' : ''}
            `}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-white/50 shadow-lg">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  {session?.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  {session?.planId && getPlanBadge(session.planId)}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
                  {session?.locationId && (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">ID: {session.locationId.slice(-8)}</span>
                    </>
                  )}
                </div>
                
                {session?.companyId && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-500 mt-1">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">Company: {session.companyId.slice(-8)}</span>
                  </div>
                )}
              </div>
              
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

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
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      onClick={() => signOut()}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No conversations yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Start a new chat to begin your AI-powered CRM journey
              </p>
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start chatting
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation, index) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-all duration-300 group
                    ${selectedConversationId === conversation.id
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 shadow-lg'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-2 border-transparent'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {conversation.title || 'New Chat'}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {conversation.messageCount} messages
                    </span>
                    {selectedConversationId === conversation.id && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-purple-500" fill="currentColor" />
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Active</span>
                      </div>
                    )}
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