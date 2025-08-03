"use client"

import Link from "next/link"
import { SignOutButton } from "@/components/auth"
import { ThemeModeToggle } from "@/components/theme"
import { useTheme } from "@/lib/theme"

export default function Home() {
  const { currentTheme } = useTheme()
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Welcome to {currentTheme.branding.companyName}
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dev/theme-showcase"
              className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              Theme Showcase
            </Link>
            <ThemeModeToggle />
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
