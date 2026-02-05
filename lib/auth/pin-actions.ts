export type PinAction = "PROFILING" | "REFERENCES"

const PIN_ACTION_MATCHERS: Array<{
  action: PinAction
  test: (path: string) => boolean
}> = [
  {
    action: "PROFILING",
    test: (path) => /\/profiletest(?:\/|$)/.test(path),
  },
  {
    action: "REFERENCES",
    test: (path) => /\/references(?:\/|$)/.test(path),
  },
]

function normalizePath(input?: string | null): string | undefined {
  if (!input) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined

  try {
    const url = new URL(trimmed)
    return url.pathname || "/"
  } catch (_err) {
    if (trimmed.startsWith("/")) {
      return trimmed
    }
    return `/${trimmed}`
  }
}

export function getPinActionForPath(
  path?: string | null,
): PinAction | undefined {
  const normalized = normalizePath(path)
  if (!normalized) {
    return undefined
  }

  for (const matcher of PIN_ACTION_MATCHERS) {
    if (matcher.test(normalized)) {
      return matcher.action
    }
  }

  return undefined
}
