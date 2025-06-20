'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Session } from 'next-auth'
import { 
  Crown, 
  MapPin, 
  Building2, 
  Sparkles,
  Clock,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface UserProfileCardProps {
  session: Session | null
  variant?: 'compact' | 'full'
  showStats?: boolean
}

export function UserProfileCard({ session, variant = 'compact', showStats = false }: UserProfileCardProps) {
  if (!session?.user) return null

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const getPlanColor = (planId?: string) => {
    if (!planId) return 'bg-slate-100 text-slate-700'
    
    const colors = {
      'starter': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'unlimited': 'bg-blue-100 text-blue-700 border-blue-200', 
      'saas_pro': 'bg-purple-100 text-purple-700 border-purple-200',
      'agency': 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border-orange-200'
    }
    
    return colors[planId.toLowerCase() as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const getPlanName = (planId?: string) => {
    if (!planId) return 'Free'
    
    const names = {
      'starter': 'Starter',
      'unlimited': 'Unlimited',
      'saas_pro': 'SaaS Pro', 
      'agency': 'Agency Pro'
    }
    
    return names[planId.toLowerCase() as keyof typeof names] || planId.toUpperCase()
  }

  const userName = session.user.name?.split(' ')[0] || 'User'
  const timeOfDay = getTimeOfDay()
  const planColor = getPlanColor(session.planId)
  const planName = getPlanName(session.planId)

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg"
      >
        <div className="relative">
          <Avatar className="w-12 h-12 ring-2 ring-white/50 shadow-lg">
            <AvatarImage src={session.user.image || ''} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-lg">
              {userName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              Good {timeOfDay}, {userName}!
            </h3>
            {session.planId && (
              <Badge className={`text-xs ${planColor} border`}>
                <Crown className="w-3 h-3 mr-1" />
                {planName}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
            {session.locationId && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>ID: {session.locationId.slice(-8)}</span>
              </div>
            )}
            {session.companyId && (
              <div className="flex items-center space-x-1">
                <Building2 className="w-3 h-3" />
                <span>Company</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-1" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-4 ring-white/50 shadow-xl">
              <AvatarImage src={session.user.image || ''} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white font-bold text-2xl">
                {userName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white dark:border-slate-800 shadow-lg">
              <div className="w-full h-full bg-emerald-400 rounded-full animate-ping" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Good {timeOfDay}, {userName}!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Welcome back to your dashboard</p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      {/* Plan & Location Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {session.planId && (
          <div className={`p-4 rounded-xl ${planColor} border-2`}>
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Current Plan</span>
            </div>
            <p className="text-2xl font-bold">{planName}</p>
            <p className="text-sm opacity-75">Active subscription</p>
          </div>
        )}
        
        {session.locationId && (
          <div className="p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-xl border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Location</span>
            </div>
            <p className="text-xl font-bold">ID: {session.locationId.slice(-8)}</p>
            <p className="text-sm opacity-75">GoHighLevel Location</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">94%</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Performance</p>
          </div>
          
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">This Week</p>
          </div>
          
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">4.9</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Rating</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}