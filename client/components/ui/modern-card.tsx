import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ModernCardProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'gradient' | 'solid'
  hover?: boolean
  glow?: boolean
}

export function ModernCard({ 
  children, 
  className, 
  variant = 'glass',
  hover = true,
  glow = false 
}: ModernCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300"
  
  const variants = {
    glass: "bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl border border-white/20 dark:border-slate-700/30",
    gradient: "bg-gradient-to-br from-white/20 to-white/5 dark:from-slate-800/20 dark:to-slate-900/5 backdrop-blur-xl border border-white/10 dark:border-slate-700/20",
    solid: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }
  
  const hoverClasses = hover ? "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1" : ""
  const glowClasses = glow ? "shadow-[0_0_20px_rgba(139,92,246,0.3)] dark:shadow-[0_0_20px_rgba(139,92,246,0.2)]" : "shadow-lg"
  
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={cn(
        baseClasses,
        variants[variant],
        hoverClasses,
        glowClasses,
        className
      )}
    >
      {children}
    </motion.div>
  )
}