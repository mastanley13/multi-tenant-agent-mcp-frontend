"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "system", icon: Monitor, label: "System" }
  ]

  const currentThemeIndex = themes.findIndex(t => t.name === theme)
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(nextTheme.name)}
        className="relative h-10 w-10 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 group"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {theme === "light" && (
              <Sun className="h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
            )}
            {theme === "dark" && (
              <Moon className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            )}
            {theme === "system" && (
              <Monitor className="h-4 w-4 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {theme === "light" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-200/20 to-yellow-200/20" />
          )}
          {theme === "dark" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-200/20 to-blue-200/20" />
          )}
          {theme === "system" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-200/20 to-green-200/20" />
          )}
        </div>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          Switch to {nextTheme.label}
        </div>
      </div>
    </div>
  )
}

// Alternative compact version for mobile/smaller spaces
export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      <motion.span
        className="theme-toggle-thumb"
        animate={{ x: isDark ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center"
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="w-2.5 h-2.5 text-slate-600" />
          ) : (
            <Sun className="w-2.5 h-2.5 text-orange-500" />
          )}
        </motion.div>
      </motion.span>
    </button>
  )
}