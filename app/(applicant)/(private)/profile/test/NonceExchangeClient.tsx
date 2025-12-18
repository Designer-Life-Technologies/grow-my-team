"use client"

import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"

type Props = {
  nonce: string
  applicantId?: string
  email?: string
}

export function NonceExchangeClient({ nonce, applicantId, email }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        if (!applicantId && !email) {
          throw new Error("Missing applicantId or email")
        }

        await signIn("applicant", {
          id: applicantId,
          email,
          nonce,
          redirect: true,
          callbackUrl: "/profile/test",
        })
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Nonce exchange failed")
        setIsWorking(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [nonce, applicantId, email])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        {error}
      </div>
    )
  }

  if (isWorking) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Signing you in…
      </div>
    )
  }

  return null
}
