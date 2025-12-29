"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useRef, useState } from "react"

import { ClientLogo } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

export default function ApplicantPinPage() {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectError = searchParams.get("error")

  const PIN_LENGTH = 6
  const [pinDigits, setPinDigits] = useState<string[]>(() =>
    Array(PIN_LENGTH).fill(""),
  )
  const pinSlots = Array.from(
    { length: PIN_LENGTH },
    (_, index) => `pin-slot-${index}`,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const pinValue = useMemo(() => pinDigits.join(""), [pinDigits])

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>, startIndex: number) => {
      const pasted = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, PIN_LENGTH)

      if (!pasted) {
        return
      }

      event.preventDefault()

      setPinDigits((prev) => {
        const next = [...prev]
        let cursor = startIndex

        for (const char of pasted) {
          if (cursor >= PIN_LENGTH) break
          next[cursor] = char
          cursor += 1
        }

        return next
      })

      const focusIndex = Math.min(startIndex + pasted.length, PIN_LENGTH - 1)
      inputRefs.current[focusIndex]?.focus()
    },
    [],
  )

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.replace("/dashboard")
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const normalizedPin = pinValue.trim()

    if (!/^\d{6}$/.test(normalizedPin)) {
      setError("Enter the 6-digit PIN from your email or SMS.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Integrate with real PIN verification endpoint.
      await new Promise((resolve) => setTimeout(resolve, 600))
      setVerified(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to verify PIN")
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
            <div className="mb-4 flex justify-center">
              <ClientLogo />
            </div>
            <CardTitle>
              Enter your PIN for {currentTheme.branding.companyName}
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-8">
            {verified ? (
              <div className="flex flex-col gap-3 text-center">
                <div className="text-sm font-medium">PIN accepted</div>
                <div className="text-sm text-muted-foreground">
                  You&apos;re now authenticated. This screen will redirect once
                  PIN login is fully wired up.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  {redirectError && !error && (
                    <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                      {redirectError}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="pin-0">6-digit PIN</Label>
                    <div className="flex justify-between gap-2">
                      {pinSlots.map((slotId, index) => (
                        <Input
                          key={slotId}
                          id={`pin-${index}`}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          pattern="\d"
                          placeholder=""
                          value={pinDigits[index]}
                          className="h-12 w-12 text-center text-lg tracking-widest"
                          onPaste={(event) => handlePaste(event, index)}
                          onChange={(event) => {
                            const nextValue = event.target.value.replace(
                              /\D/g,
                              "",
                            )
                            if (!nextValue) {
                              setPinDigits((prev) => {
                                const next = [...prev]
                                next[index] = ""
                                return next
                              })
                              return
                            }

                            setPinDigits((prev) => {
                              const next = [...prev]
                              next[index] = nextValue.slice(0, 1)
                              return next
                            })

                            if (index < PIN_LENGTH - 1) {
                              inputRefs.current[index + 1]?.focus()
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Backspace") {
                              if (pinDigits[index]) {
                                setPinDigits((prev) => {
                                  const next = [...prev]
                                  next[index] = ""
                                  return next
                                })
                              } else if (index > 0) {
                                inputRefs.current[index - 1]?.focus()
                              }
                            }

                            if (event.key === "ArrowLeft" && index > 0) {
                              inputRefs.current[index - 1]?.focus()
                            }

                            if (
                              event.key === "ArrowRight" &&
                              index < PIN_LENGTH - 1
                            ) {
                              inputRefs.current[index + 1]?.focus()
                            }
                          }}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the code sent to your email or mobile number.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !/^\d{6}$/.test(pinValue)}
                  >
                    {isLoading ? "Verifying..." : "Verify PIN"}
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
