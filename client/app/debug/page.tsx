'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState(null)
  const [conversationsError, setConversationsError] = useState(null)

  useEffect(() => {
    if (session) {
      // Test the conversations API
      fetch('/api/conversations')
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setConversationsError(data.error)
          } else {
            setConversations(data)
          }
        })
        .catch(err => setConversationsError(err.message))
    }
  }, [session])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session Data</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Conversations API Test</h2>
          {conversationsError ? (
            <p className="text-red-600"><strong>Error:</strong> {conversationsError}</p>
          ) : conversations ? (
            <pre className="text-sm overflow-auto">
              {JSON.stringify(conversations, null, 2)}
            </pre>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Browser Storage</h2>
          <div className="text-sm">
            <p><strong>NextAuth Session Token:</strong></p>
            <p className="break-all">{typeof window !== 'undefined' ? localStorage.getItem('next-auth.session-token') || 'Not found' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 