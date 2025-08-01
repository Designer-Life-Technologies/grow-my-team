"use client"

import React from "react"
import { useTheme } from "@/lib/theme/ThemeProvider"

export function ThemeToggle() {
  const { mode, setMode, isDark } = useTheme()

  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark")
    } else if (mode === "dark") {
      setMode("system")
    } else {
      setMode("light")
    }
  }

  const getIcon = () => {
    if (mode === "light") return "☀️"
    if (mode === "dark") return "🌙"
    return isDark ? "🌙" : "☀️" // System mode shows current state
  }

  const getLabel = () => {
    if (mode === "light") return "Light mode"
    if (mode === "dark") return "Dark mode"
    return `System mode (${isDark ? "dark" : "light"})`
  }

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
      title={getLabel()}
      type="button"
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-medium capitalize">{mode}</span>
    </button>
  )
}

export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme()

  // This would typically be populated from your theme config
  const availableThemes = [
    { id: "default", name: "Grow My Team" },
    { id: "client-acme", name: "ACME Corporation" },
  ]

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
