import { headers } from "next/headers"

/**
 * Centralized resolver for the GetMe.video API base URL.
 *
 * The resolver supports host-based overrides by parsing the optional
 * GETME_API_URL_MAP environment variable. The map expects a comma-separated
 * list of `host=baseUrl` pairs, for example:
 *
 * GETME_API_URL_MAP="careers.example.com=https://api.acme.getme.video,partners.example.com=https://api.beta.getme.video"
 *
 * If no override matches the current host, the function falls back to the
 * default GETME_API_URL value.
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

export async function resolveGetMeApiUrl(explicitHost?: string | null) {
  const candidates = normalizeHostCandidates(
    explicitHost ?? (await detectRuntimeHost()),
  )

  for (const candidate of candidates) {
    const mappedUrl = hostApiMap[candidate]
    if (mappedUrl) {
      return mappedUrl
    }
  }

  if (!defaultApiBase) {
    throw new Error("GETME_API_URL environment variable is not configured")
  }

  return defaultApiBase
}

export async function resolveGetMeApiUrlFromHeaders(headersLike?: HeadersLike) {
  return resolveGetMeApiUrl(extractHostFromHeaders(headersLike))
}
