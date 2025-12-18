"use client"

import { Loader2 } from "lucide-react"

export function ApplicantAuthPending({
  title = "Signing you in…",
  description = "Please wait while we securely authenticate you.",
  error,
}: {
  title?: string
  description?: string
  error?: string | null
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          {error}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Authenticating…</span>
        </div>
      )}
    </div>
  )
}
