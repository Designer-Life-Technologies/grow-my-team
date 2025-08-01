"use client"

import { useTheme } from "@/lib/theme"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import Link from "next/link"

export default function Home() {
  const { currentTheme, isDark } = useTheme()
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Welcome to {currentTheme.branding.companyName}
          </h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/theme-showcase" 
              className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              Theme Showcase
            </Link>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="space-y-4 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Theme Information</h2>
          <div className="space-y-2 text-[var(--color-text-secondary)]">
            <p><strong>Current Theme:</strong> {currentTheme.id}</p>
            <p><strong>Company:</strong> {currentTheme.branding.companyName}</p>
            <p><strong>Mode:</strong> {isDark ? 'Dark' : 'Light'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
