import { z } from "zod"

/**
 * Color palette schema
 */
const colorPaletteSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  secondary: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#1e40af"),
  accent: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#60a5fa"),
  background: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#ffffff"),
  surface: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#f8fafc"),
  text: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#1e293b"),
  textSecondary: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#64748b"),
  border: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#e2e8f0"),
  success: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#22c55e"),
  warning: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#f59e0b"),
  error: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .default("#ef4444"),
})

/**
 * Colors schema
 */
const colorsSchema = z.object({
  light: colorPaletteSchema,
  dark: colorPaletteSchema,
})

/**
 * Create theme request schema
 */
export const createThemeSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  name: z.string().min(1).max(100),
  companyName: z.string().min(1).max(100),
  customDomain: z.string().url().optional(),
  website: z.string().url().optional(),
  colors: colorsSchema.optional(),
  logoBase64: z
    .string()
    .regex(/^data:image\/[a-z-]+;base64,/, "Invalid base64 image")
    .optional(),
  faviconBase64: z
    .string()
    .regex(/^data:image\/[a-z-]+;base64,/, "Invalid base64 image")
    .optional(),
  screenshotBase64: z
    .string()
    .regex(/^data:image\/[a-z-]+;base64,/, "Invalid base64 image")
    .optional(),
  logoScale: z.number().min(0.5).max(2.0).optional(),
  supportsDarkMode: z.boolean().optional(),
})

/**
 * Update theme request schema
 */
export const updateThemeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  companyName: z.string().min(1).max(100).optional(),
  customDomain: z.string().url().optional(),
  website: z.string().url().optional(),
  colors: colorsSchema.optional(),
  logoBase64: z
    .string()
    .regex(/^data:image\/[a-z-]+;base64,/, "Invalid base64 image")
    .optional(),
  faviconBase64: z
    .string()
    .regex(/^data:image\/[a-z-]+;base64,/, "Invalid base64 image")
    .optional(),
  logoScale: z.number().min(0.5).max(2.0).optional(),
  supportsDarkMode: z.boolean().optional(),
})

export type CreateThemeRequest = z.infer<typeof createThemeSchema>
export type UpdateThemeRequest = z.infer<typeof updateThemeSchema>
