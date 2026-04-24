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
}: ClientLogoProps) {
  const { currentTheme, isDark, mounted } = useTheme()

  // Priority-based sizing: height takes priority over width
  // Default to 50px height (slightly smaller than 56px app bar)
  const themeLogoHeight = currentTheme.branding.logo?.height
  const themeLogoWidth = currentTheme.branding.logo?.width

  let logoHeight: number
  let logoWidth: number | undefined

  if (themeLogoHeight) {
    // Use height, width auto-calculates
    logoHeight = themeLogoHeight
    logoWidth = undefined
  } else if (themeLogoWidth) {
    // Use width, height defaults to 50
    logoWidth = themeLogoWidth
    logoHeight = 50
  } else {
    // Use default height 50px, width auto-calculates
    logoHeight = 50
    logoWidth = undefined
  }

  // Override with props if provided
  if (height) {
    logoHeight = height
    logoWidth = undefined
  } else if (width) {
    logoWidth = width
    logoHeight = 50
  }

  // Select appropriate logo based on theme mode
  const logoSrc = currentTheme.branding.logo
    ? isDark
      ? currentTheme.branding.logo.dark
      : currentTheme.branding.logo.light
    : null

  // Use company name as fallback alt text
  const logoAlt = alt || `${currentTheme.branding.companyName} logo`

  // Prevent hydration flash by returning an invisible placeholder of the same dimensions
  if (!mounted) {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        style={{
          width: showCompanyName ? "auto" : logoWidth,
          height: logoHeight,
        }}
      />
    )
  }

  // If no logo is defined, show only the company name
  if (!logoSrc) {
    return (
      <div
        className={cn(
          "flex items-center animate-in fade-in duration-500",
          className,
        )}
      >
        <span className="text-lg font-semibold text-foreground">
          {currentTheme.branding.companyName}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 animate-in fade-in duration-500",
        className,
      )}
    >
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
