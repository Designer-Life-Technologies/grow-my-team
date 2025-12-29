"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

import { ClientLogo } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

export default function ApplicantLoginPage() {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.replace("/dashboard")
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/applicant/auth/request-login-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "Failed to request login link")
      }

      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to request login link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card
          className={cn(
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-4 motion-safe:duration-300 motion-safe:ease-out",
            "motion-reduce:transition-none motion-reduce:transform-none",
          )}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ClientLogo />
            </div>
            <CardTitle>
              Applicant login to {currentTheme.branding.companyName}
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-8">
            {submitted ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium">Check your email</div>
                <div className="text-sm text-muted-foreground">
                  If an account exists for{" "}
                  <span className="font-medium">{email}</span>, you&apos;ll
                  receive an email with a login link shortly.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  {redirectError && !error && (
                    <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
                      {redirectError}
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending link..." : "Send login link"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        <button
          type="button"
          onClick={handleBack}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    </div>
  )
}
