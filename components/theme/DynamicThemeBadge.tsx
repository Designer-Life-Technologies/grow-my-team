"use client"

import { Badge } from "@/components/ui/badge"
import type { ThemeSource } from "@/lib/theme/resolver"

interface DynamicThemeBadgeProps {
  themeId: string
  source: ThemeSource
}

export function DynamicThemeBadge({ themeId, source }: DynamicThemeBadgeProps) {
  // Only show for dynamic sources
  if (!["query", "subdomain", "custom-domain", "database"].includes(source)) {
    return null
  }

  const sourceLabels: Record<ThemeSource, string> = {
    query: "Preview",
    subdomain: "Subdomain",
    "custom-domain": "Custom Domain",
    database: "Database",
  }

  const label = sourceLabels[source]
  if (!label) return null

  return (
    <Badge
      variant="outline"
      className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-primary/50 text-xs"
    >
      {label}: {themeId}
    </Badge>
  )
}
