"use client"

import { IconLoader2 } from "@tabler/icons-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useCallback, useMemo, useRef, useState } from "react"

import { ClientLogo } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getPinActionForPath } from "@/lib/auth/pin-actions"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/utils/logger"

export default function ApplicationPinPage() {
  const params = useParams<{ id?: string | string[] }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const pathId = Array.isArray(params?.id) ? params?.id?.[0] : params?.id
  const id = pathId ?? searchParams.get("id")
  const next = searchParams.get("next") || "/"

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
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const pinValue = useMemo(() => pinDigits.join(""), [pinDigits])

  const resetPinInputs = useCallback(() => {
    setPinDigits((prev) => prev.map(() => ""))
    inputRefs.current[0]?.focus()
  }, [])

  const showPinError = useCallback(
    (message: string) => {
      resetPinInputs()
      setError(message)
    },
    [resetPinInputs],
  )

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
        const nextDigits = [...prev]
        let cursor = startIndex

        for (const char of pasted) {
          if (cursor >= PIN_LENGTH) break
          nextDigits[cursor] = char
          cursor += 1
        }

        return nextDigits
      })

      const focusIndex = Math.min(startIndex + pasted.length, PIN_LENGTH - 1)
      inputRefs.current[focusIndex]?.focus()
    },
    [],
  )

  const _handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.replace("/")
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const normalizedPin = pinValue.trim()

    if (!/^\d{6}$/.test(normalizedPin)) {
      showPinError("Enter the 6-digit PIN from your email or SMS.")
      return
    }

    if (!id) {
      showPinError(
        "Missing application information. Please use the original link.",
      )
      return
    }

    setIsLoading(true)
    setError(null)

    let pendingNavigation = false
    try {
      const pinAction = getPinActionForPath(next)
      const res = await signIn("pin", {
        applicationId: id,
        pin: normalizedPin,
        pinAction,
        redirect: false,
      })

      if (res?.error) {
        throw new Error("Invalid PIN. Please try again.")
      }

      const target =
        next?.startsWith("/") || next?.startsWith("http")
          ? next
          : `/${next}`.replace(/\/{2,}/g, "/")

      try {
        router.replace(target || "/")
        router.refresh()
        pendingNavigation = true
      } catch (navigationError) {
        if (typeof window !== "undefined") {
          window.location.assign(target || "/")
          pendingNavigation = true
        } else {
          logger.error("Failed to navigate from PIN page:", navigationError)
        }
      }
    } catch (e) {
      showPinError(e instanceof Error ? e.message : "Failed to verify PIN")
    } finally {
      if (!pendingNavigation) {
        setIsLoading(false)
      }
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
            <p className="text-xs text-muted-foreground">
              Enter the code sent to your email or mobile number.
            </p>
          </CardHeader>

          <CardContent className="">
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
                              const nextDigits = [...prev]
                              nextDigits[index] = ""
                              return nextDigits
                            })
                            return
                          }

                          setPinDigits((prev) => {
                            const nextDigits = [...prev]
                            nextDigits[index] = nextValue.slice(0, 1)
                            return nextDigits
                          })

                          if (index < PIN_LENGTH - 1) {
                            inputRefs.current[index + 1]?.focus()
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Backspace") {
                            if (pinDigits[index]) {
                              setPinDigits((prev) => {
                                const nextDigits = [...prev]
                                nextDigits[index] = ""
                                return nextDigits
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
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !/^\d{6}$/.test(pinValue)}
                >
                  {isLoading ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying&hellip;
                    </>
                  ) : (
                    "Verify PIN"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
