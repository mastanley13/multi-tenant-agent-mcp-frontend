'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
  Zap,
  Cpu
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
      'starter': 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      'unlimited': 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
      'saas_pro': 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      'agency': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600'
    }
    
    const planNames = {
      'starter': 'Starter',
      'unlimited': 'Unlimited',
      'saas_pro': 'SaaS Pro',
      'agency': 'Agency Pro'
    }
    
    const planId_lower = planId.toLowerCase()
    const colorClass = planColors[planId_lower as keyof typeof planColors] || 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600'
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
      className="h-full w-full overflow-hidden glass-intense backdrop-blur-xl border-r border-slate-300/30 dark:border-slate-700/30 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-300/30 dark:border-slate-700/30 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center space-x-2 min-w-0 flex-1"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent truncate">
              AI Assistant
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <ThemeToggle />
            <Button
              onClick={handleNewChat}
              size="sm"
              className="btn-gradient-primary hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            
            {isMobile && onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
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
          className="relative min-w-0"
        >
          <div 
            className={`
              p-4 rounded-xl glass border border-slate-300/30 dark:border-slate-700/30 cursor-pointer transition-all duration-300 min-w-0 overflow-hidden
              hover:shadow-medium hover:scale-[1.02] hover:border-cyan-300/50 dark:hover:border-cyan-700/50
              ${userMenuOpen ? 'shadow-medium scale-[1.02] border-cyan-300/50 dark:border-cyan-700/50' : ''}
            `}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <Avatar className="w-12 h-12 ring-2 ring-cyan-200/50 dark:ring-cyan-800/50 shadow-lg flex-shrink-0">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                  {session?.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center space-x-2 mb-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0">
                    {session?.user?.name || 'User'}
                  </p>
                  {session?.planId && (
                    <div className="flex-shrink-0">
                      {getPlanBadge(session.planId)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 min-w-0">
                  {session?.locationId && (
                    <>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate min-w-0">ID: {session.locationId.slice(-8)}</span>
                    </>
                  )}
                </div>
                
                {session?.companyId && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-500 mt-1 min-w-0">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate min-w-0">Company: {session.companyId.slice(-8)}</span>
                  </div>
                )}
              </div>
              
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
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
                className="absolute top-full left-0 right-0 mt-2 z-10 min-w-0"
              >
                <div className="glass-intense rounded-xl shadow-2xl border border-slate-300/30 dark:border-slate-700/30 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 min-w-0"
                    >
                      <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Settings</span>
                    </Button>
                    <Button
                      onClick={() => signOut()}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-0"
                    >
                      <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Sign out</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 custom-scrollbar min-w-0">
        <div className="p-4 min-w-0">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="text-sm ml-2">Loading conversations...</span>
              </div>
            </motion.div>
          ) : conversations.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No conversations yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Start a new chat to unleash the power of AI
              </p>
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="border-cyan-300 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900/20 transition-all hover:scale-105"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start chatting
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-2 min-w-0">
              {conversations.map((conversation, index) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-all duration-300 group min-w-0 overflow-hidden
                    ${selectedConversationId === conversation.id
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-2 border-cyan-300 dark:border-cyan-700 shadow-lg neon-border-cyan'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors min-w-0 flex-1 pr-2">
                      {conversation.title || 'New Chat'}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors min-w-0">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex justify-between items-center min-w-0">
                    <span className="text-xs text-slate-400 dark:text-slate-500 truncate min-w-0 flex-1">
                      {conversation.messageCount} messages
                    </span>
                    {selectedConversationId === conversation.id && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-cyan-500 pulse-glow-cyan" fill="currentColor" />
                        <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Active</span>
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