"use client"

import { useEffect, useState } from "react"

interface DebugInfo {
  host: string
  theme: {
    id: string
    name: string
    source: string
  }
  organisationId: string | null
  apiEndpoint: {
    url: string
    source: string
  }
  resolutionPath: {
    themeSource: string
    hasOrganisationId: boolean
    apiSource: string
  }
  timestamp: string
}

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only fetch in non-production environments or if explicitly enabled
    // Check: NODE_ENV, Vercel env, host pattern
    const isDev = process.env.NODE_ENV !== "production"
    const enableDebug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true"
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || ""

    if (!isDev && !enableDebug && vercelEnv !== "preview") {
      // Additional check: allow if host contains staging/uat/preview
      const host = window.location.hostname
      const isNonProdHost =
        host.includes("uat") ||
        host.includes("staging") ||
        host.includes("preview") ||
        host.includes("dev") ||
        host.includes("localhost") ||
        host.includes("127.0.0.1")

      if (!isNonProdHost) return
    }

    const fetchDebugInfo = async () => {
      try {
        // Pass theme parameter from URL to server-side API
        const urlParams = new URLSearchParams(window.location.search)
        const themeParam = urlParams.get("theme")
        const apiUrl = `/api/config/debug-info${themeParam ? `?theme=${themeParam}` : ""}`

        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()
          setDebugInfo(data)
          console.log("[DebugInfo] Current configuration:", data)
        }
      } catch (error) {
        console.error("[DebugInfo] Failed to fetch debug info:", error)
      }
    }

    fetchDebugInfo()

    // Refresh every 30 seconds
    const interval = setInterval(fetchDebugInfo, 30000)
    return () => clearInterval(interval)
  }, [])

  // Only render in non-production environments or if explicitly enabled
  const isDev = process.env.NODE_ENV !== "production"
  const enableDebug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true"
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || ""

  if (!isDev && !enableDebug && vercelEnv !== "preview") {
    const host = window.location.hostname
    const isNonProdHost =
      host.includes("uat") ||
      host.includes("staging") ||
      host.includes("preview") ||
      host.includes("dev") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1")

    if (!isNonProdHost) return null
  }

  if (!debugInfo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-mono"
        >
          Debug Info (Loading...)
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-mono mb-2"
      >
        {isVisible ? "Hide" : "Show"} Debug Info
      </button>
      {isVisible && (
        <div className="bg-black text-green-400 p-4 rounded text-xs font-mono max-w-md max-h-96 overflow-auto border border-green-500">
          <div className="font-bold mb-2 text-yellow-400">Debug Info</div>
          <div className="space-y-2">
            <div>
              <span className="text-yellow-400">Host:</span> {debugInfo.host}
            </div>
            <div>
              <span className="text-yellow-400">Theme:</span>{" "}
              {debugInfo.theme.id} ({debugInfo.theme.name})
            </div>
            <div>
              <span className="text-yellow-400">Theme Source:</span>{" "}
              {debugInfo.theme.source}
            </div>
            <div>
              <span className="text-yellow-400">Organisation ID:</span>{" "}
              {debugInfo.organisationId || "none"}
            </div>
            <div>
              <span className="text-yellow-400">API Endpoint:</span>{" "}
              {debugInfo.apiEndpoint.url}
            </div>
            <div>
              <span className="text-yellow-400">API Source:</span>{" "}
              {debugInfo.apiEndpoint.source}
            </div>
            <div className="border-t border-green-500 pt-2 mt-2">
              <span className="text-yellow-400">Resolution Path:</span>
              <div className="ml-2">
                <div>Theme: {debugInfo.resolutionPath.themeSource}</div>
                <div>
                  Org ID:{" "}
                  {debugInfo.resolutionPath.hasOrganisationId
                    ? "found"
                    : "not found"}
                </div>
                <div>API: {debugInfo.resolutionPath.apiSource}</div>
              </div>
            </div>
            <div className="text-gray-500 text-[10px]">
              Updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
