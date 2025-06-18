'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'
import { useSession } from 'next-auth/react'

export function ChatInterface() {
  const { data: session } = useSession()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className={`
              ${isMobile ? 'fixed' : 'relative'} 
              z-50 w-80 h-full
              ${isMobile ? 'lg:relative lg:z-auto' : ''}
            `}
          >
            <ChatSidebar
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onNewChat={() => setSelectedConversationId(null)}
              onClose={() => setSidebarOpen(false)}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <motion.div 
        layout
        className="flex-1 flex flex-col min-w-0"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ChatWindow
          conversationId={selectedConversationId}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          session={session}
        />
      </motion.div>
    </div>
  )
} 