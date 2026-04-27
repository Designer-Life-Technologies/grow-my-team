import { headers } from "next/headers"
import { getThemeBySlug } from "@/lib/db/themes"

/**
 * Centralized resolver for the GetMe.video API base URL.
 *
 * Resolution strategy:
 * 1. Theme-specific API endpoint from database (by theme param)
 * 2. Subdomain-specific API endpoint from database (by subdomain)
 * 3. Default GETME_API_URL environment variable (fallback)
 */
const defaultApiBase = process.env.GETME_API_URL

async function detectRuntimeHost() {
  try {
    const runtimeHeaders = await headers()
    return runtimeHeaders.get("host") || "localhost"
  } catch (_error) {
    return "localhost"
  }
}

async function getClientApiEndpoint(
  host?: string | null,
): Promise<string | null> {
  if (!host) {
    return null
  }

  const subdomain = host.split(":")[0]?.toLowerCase().split(".")[0] || ""

  try {
    const client = await getThemeBySlug(subdomain)
    if (client?.gmt_api_endpoint) {
      console.log(
        `[GetMeApiUrl] ✓ Using subdomain-specific API endpoint for ${subdomain}: ${client.gmt_api_endpoint} (source: database)`,
      )
      return client.gmt_api_endpoint
    }
  } catch (error) {
    console.warn(
      `[GetMeApiUrl] ⚠ Failed to get subdomain API endpoint: ${error}`,
    )
  }

  return null
}

export async function resolveGetMeApiUrl(
  explicitHost?: string | null,
): Promise<string> {
  const clientApiEndpoint = await getClientApiEndpoint(
    explicitHost ?? (await detectRuntimeHost()),
  )
  if (clientApiEndpoint) {
    return clientApiEndpoint
  }

  if (!defaultApiBase) {
    throw new Error("GETME_API_URL environment variable is not configured")
  }

  return defaultApiBase
}

export async function resolveGetMeApiUrlWithSource(
  explicitHost?: string | null,
  themeParam?: string | null,
): Promise<{
  endpoint: string
  source: "database" | "env-var" | "env-var-fallback"
}> {
  // Priority 1: Theme-specific API endpoint from database
  if (themeParam) {
    try {
      const theme = await getThemeBySlug(themeParam)
      if (theme?.gmt_api_endpoint) {
        console.log(
          `[GetMeApiUrl] ✓ Using theme-specific API endpoint for ${themeParam}: ${theme.gmt_api_endpoint} (source: database)`,
        )
        return { endpoint: theme.gmt_api_endpoint, source: "database" }
      }
    } catch (error) {
      console.warn(`[GetMeApiUrl] ⚠ Failed to get theme API endpoint: ${error}`)
    }
  }

  // Priority 2: Subdomain-specific API endpoint from database
  const clientApiEndpoint = await getClientApiEndpoint(
    explicitHost ?? (await detectRuntimeHost()),
  )
  if (clientApiEndpoint) {
    return { endpoint: clientApiEndpoint, source: "database" }
  }

  // Priority 3: Default API URL from environment variable
  if (!defaultApiBase) {
    throw new Error("GETME_API_URL environment variable is not configured")
  }

  console.log(
    `[GetMeApiUrl] ✓ Using default API endpoint: ${defaultApiBase} (source: env var - GETME_API_URL fallback)`,
  )
  return { endpoint: defaultApiBase, source: "env-var-fallback" }
}

export async function resolveGetMeApiUrlFromHeaders(
  headersLike?: HeadersLike,
): Promise<string> {
  const host = headersLike
    ? getHeaderValue(headersLike, "host") ||
      getHeaderValue(headersLike, "x-forwarded-host") ||
      getHeaderValue(headersLike, "origin") ||
      "localhost"
    : await detectRuntimeHost()

  const clientApiEndpoint = await getClientApiEndpoint(host)
  if (clientApiEndpoint) {
    return clientApiEndpoint
  }

  if (!defaultApiBase) {
    throw new Error("GETME_API_URL environment variable is not configured")
  }

  return defaultApiBase
}

type HeaderValue = string | string[] | undefined
type HeadersLike = Headers | Record<string, HeaderValue> | null | undefined

function getHeaderValue(headersLike: HeadersLike, headerName: string) {
  if (!headersLike) {
    return undefined
  }

  const normalized = headerName.toLowerCase()

  if (headersLike instanceof Headers) {
    return headersLike.get(normalized) ?? undefined
  }

  for (const [key, value] of Object.entries(headersLike)) {
    if (key.toLowerCase() === normalized) {
      if (Array.isArray(value)) {
        return value[0]
      }
      return value
    }
  }

  return undefined
}
