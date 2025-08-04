"use client"

import { useEffect } from "react"
import { useTheme } from "@/lib/theme"

export function ClientFavicon() {
  const { currentTheme } = useTheme()

  useEffect(() => {
    // Find existing favicon link or create a new one
    let link = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.head.appendChild(link)
    }

    // Update the href attribute with the current theme's favicon
    if (currentTheme.branding.favicon) {
      link.setAttribute("href", currentTheme.branding.favicon)
    }
  }, [currentTheme.branding.favicon])

  // This component doesn't render anything visible
  return null
}
