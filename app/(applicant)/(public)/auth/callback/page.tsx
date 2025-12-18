"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { ApplicantAuthPending } from "@/components/applicant/auth/ApplicantAuthPending"

function normalizeNext(value: string | null | undefined) {
  if (!value) return "/profile/test"
  if (!value.startsWith("/")) return "/profile/test"
  return value
}

export default function ApplicantAuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const nonce = searchParams.get("n")
        const applicantId = searchParams.get("applicantId")
        const email = searchParams.get("email")
        const next = normalizeNext(searchParams.get("next"))

        if (!nonce) {
          throw new Error("Missing nonce")
        }

        if (!applicantId && !email) {
          throw new Error("Missing applicantId or email")
        }

        const res = await signIn("applicant", {
          id: applicantId || undefined,
          email: email || undefined,
          nonce,
          redirect: false,
        })

        if (res?.error) {
          throw new Error("Authentication failed")
        }

        if (cancelled) return
        router.replace(next)
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : "Authentication failed"
        setError(message)
        const qs = new URLSearchParams({ error: message })
        router.replace(`/applicant/login?${qs.toString()}`)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  return <ApplicantAuthPending error={error} />
}
