import { headers } from "next/headers"
import { getThemeBySlug } from "@/lib/db/themes"

/**
 * Centralized resolver for the GetMe.video API base URL.
 *
 * The resolver supports:
 * 1. Database-driven client-specific API endpoints (from client_settings.gmt_api_endpoint)
 * 2. Environment variable GETME_API_URL_MAP for host-based overrides
 * 3. Fallback to GETME_API_URL environment variable
 *
 * Priority:
 * 1. Client-specific API endpoint from database (by subdomain)
 * 2. Host-based override from GETME_API_URL_MAP
 * 3. Default GETME_API_URL
 */
const defaultApiBase = process.env.GETME_API_URL

const hostApiMap = (() => {
  const raw = process.env.GETME_API_URL_MAP
  if (!raw) {
    return {}
  }

  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const [host, url] = entry.split("=")
      const normalizedHost = host?.trim().toLowerCase()
      const normalizedUrl = url?.trim()

      if (!normalizedHost || !normalizedUrl) {
        console.warn(
          `[resolveGetMeApiUrl] Ignoring invalid GETME_API_URL_MAP entry: ${entry}`,
        )
        return acc
      }

      acc[normalizedHost] = normalizedUrl
      return acc
    }, {})
})()

function normalizeHostCandidates(host?: string | null) {
  if (!host) {
    return []
  }

  const trimmed = host.trim()
  if (!trimmed) {
    return []
  }

  let processed = trimmed
  if (trimmed.includes("://")) {
    try {
      processed = new URL(trimmed).host
    } catch (_error) {
      // Ignore invalid URL strings and continue with the trimmed value.
    }
  }

  const normalized = processed.toLowerCase()
  const candidates = new Set<string>([normalized])

  // Also try the host without a port component, if present.
  const [hostname] = normalized.split(":")
  if (hostname) {
    candidates.add(hostname)
  }

  return Array.from(candidates)
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

function extractHostFromHeaders(headersLike: HeadersLike) {
  return (
    getHeaderValue(headersLike, "x-forwarded-host") ??
    getHeaderValue(headersLike, "host") ??
    getHeaderValue(headersLike, "origin")
  )
}

async function detectRuntimeHost() {
  try {
    const runtimeHeaders = await headers()
    return extractHostFromHeaders(runtimeHeaders)
  } catch (_error) {
    // headers() throws when a request context is not available (e.g., during build).
    return undefined
  }
}

/**
 * Get client-specific API endpoint from database
 */
async function getClientApiEndpoint(
  host?: string | null,
): Promise<string | null> {
  if (!host) {
    return null
  }

  // Extract subdomain (first part of hostname)
  const normalizedHost = host.split(":")[0]?.toLowerCase() || ""
  const subdomain = normalizedHost.split(".")[0] || normalizedHost

  console.log(
    `[GetMeApiUrl] Resolving API endpoint for host: ${host} (subdomain: ${subdomain})`,
  )

  try {
    const client = await getThemeBySlug(subdomain)
    if (client?.gmt_api_endpoint) {
      console.log(
        `[GetMeApiUrl] ✓ Using client-specific API endpoint for ${subdomain}: ${client.gmt_api_endpoint} (database)`,
      )
      return client.gmt_api_endpoint
    }
    console.log(
      `[GetMeApiUrl] ✗ No client-specific API endpoint found for ${subdomain} in database`,
    )
  } catch (error) {
    // Handle missing database connection gracefully
    console.warn(
      `[GetMeApiUrl] ⚠ Failed to get client API endpoint from database: ${error} (will use fallback)`,
    )
  }

  return null
}

export async function resolveGetMeApiUrl(explicitHost?: string | null) {
  // Priority 1: Client-specific API endpoint from database
  const clientApiEndpoint = await getClientApiEndpoint(
    explicitHost ?? (await detectRuntimeHost()),
  )
  if (clientApiEndpoint) {
    return clientApiEndpoint
  }

  // Priority 2: Host-based override from environment variable
  const candidates = normalizeHostCandidates(
    explicitHost ?? (await detectRuntimeHost()),
  )

  for (const candidate of candidates) {
    const mappedUrl = hostApiMap[candidate]
    if (mappedUrl) {
      console.log(
        `[GetMeApiUrl] ✓ Using host-based override for ${candidate}: ${mappedUrl} (env var)`,
      )
      return mappedUrl
    }
  }

  // Priority 3: Default API URL from environment variable
  if (!defaultApiBase) {
    throw new Error("GETME_API_URL environment variable is not configured")
  }

  console.log(
    `[GetMeApiUrl] ✓ Using default API endpoint: ${defaultApiBase} (env var fallback)`,
  )
  return defaultApiBase
}

export async function resolveGetMeApiUrlWithSource(
  explicitHost?: string | null,
  themeParam?: string | null,
): Promise<{
  endpoint: string
  source: "database" | "env-var" | "env-var-fallback"
}> {
  // Priority 1: Client-specific API endpoint from database (by theme param if provided)
  if (themeParam) {
    try {
      const theme = await getThemeBySlug(themeParam)
      if (theme?.gmt_api_endpoint) {
        console.log(
          `[GetMeApiUrl] ✓ Using theme-specific API endpoint for ${themeParam}: ${theme.gmt_api_endpoint} (database)`,
        )
        return { endpoint: theme.gmt_api_endpoint, source: "database" }
      }
      console.log(
        `[GetMeApiUrl] ✗ No theme-specific API endpoint found for ${themeParam} in database`,
      )
    } catch (error) {
      console.warn(
        `[GetMeApiUrl] ⚠ Failed to get theme API endpoint from database: ${error} (will use fallback)`,
      )
    }
  }

  // Priority 2: Client-specific API endpoint from database (by subdomain)
  const clientApiEndpoint = await getClientApiEndpoint(
    explicitHost ?? (await detectRuntimeHost()),
  )
  if (clientApiEndpoint) {
    return { endpoint: clientApiEndpoint, source: "database" }
  }

  // Priority 3: Host-based override from environment variable
  const candidates = normalizeHostCandidates(
    explicitHost ?? (await detectRuntimeHost()),
  )

  for (const candidate of candidates) {
    const mappedUrl = hostApiMap[candidate]
    if (mappedUrl) {
      console.log(
        `[GetMeApiUrl] ✓ Using host-based override for ${candidate}: ${mappedUrl} (env var)`,
      )
      return { endpoint: mappedUrl, source: "env-var" }
    }
  }

  // Priority 4: Default API URL from environment variable
  if (!defaultApiBase) {
    throw new Error("GETME_API_URL environment variable is not configured")
  }

  console.log(
    `[GetMeApiUrl] ✓ Using default API endpoint: ${defaultApiBase} (env var fallback)`,
  )
  return { endpoint: defaultApiBase, source: "env-var-fallback" }
}

export async function resolveGetMeApiUrlFromHeaders(headersLike?: HeadersLike) {
  return resolveGetMeApiUrl(extractHostFromHeaders(headersLike))
}
