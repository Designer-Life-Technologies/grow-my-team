export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("✅ Instrumentation registered - System ready for monitoring")
  }
}

export async function onRequestError(
  err: Error & { digest?: string },
  request: {
    path: string
    method: string
    headers: Headers
  },
  context: {
    routerKind: "Pages Router" | "App Router"
    routeType: "render" | "route" | "action" | "middleware"
  },
) {
  // Simple console logging for now
  // In a real production app, this is where you would send to Sentry/Datadog
  console.error(`[${request.method}] ${request.path} - Error detected:`)
  console.error(`   Message: ${err.message}`)
  console.error(`   Digest: ${err.digest || "N/A"}`)
  console.error(`   Route Type: ${context.routeType}`)

  if (process.env.NODE_ENV === "development") {
    // Optional: Detailed stack trace in dev
    console.error(err.stack)
  }
}
