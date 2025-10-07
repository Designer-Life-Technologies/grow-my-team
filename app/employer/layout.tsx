import type React from "react"
import { AppSidebar } from "@/components/dashboard"
import { SiteHeader } from "@/components/layout"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/**
 * User Layout Component
 *
 * This layout wraps all authenticated user routes (dashboard, settings, etc.)
 * with the application sidebar and header.
 *
 * Note: This layout is nested inside the root app/layout.tsx which provides
 * ThemeProvider, AuthProvider, and other global providers.
 */
export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
