"use client"

import Image from "next/image"
import { useTheme } from "@/components/theme/ThemeProvider"
import { cn } from "@/lib/utils"

interface ClientLogoProps {
  /**
   * Width of the logo in pixels
   */
  width?: number
  /**
   * Height of the logo in pixels
   */
  height?: number
  /**
   * Additional CSS classes to apply to the logo container
   */
  className?: string
  /**
   * Alt text for the logo image
   */
  alt?: string
  /**
   * Priority loading for the image (useful for above-the-fold logos)
   */
  priority?: boolean
  /**
   * Whether to show the company name alongside the logo
   */
  showCompanyName?: boolean
  /**
   * Size variant for the logo
   */
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeVariants = {
  sm: { width: 80, height: 32 },
  md: { width: 120, height: 48 },
  lg: { width: 160, height: 64 },
  xl: { width: 200, height: 80 },
}

/**
 * ClientLogo component that displays the appropriate logo based on the current theme and mode.
 * Automatically switches between light and dark logo variants based on the theme mode.
 */
export function ClientLogo({
  width,
  height,
  className,
  alt,
  priority = false,
  showCompanyName = false,
  size = "md",
}: ClientLogoProps) {
  const { currentTheme, isDark } = useTheme()

  // Use size variant dimensions if width/height not explicitly provided
  const logoWidth = width || sizeVariants[size].width
  const logoHeight = height || sizeVariants[size].height

  // Select appropriate logo based on theme mode
  const logoSrc = currentTheme.branding.logo
    ? isDark
      ? currentTheme.branding.logo.dark
      : currentTheme.branding.logo.light
    : null

  // Use company name as fallback alt text
  const logoAlt = alt || `${currentTheme.branding.companyName} logo`

  // If no logo is defined, show only the company name
  if (!logoSrc) {
    return (
      <div className={cn("flex items-center", className)}>
        <span className="text-lg font-semibold text-foreground">
          {currentTheme.branding.companyName}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={logoWidth}
        height={logoHeight}
        priority={priority}
        className="object-contain"
      />
      {showCompanyName && (
        <span className="text-lg font-semibold text-foreground">
          {currentTheme.branding.companyName}
        </span>
      )}
    </div>
  )
}
