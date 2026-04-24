"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { DEFAULT_THEME } from "@/lib/theme/constants"
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
    // Return hardcoded default theme as fallback
    return DEFAULT_THEME
  })
  const [themeSource, setThemeSource] = useState<ThemeSource>(initialSource)
  const [mode, setMode] = useState<ThemeMode>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from various sources
  useEffect(() => {
    const loadTheme = async () => {
      if (typeof window === "undefined") return

      const savedThemeId = localStorage.getItem("theme-id")
      const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null

      // Priority 1: Query parameter (?theme=xxx)
      const urlParams = new URLSearchParams(window.location.search)
      const queryThemeId = urlParams.get("theme")

      let resolvedThemeId: string | undefined
      let resolvedSource: ThemeSource = "database"

      if (queryThemeId) {
        // Query param takes highest priority for preview
        resolvedThemeId = queryThemeId
        resolvedSource = "query"
        localStorage.setItem("theme-id", queryThemeId)
      } else if (savedThemeId) {
        // Use previously selected theme
        resolvedThemeId = savedThemeId
        resolvedSource = initialSource
      } else {
        // Use server-provided theme or default
        resolvedThemeId = initialTheme?.id || "default"
        if (resolvedThemeId) {
          localStorage.setItem("theme-id", resolvedThemeId)
        }
      }

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
        console.log("Loaded initial theme:", initialTheme)
        return
      }

      // Fetch from API
      try {
        // Don't fetch from API for default theme - use hardcoded
        if (resolvedThemeId === "default") {
          setCurrentTheme(DEFAULT_THEME)
          setThemeSource(resolvedSource === "query" ? "query" : "database")
          setMode(enforceSupportedMode(savedMode, DEFAULT_THEME))
          setMounted(true)
          console.log(
            "[ThemeProvider] ✓ Loaded hardcoded default theme (hardcoded fallback)",
          )
          return
        }

        console.log(
          `[ThemeProvider] Fetching theme from API: ${resolvedThemeId}`,
        )
        const response = await fetch(`/api/themes/${resolvedThemeId}`)
        if (response.ok) {
          const theme = await response.json()
          console.log("[ThemeProvider] API response:", theme)
          if (!theme.error) {
            setCurrentTheme(theme)
            setThemeSource(resolvedSource === "query" ? "query" : "database")
            setMode(enforceSupportedMode(savedMode, theme))
            setMounted(true)
            console.log(
              `[ThemeProvider] ✓ Loaded theme "${theme.id}" from API (source: ${resolvedSource})`,
            )
            return
          }
        }
      } catch (error) {
        console.error(
          "[ThemeProvider] ✗ Failed to fetch theme from API:",
          error,
        )
      }

      // If theme not found, use default theme and clear invalid localStorage
      console.warn(
        `[ThemeProvider] ⚠ Theme "${resolvedThemeId}" not found in API, using default`,
      )
      localStorage.removeItem("theme-id")
      try {
        console.log("[ThemeProvider] Fetching default theme from API")
        const response = await fetch("/api/themes/default")
        if (response.ok) {
          const theme = await response.json()
          console.log("[ThemeProvider] Default theme API response:", theme)
          if (!theme.error) {
            setCurrentTheme(theme)
            setThemeSource("database")
            setMode(enforceSupportedMode(savedMode, theme))
            setMounted(true)
            console.log(
              "[ThemeProvider] ✓ Loaded default theme from API (database)",
            )
            return
          }
        }
      } catch (error) {
        console.error(
          "[ThemeProvider] ✗ Failed to fetch default theme from API:",
          error,
        )
      }

      // Ultimate fallback - hardcoded default theme to prevent crash
      console.warn(
        "[ThemeProvider] ⚠ Using hardcoded default theme as ultimate fallback (hardcoded)",
      )
      setCurrentTheme(DEFAULT_THEME)
      setThemeSource("database")
      setMode(enforceSupportedMode(savedMode, DEFAULT_THEME))
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
    // Load hardcoded default theme
    if (themeId === DEFAULT_THEME.id) {
      setCurrentTheme(DEFAULT_THEME)
      setThemeSource("database")
      localStorage.setItem("theme-id", themeId)

      const nextMode = enforceSupportedMode(mode, DEFAULT_THEME)
      setMode(nextMode)
      localStorage.setItem("theme-mode", nextMode)
      return
    }

    // Fetch from API for other themes
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
