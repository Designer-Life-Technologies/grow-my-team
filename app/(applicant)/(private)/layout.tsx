import type { Metadata } from "next"
import type React from "react"
import { ApplicantUserMenu } from "@/components/applicant"
import { ClientLogo } from "@/components/layout"

export const metadata: Metadata = {
  title: "Applicant | Grow My Team",
}

export default function ApplicantPrivateLayout({
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
            <span className="text-muted-foreground">· Applicant</span>
          </div>
          <nav className="flex items-center">
            <ApplicantUserMenu />
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-10">{children}</main>
      <footer className="border-t py-2 pl-4 text-left text-sm text-muted-foreground">
        © {new Date().getFullYear()} GrowMyTeam.ai
      </footer>
    </div>
  )
}
