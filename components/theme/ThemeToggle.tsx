"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme"

export function ThemeModeToggle() {
  const { mode, setMode, isDark, supportsDarkMode } = useTheme()

  const toggleMode = () => {
    if (!supportsDarkMode) return
    if (mode === "light") {
      setMode("dark")
    } else if (mode === "dark") {
      setMode("system")
    } else {
      setMode("light")
    }
  }

  const getIcon = () => {
    if (!supportsDarkMode) return "☀️"
    if (mode === "light") return "☀️"
    if (mode === "dark") return "🌙"
    return isDark ? "🌙" : "☀️" // System mode shows current state
  }

  const getLabel = () => {
    if (!supportsDarkMode) return "Dark mode disabled for this theme"
    if (mode === "light") return "Light mode"
    if (mode === "dark") return "Dark mode"
    return `System mode (${isDark ? "dark" : "light"})`
  }

  return (
    <button
      onClick={toggleMode}
      disabled={!supportsDarkMode}
      className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
      title={getLabel()}
      type="button"
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-medium capitalize">
        {supportsDarkMode ? mode : "light only"}
      </span>
    </button>
  )
}

export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme()
  const [availableThemes, setAvailableThemes] = useState<
    { id: string; name: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchThemes() {
      try {
        const response = await fetch("/api/themes")
        if (response.ok) {
          const data = await response.json()
          setAvailableThemes(data.themes || [])
        }
      } catch (error) {
        console.error("Failed to fetch themes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchThemes()
  }, [])

  if (loading) {
    return (
      <select
        disabled
        className="px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] opacity-50"
      >
        <option>Loading themes...</option>
      </select>
    )
  }

  return (
    <select
      value={currentTheme.id}
      onChange={(e) => setTheme(e.target.value)}
      className="px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
    >
      {availableThemes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  )
}
