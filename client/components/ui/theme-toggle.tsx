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
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(nextTheme.name)}
      className="relative h-9 w-9 rounded-lg bg-background border border-border shadow-soft hover:shadow-medium transition-all duration-200 hover:bg-accent/10"
      title={`Switch to ${nextTheme.label}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {theme === "light" && (
            <Sun className="h-4 w-4 text-warning" />
          )}
          {theme === "dark" && (
            <Moon className="h-4 w-4 text-primary" />
          )}
          {theme === "system" && (
            <Monitor className="h-4 w-4 text-accent" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}

// Clean compact version for mobile/smaller spaces
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
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 bg-muted hover:bg-muted/80"
      aria-label="Toggle theme"
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform flex items-center justify-center"
        animate={{ x: isDark ? 26 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-primary" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-warning" />
        )}
      </motion.span>
    </button>
  )
}