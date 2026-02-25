"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getTheme, getThemeFromDomain } from "@/lib/theme/config"
import type { Theme, ThemeContextType, ThemeMode } from "@/lib/theme/types"
import { applyThemeToDocument, getSystemTheme } from "@/lib/theme/utils"

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const enforceSupportedMode = (
  desiredMode: ThemeMode | null | undefined,
  theme: Theme,
): ThemeMode => {
  if (theme.supportsDarkMode === false) {
    return "light"
  }
  return desiredMode || "system"
}

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
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null

    // If no saved theme, try to detect from domain
    let themeId = savedThemeId
    if (!themeId) {
      themeId = getThemeFromDomain(window.location.hostname)
    }

    // Set initial theme and mode
    const nextTheme = getTheme(themeId || defaultTheme)
    setCurrentTheme(nextTheme)
    setMode(enforceSupportedMode(savedMode, nextTheme))
    setMounted(true)
  }, [defaultTheme])

  // Handle system theme changes and mode updates
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateTheme = () => {
      const supportsDarkMode = currentTheme.supportsDarkMode !== false
      const effectiveMode = supportsDarkMode ? mode : "light"
      const systemIsDark = getSystemTheme() === "dark"
      const shouldBeDark =
        supportsDarkMode &&
        (effectiveMode === "system" ? systemIsDark : effectiveMode === "dark")

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

    const nextMode = enforceSupportedMode(mode, newTheme)
    setMode(nextMode)
    localStorage.setItem("theme-mode", nextMode)
  }

  const setThemeMode = (newMode: ThemeMode) => {
    const nextMode = enforceSupportedMode(newMode, currentTheme)
    setMode(nextMode)
    localStorage.setItem("theme-mode", nextMode)
  }

  const supportsDarkMode = currentTheme.supportsDarkMode !== false

  const value: ThemeContextType = {
    currentTheme,
    mode,
    setTheme,
    setMode: setThemeMode,
    isDark,
    mounted,
    supportsDarkMode,
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
