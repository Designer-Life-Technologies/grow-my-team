"use client"

import Link from "next/link"
import { UserProfile } from "@/components/auth"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useTheme } from "@/lib/theme"

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

        <div className="space-y-4 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Theme Information
          </h2>
          <div className="space-y-2 text-[var(--color-text-secondary)]">
            <p>
              <strong>Current Theme:</strong> {currentTheme.id}
            </p>
            <p>
              <strong>Company:</strong> {currentTheme.branding.companyName}
            </p>
            <p>
              <strong>Mode:</strong> {isDark ? "Dark" : "Light"}
            </p>
          </div>
        </div>

        {/* User Profile Component */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
            User Profile Example
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">
            This component demonstrates secure access token handling with
            Next-Auth. The access token is only available server-side in API
            routes and server actions.
          </p>
          <UserProfile />
        </div>
      </div>
    </div>
  )
}
