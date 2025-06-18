'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent')
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      setLastChecked(new Date())
      
      if (navigator.onLine) {
        // Simulate connection quality check
        const quality = Math.random()
        if (quality > 0.8) setConnectionQuality('excellent')
        else if (quality > 0.6) setConnectionQuality('good')
        else setConnectionQuality('poor')
      } else {
        setConnectionQuality('offline')
      }
    }

    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        setIsOnline(response.ok)
        setLastChecked(new Date())
      } catch {
        setIsOnline(false)
        setConnectionQuality('offline')
        setLastChecked(new Date())
      }
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-emerald-500'
      case 'good': return 'text-blue-500'
      case 'poor': return 'text-orange-500'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBgColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
      case 'good': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'poor': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'offline': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getStatusText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'poor': return 'Poor'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = () => {
    if (!isOnline || connectionQuality === 'offline') {
      return <WifiOff className="w-4 h-4" />
    }
    
    switch (connectionQuality) {
      case 'excellent': return <CheckCircle2 className="w-4 h-4" />
      case 'good': return <Wifi className="w-4 h-4" />
      case 'poor': return <AlertCircle className="w-4 h-4" />
      default: return <Wifi className="w-4 h-4" />
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${getStatusBgColor()} ${className}`}
      >
        <motion.div
          animate={{
            scale: connectionQuality === 'excellent' ? [1, 1.2, 1] : 1,
            rotate: connectionQuality === 'offline' ? [0, -10, 10, 0] : 0
          }}
          transition={{
            duration: connectionQuality === 'excellent' ? 2 : 0.5,
            repeat: connectionQuality === 'excellent' ? Infinity : 0,
            repeatType: 'loop'
          }}
          className={getStatusColor()}
        >
          {getStatusIcon()}
        </motion.div>
        
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          
          {connectionQuality !== 'offline' && (
            <motion.div
              className={`w-2 h-2 rounded-full ${connectionQuality === 'excellent' ? 'bg-emerald-500' : connectionQuality === 'good' ? 'bg-blue-500' : 'bg-orange-500'}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop'
              }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 