/**
 * Public Candidate Layout
 *
 * This layout wraps all public-facing candidate routes at the root level.
 * It provides a minimal, marketing-focused UI without authentication requirements.
 *
 * Purpose:
 * - Provides public access to job positions and candidate-facing pages
 * - Displays a simple header with logo and applicant user menu
 * - Uses sticky footer layout to keep footer at bottom of viewport
 * - Maintains consistent branding through theme-aware logo
 * - No authentication required (unlike employer routes)
 *
 * Routes Using This Layout:
 * - / - Positions listing (root/home page)
 * - /position/[id] - Individual job position details
 * - /position/[id]/apply - Job application page
 * - ... other public candidate pages
 *
 * Key Features:
 * - Theme-aware: Inherits ThemeProvider from root layout
 * - Responsive: Mobile-first design with container constraints
 * - Minimal UI: No sidebar or complex navigation (unlike dashboard)
 * - Sticky footer: Uses flexbox to keep footer at bottom
 * - Applicant session: Shows user avatar/menu when applicant is logged in
 *
 * Design Decisions:
 * - Intentionally differs from authenticated app layouts (no sidebar/app chrome)
 * - Focuses on candidate experience and job discovery
 * - Uses semantic theme colors for consistent branding
 * - Header height (h-14) optimized for mobile and desktop
 * - ApplicantUserMenu in header provides consistent session UI across all pages
 *
 * Note: This layout is nested inside the root `app/layout.tsx` which provides
 * global providers (ThemeProvider, AuthProvider, fonts, etc.).
 */
import type { Metadata } from "next"
import "@/app/globals.css"
import type React from "react"
import { ApplicantUserMenu } from "@/components/candidate"
import { ClientLogo } from "@/components/layout"
export const metadata: Metadata = {
  title: "Candidate | Grow My Team",
}

export default function CandidatePublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ClientLogo size="sm" priority />
            <span className="text-muted-foreground">· Candidate</span>
          </div>
          <nav className="flex items-center">
            <ApplicantUserMenu />
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-10">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grow My Team
      </footer>
    </div>
  )
}
