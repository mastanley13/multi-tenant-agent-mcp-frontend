'use client'

import { useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'

export function ChatInterface() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-300 ease-in-out
        lg:relative lg:block
        ${sidebarOpen ? 'block' : 'hidden'}
        lg:w-80
      `}>
        <ChatSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewChat={() => setSelectedConversationId(null)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          conversationId={selectedConversationId}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  )
} 