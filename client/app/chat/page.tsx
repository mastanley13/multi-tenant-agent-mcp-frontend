'use client'

import { useSession } from 'next-auth/react'
import { ChatInterface } from '@/components/chat-interface'
import { LoginScreen } from '@/components/login-screen'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ChatPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return <ChatInterface />
}