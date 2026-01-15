"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getTheme, getThemeFromDomain } from "@/lib/theme/config"
import type { Theme, ThemeContextType, ThemeMode } from "@/lib/theme/types"
import { applyThemeToDocument, getSystemTheme } from "@/lib/theme/utils"

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() =>
    getTheme(defaultTheme),
  )
  const [mode, setMode] = useState<ThemeMode>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from various sources
  useEffect(() => {
    if (typeof window === "undefined") return

    // Try to get theme from localStorage first
    const savedThemeId = localStorage.getItem("theme-id")
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode

    // If no saved theme, try to detect from domain
    let themeId = savedThemeId
    if (!themeId) {
      themeId = getThemeFromDomain(window.location.hostname)
    }

    // Set initial theme and mode
    setCurrentTheme(getTheme(themeId || defaultTheme))
    setMode(savedMode || "system")
    setMounted(true)
  }, [defaultTheme])

  // Handle system theme changes and mode updates
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateTheme = () => {
      const systemIsDark = getSystemTheme() === "dark"
      const shouldBeDark = mode === "system" ? systemIsDark : mode === "dark"

      setIsDark(shouldBeDark)
      applyThemeToDocument(currentTheme, shouldBeDark)

      // Update data-theme attribute on html element
      document.documentElement.setAttribute(
        "data-theme",
        shouldBeDark ? "dark" : "light",
      )
    }

    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (mode === "system") {
        updateTheme()
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [currentTheme, mode])

  const setTheme = (themeId: string) => {
    const newTheme = getTheme(themeId)
    setCurrentTheme(newTheme)
    localStorage.setItem("theme-id", themeId)
  }

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem("theme-mode", newMode)
  }

  const value: ThemeContextType = {
    currentTheme,
    mode,
    setTheme,
    setMode: setThemeMode,
    isDark,
    mounted,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
