'use client'

import { ChatInterface } from '@/components/chat-interface'

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <ChatInterface />
    </main>
  )
} 