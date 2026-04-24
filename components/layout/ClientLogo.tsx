"use client"

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
  className,
  alt,
  priority = false,
  showCompanyName = false,
}: ClientLogoProps) {
  const { currentTheme, isDark, mounted } = useTheme()

  // Scale-based sizing: height = 50px * scale
  const logoScale = currentTheme.branding.logo?.scale || 1.0
  const logoHeight = Math.round(50 * logoScale)

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
          width: showCompanyName ? "auto" : undefined,
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
      <img
        src={logoSrc}
        alt={logoAlt}
        style={{ height: `${logoHeight}px`, width: "auto" }}
      />
      {showCompanyName && (
        <span className="text-lg font-semibold text-foreground">
          {currentTheme.branding.companyName}
        </span>
      )}
    </div>
  )
}
