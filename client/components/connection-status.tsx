'use client'

import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  isConnected: boolean
  isAgentReady: boolean
  error?: string | null
}

export function ConnectionStatus({ isConnected, isAgentReady, error }: ConnectionStatusProps) {
  if (error) {
    return (
      <div className="flex items-center space-x-1 text-destructive">
        <AlertCircle className="w-3 h-3" />
        <span className="text-xs">Error</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-1 text-muted-foreground">
        <WifiOff className="w-3 h-3" />
        <span className="text-xs">Connecting...</span>
      </div>
    )
  }

  if (!isAgentReady) {
    return (
      <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Initializing agent...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
      <CheckCircle className="w-3 h-3" />
      <span className="text-xs">Ready</span>
    </div>
  )
} 