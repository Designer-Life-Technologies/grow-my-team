import { del, put } from "@vercel/blob"

/**
 * Get environment prefix for blob paths
 * prod/ for production, dev/ for development/preview
 */
function getEnvPrefix(): string {
  return process.env.VERCEL_ENV === "production" ? "prod" : "dev"
}

/**
 * Upload a logo to Blob storage
 */
export async function uploadLogo(
  clientSlug: string,
  fileBuffer: Buffer | ArrayBuffer,
  contentType: string = "image/png",
): Promise<string> {
  const path = `${getEnvPrefix()}/themes/${clientSlug}/logo.png`

  const blob = await put(path, fileBuffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  })

  return blob.url
}

/**
 * Upload a favicon to Blob storage
 */
export async function uploadFavicon(
  clientSlug: string,
  fileBuffer: Buffer | ArrayBuffer,
  contentType: string = "image/x-icon",
): Promise<string> {
  const path = `${getEnvPrefix()}/themes/${clientSlug}/favicon.ico`

  const blob = await put(path, fileBuffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  })

  return blob.url
}

/**
 * Delete theme assets from Blob
 */
export async function deleteThemeAssets(clientSlug: string): Promise<void> {
  const prefix = getEnvPrefix()

  try {
    // Note: Vercel Blob doesn't have a list/delete by prefix API
    // In production, you'd track blob URLs in DB and delete individually
    // or use a cleanup job
    const logoPath = `${prefix}/themes/${clientSlug}/logo.png`
    const faviconPath = `${prefix}/themes/${clientSlug}/favicon.ico`

    await del([logoPath, faviconPath])
  } catch {
    // Silently fail - assets may not exist
  }
}

/**
 * Convert base64 data URL to Buffer for upload
 */
export function base64ToBuffer(base64DataUrl: string): {
  buffer: Buffer
  contentType: string
} {
  const matches = base64DataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 data URL format")
  }

  const contentType = matches[1]
  const base64Content = matches[2]
  const buffer = Buffer.from(base64Content, "base64")

  return { buffer, contentType }
}

/**
 * Upload theme assets from base64
 */
export async function uploadThemeAssets(
  clientSlug: string,
  logoBase64?: string,
  faviconBase64?: string,
): Promise<{ logoUrl?: string; faviconUrl?: string }> {
  const result: { logoUrl?: string; faviconUrl?: string } = {}

  if (logoBase64) {
    const { buffer, contentType } = base64ToBuffer(logoBase64)
    result.logoUrl = await uploadLogo(clientSlug, buffer, contentType)
  }

  if (faviconBase64) {
    const { buffer, contentType } = base64ToBuffer(faviconBase64)
    result.faviconUrl = await uploadFavicon(clientSlug, buffer, contentType)
  }

  return result
}
