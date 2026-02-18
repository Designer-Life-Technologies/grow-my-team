import { redirect } from "next/navigation"

interface RedirectOptions {
  reason?: string
}

type StatusError = Error & { status?: number }

export function isApplicationAuthError(error: unknown): error is StatusError {
  if (!error || typeof error !== "object") return false
  const maybeError = error as Partial<StatusError>
  return (
    typeof maybeError.status === "number" &&
    (maybeError.status === 401 || maybeError.status === 403)
  )
}

export function redirectToApplicationPin(
  applicationId: string,
  nextPath: string,
  options?: RedirectOptions,
) {
  const params = new URLSearchParams()
  params.set("next", nextPath)
  params.set("reauth", "1")
  if (options?.reason) {
    params.set("reason", options.reason)
  }

  redirect(`/application/${applicationId}/pin?${params.toString()}`)
}
