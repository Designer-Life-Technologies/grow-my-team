"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getThemeFromDomain } from "@/lib/theme/config"
import type { ThemeSource } from "@/lib/theme/resolver"
import type { Theme, ThemeContextType, ThemeMode } from "@/lib/theme/types"
import { applyThemeToDocument, getSystemTheme } from "@/lib/theme/utils"

interface ThemeContextValue extends ThemeContextType {
  /** Source of the current theme (for preview badge) */
  themeSource: ThemeSource
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

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
  /** Initial theme from server (database or file-based) */
  initialTheme?: Theme
  /** Source of the initial theme */
  initialSource?: ThemeSource
}

export function ThemeProvider({
  children,
  initialTheme,
  initialSource = "database",
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (initialTheme) return initialTheme
    // Return minimal default theme as fallback
    return {
      id: "default",
      name: "Default",
      colors: {
        light: {
          primary: "#3b82f6",
          secondary: "#1e40af",
          accent: "#60a5fa",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#1e293b",
          textSecondary: "#64748b",
          border: "#e2e8f0",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
        dark: {
          primary: "#60a5fa",
          secondary: "#3b82f6",
          accent: "#93c5fd",
          background: "#0f172a",
          surface: "#1e293b",
          text: "#f1f5f9",
          textSecondary: "#94a3b8",
          border: "#334155",
          success: "#4ade80",
          warning: "#fbbf24",
          error: "#f87171",
        },
      },
      supportsDarkMode: true,
      branding: {
        companyName: "Grow My Team",
      },
    }
  })
  const [themeSource, setThemeSource] = useState<ThemeSource>(initialSource)
  const [mode, setMode] = useState<ThemeMode>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from various sources
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedThemeId = localStorage.getItem("theme-id")
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null

    // Priority 1: Query parameter (?theme=xxx)
    const urlParams = new URLSearchParams(window.location.search)
    const queryThemeId = urlParams.get("theme")

    // Priority 2: Subdomain/host mapping
    const hostThemeId = getThemeFromDomain(window.location.hostname)

    const hostIsCustom = Boolean(hostThemeId && hostThemeId !== "default")

    let resolvedThemeId: string | undefined
    let resolvedSource: ThemeSource = "database"

    if (queryThemeId) {
      // Query param takes highest priority for preview
      resolvedThemeId = queryThemeId
      resolvedSource = "query"
      localStorage.setItem("theme-id", queryThemeId)
    } else if (hostIsCustom) {
      // For branded hosts we always enforce the mapped theme
      resolvedThemeId = hostThemeId
      resolvedSource = "custom-domain"
      localStorage.setItem("theme-id", hostThemeId)
    } else if (savedThemeId) {
      // Otherwise honor the previously selected theme
      resolvedThemeId = savedThemeId
      resolvedSource = initialSource
    } else {
      // Final fallback: whatever the host resolved to (likely "default")
      resolvedThemeId = hostThemeId || "default"
      if (resolvedThemeId) {
        localStorage.setItem("theme-id", resolvedThemeId)
      }
    }

    // Check if we need to fetch from database
    const loadTheme = async () => {
      // If we have a server-provided theme and no query override, use it
      if (
        initialTheme &&
        !queryThemeId &&
        resolvedThemeId === initialTheme.id
      ) {
        setCurrentTheme(initialTheme)
        setThemeSource(resolvedSource)
        setMode(enforceSupportedMode(savedMode, initialTheme))
        setMounted(true)
        return
      }

      // Fetch from API
      try {
        const response = await fetch(`/api/themes/${resolvedThemeId}`)
        if (response.ok) {
          const theme = await response.json()
          if (!theme.error) {
            setCurrentTheme(theme)
            setThemeSource(resolvedSource === "query" ? "query" : "database")
            setMode(enforceSupportedMode(savedMode, theme))
            setMounted(true)
            return
          }
        }
      } catch (error) {
        console.error("Failed to fetch theme from API:", error)
      }

      // If theme not found, use default theme
      console.warn(`Theme "${resolvedThemeId}" not found, using default`)
      try {
        const response = await fetch("/api/themes/default")
        if (response.ok) {
          const theme = await response.json()
          if (!theme.error) {
            setCurrentTheme(theme)
            setThemeSource("database")
            setMode(enforceSupportedMode(savedMode, theme))
            setMounted(true)
            return
          }
        }
      } catch (error) {
        console.error("Failed to fetch default theme:", error)
      }

      // Ultimate fallback - minimal theme to prevent crash
      setCurrentTheme({
        id: "default",
        name: "Default",
        colors: {
          light: {
            primary: "#3b82f6",
            secondary: "#1e40af",
            accent: "#60a5fa",
            background: "#ffffff",
            surface: "#f8fafc",
            text: "#1e293b",
            textSecondary: "#64748b",
            border: "#e2e8f0",
            success: "#22c55e",
            warning: "#f59e0b",
            error: "#ef4444",
          },
          dark: {
            primary: "#60a5fa",
            secondary: "#3b82f6",
            accent: "#93c5fd",
            background: "#0f172a",
            surface: "#1e293b",
            text: "#f1f5f9",
            textSecondary: "#94a3b8",
            border: "#334155",
            success: "#4ade80",
            warning: "#fbbf24",
            error: "#f87171",
          },
        },
        supportsDarkMode: true,
        branding: {
          companyName: "Grow My Team",
        },
      })
      setThemeSource("database")
      setMode(
        enforceSupportedMode(savedMode, {
          id: "default",
          name: "Default",
          colors: {
            light: {
              primary: "#3b82f6",
              secondary: "#1e40af",
              accent: "#60a5fa",
              background: "#ffffff",
              surface: "#f8fafc",
              text: "#1e293b",
              textSecondary: "#64748b",
              border: "#e2e8f0",
              success: "#22c55e",
              warning: "#f59e0b",
              error: "#ef4444",
            },
            dark: {
              primary: "#60a5fa",
              secondary: "#3b82f6",
              accent: "#93c5fd",
              background: "#0f172a",
              surface: "#1e293b",
              text: "#f1f5f9",
              textSecondary: "#94a3b8",
              border: "#334155",
              success: "#4ade80",
              warning: "#fbbf24",
              error: "#f87171",
            },
          },
          supportsDarkMode: true,
          branding: {
            companyName: "Grow My Team",
          },
        }),
      )
      setMounted(true)
    }

    loadTheme()
  }, [initialTheme, initialSource])

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

  const setTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/themes/${themeId}`)
      if (response.ok) {
        const theme = await response.json()
        if (!theme.error) {
          setCurrentTheme(theme)
          setThemeSource("database")
          localStorage.setItem("theme-id", themeId)

          const nextMode = enforceSupportedMode(mode, theme)
          setMode(nextMode)
          localStorage.setItem("theme-mode", nextMode)
          return
        }
      }
    } catch (error) {
      console.error("Failed to fetch theme:", error)
    }
  }

  const setThemeMode = (newMode: ThemeMode) => {
    const nextMode = enforceSupportedMode(newMode, currentTheme)
    setMode(nextMode)
    localStorage.setItem("theme-mode", nextMode)
  }

  const supportsDarkMode = currentTheme.supportsDarkMode !== false

  const value: ThemeContextValue = {
    currentTheme,
    mode,
    setTheme,
    setMode: setThemeMode,
    isDark,
    mounted,
    supportsDarkMode,
    themeSource,
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
