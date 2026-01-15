"use client"

// Client-side UI for the applicant personality profile test.

import { CheckCircle2, Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { getDISC, submitDISCAnswers } from "@/lib/profiletest/DISC/actions"
import type {
  DISCAnswer,
  DISCAnswerSet,
  DISCQuestionnaire as DISCQuestionnaireType,
} from "@/lib/profiletest/types"

// Internal state type for tracking answers per group.
type GroupAnswer = {
  mostIndex: number | null
  leastIndex: number | null
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return `${mm}:${ss}`
}

export function DISCQuestionnaire({
  applicationId,
  instructions,
  profileTest,
}: {
  applicationId: string
  instructions: ReactNode
  profileTest: DISCQuestionnaireType
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [groupIndex, setGroupIndex] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, GroupAnswer>>({})
  const [completedAt, setCompletedAt] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clockOffset, setClockOffset] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Timer for elapsed time
  useEffect(() => {
    if (!hasStarted || completedAt) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [hasStarted, completedAt])

  const elapsedSeconds = useMemo(() => {
    if (!startedAt) return 0
    // end and start are both in local time (or offset-adjusted local time)
    const currentAdjustedTime = now + clockOffset
    const end = completedAt ? completedAt : currentAdjustedTime
    return Math.max(0, Math.floor((end - startedAt) / 1000))
  }, [now, clockOffset, startedAt, completedAt])

  const elapsedLabel = useMemo(() => {
    if (!startedAt) return "00:00"
    return formatElapsed(elapsedSeconds)
  }, [elapsedSeconds, startedAt])

  const elapsedClassName = useMemo(() => {
    if (elapsedSeconds >= 10 * 60) return "text-destructive"
    if (elapsedSeconds >= 7 * 60) return "text-amber-500 dark:text-amber-400"
    return "text-primary"
  }, [elapsedSeconds])

  // Fetch initial state from server
  useEffect(() => {
    async function loadStatus() {
      try {
        try {
          const status = await getDISC(applicationId)

          if (!status) {
            setHasStarted(false)
            setIsLoading(false)
            return
          }

          // If we got a status, it might be an empty/initialized test or an in-progress one
          if (status.serverNow) {
            const serverTime = new Date(status.serverNow).getTime()
            const offset = serverTime - Date.now()
            setClockOffset(offset)
          }

          if (status.startedAt) {
            const startTime = new Date(status.startedAt).getTime()
            setStartedAt(startTime)
            setHasStarted(true)
          } else if (status.answers && status.answers.length > 0) {
            setHasStarted(true)
          } else {
            setHasStarted(false)
          }

          if (status.completedAt) {
            setCompletedAt(new Date(status.completedAt).getTime())
          }

          const next: Record<string, GroupAnswer> = {}
          if (status.answers && status.answers.length > 0) {
            for (const answer of status.answers) {
              const group = profileTest.find((g) => g.id === answer.id)
              if (!group) continue

              const mostIndex = group.statements.findIndex(
                (s) => s.category === answer.most,
              )
              const leastIndex = group.statements.findIndex(
                (s) => s.category === answer.least,
              )

              next[String(group.id)] = {
                mostIndex: mostIndex >= 0 ? mostIndex : null,
                leastIndex: leastIndex >= 0 ? leastIndex : null,
              }
            }
            setAnswers(next)
          }

          if (
            status.startedAt ||
            (status.answers && status.answers.length > 0)
          ) {
            // Set group index to the first unanswered group
            const firstUnanswered = profileTest.findIndex(
              (g) =>
                !next[String(g.id)] || next[String(g.id)].mostIndex === null,
            )
            if (firstUnanswered !== -1) {
              setGroupIndex(firstUnanswered)
            } else if (status.completedAt) {
              setGroupIndex(profileTest.length - 1)
            }
          }
        } catch {
          // Inner error handled silently
        }
      } catch {
        // Outer error handled silently
      } finally {
        setIsLoading(false)
      }
    }
    loadStatus()
  }, [applicationId, profileTest])

  const currentAnswerSet = useMemo(() => {
    // We don't block the memo on startedAt anymore because the server will provide it
    // But we still need answers and profileTest to build the payload
    const out: DISCAnswer[] = []

    for (const group of profileTest) {
      const key = String(group.id)
      const groupAnswer = answers[key]
      if (!groupAnswer) continue
      if (groupAnswer.mostIndex === null || groupAnswer.leastIndex === null)
        continue

      const most = group.statements[groupAnswer.mostIndex]?.category
      const least = group.statements[groupAnswer.leastIndex]?.category
      if (!most || !least) continue

      out.push({ id: group.id, most, least })
    }

    const started = startedAt ?? null
    const set: Partial<DISCAnswerSet> = {
      startedAt: started ? new Date(started) : undefined,
      answers: out,
    }

    return set
  }, [answers, startedAt, profileTest])

  const persistAnswers = useCallback(
    async (overrideSet?: Partial<DISCAnswerSet>) => {
      // If we haven't started and no override is provided, don't persist
      if (!hasStarted && !overrideSet) {
        return
      }

      const setToPersist = (overrideSet ?? currentAnswerSet) as DISCAnswerSet
      if (!setToPersist) {
        return
      }

      setIsSubmitting(true)
      try {
        const result = await submitDISCAnswers(applicationId, setToPersist)

        if (result.serverNow) {
          const serverTime = new Date(result.serverNow).getTime()
          setClockOffset(serverTime - Date.now())
        }
        if (result.startedAt) {
          setStartedAt(new Date(result.startedAt).getTime())
        }
        if (result.completedAt) {
          setCompletedAt(new Date(result.completedAt).getTime())
        }
      } catch {
        // Error handled silently
      } finally {
        setIsSubmitting(false)
      }
    },
    [applicationId, currentAnswerSet, hasStarted],
  )

  const totalGroups = profileTest.length

  const currentGroup = useMemo(
    () => profileTest[groupIndex],
    [profileTest, groupIndex],
  )

  const currentGroupAnswer = useMemo(() => {
    const id = currentGroup?.id
    if (id === undefined || id === null) {
      return { mostIndex: null, leastIndex: null } satisfies GroupAnswer
    }
    const key = String(id)
    return (
      answers[key] ??
      ({ mostIndex: null, leastIndex: null } satisfies GroupAnswer)
    )
  }, [answers, currentGroup])

  const isCompleted = completedAt !== null

  const canGoNext =
    hasStarted &&
    currentGroupAnswer.mostIndex !== null &&
    currentGroupAnswer.leastIndex !== null &&
    currentGroupAnswer.mostIndex !== currentGroupAnswer.leastIndex

  async function handleStart() {
    if (hasStarted) return
    const nowLocal = Date.now()
    const startTime = nowLocal + clockOffset

    setIsSubmitting(true)
    try {
      await persistAnswers({
        startedAt: new Date(startTime),
        answers: [],
      })

      setHasStarted(true)
      setStartedAt(startTime)
    } catch {
      // Optionally show an error toast here
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleNextGroup() {
    if (!canGoNext) return

    const isLastGroup = groupIndex >= totalGroups - 1

    if (!isLastGroup) {
      setGroupIndex((prev) => prev + 1)
    }

    // Persist to server
    if (currentAnswerSet) {
      await persistAnswers(currentAnswerSet as DISCAnswerSet)
    }
  }

  function setMostIndex(groupId: number, mostIndex: number | null) {
    setAnswers((prev) => {
      const key = String(groupId)
      const existing = prev[key] ?? { mostIndex: null, leastIndex: null }
      const next: GroupAnswer = {
        mostIndex,
        leastIndex:
          mostIndex !== null && existing.leastIndex === mostIndex
            ? null
            : existing.leastIndex,
      }
      return { ...prev, [key]: next }
    })
  }

  function setLeastIndex(groupId: number, leastIndex: number | null) {
    setAnswers((prev) => {
      const key = String(groupId)
      const existing = prev[key] ?? { mostIndex: null, leastIndex: null }
      const next: GroupAnswer = {
        mostIndex:
          leastIndex !== null && existing.mostIndex === leastIndex
            ? null
            : existing.mostIndex,
        leastIndex,
      }
      return { ...prev, [key]: next }
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading your progress...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!hasStarted ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mt-2 space-y-6 text-sm text-muted-foreground">
            {instructions}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleStart}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Start
              </Button>
            </div>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="mt-8 animate-in fade-in duration-500">
          <div className="rounded-lg border bg-card p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
            </div>

            <h2 className="text-2xl font-bold">Thank you!</h2>
            <p className="mt-3 text-muted-foreground">
              Your responses have been recorded.
            </p>

            <div className="mt-6 rounded-lg bg-muted/50 p-6 text-left">
              <h3 className="font-semibold">What happens next?</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    We’ll review your results as part of your application
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    We will be in touch shortly with further information and
                    instructions.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  Quick reminder
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Read each statement carefully, then select one statement as{" "}
                  <strong>MOST</strong> and one as <strong>LEAST</strong> to
                  continue.
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  Elapsed Time
                </div>
                <div
                  className={`text-3xl font-semibold tabular-nums leading-none mt-1 ${elapsedClassName}`}
                >
                  {elapsedLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-end text-xs font-medium text-muted-foreground">
                  <span>
                    {groupIndex + 1} of {totalGroups}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-border"
                  aria-label="Test progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(
                    (Math.min(groupIndex + 1, Math.max(totalGroups, 1)) /
                      Math.max(totalGroups, 1)) *
                      100,
                  )}
                >
                  <div
                    className="h-full bg-primary transition-[width] duration-300"
                    style={{
                      width: `${
                        (Math.min(groupIndex + 1, Math.max(totalGroups, 1)) /
                          Math.max(totalGroups, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {currentGroup?.statements?.length ? (
                  <ul className="space-y-2">
                    {currentGroup.statements.map((s, idx) => {
                      const isMost = currentGroupAnswer.mostIndex === idx
                      const isLeast = currentGroupAnswer.leastIndex === idx

                      return (
                        <li
                          key={`${currentGroup.id}-${idx}`}
                          className="rounded-md border border-border p-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-foreground">{s.statement}</div>

                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={isMost ? "default" : "outline"}
                                onClick={() => {
                                  if (!currentGroup) return
                                  setMostIndex(currentGroup.id, idx)
                                }}
                                aria-pressed={isMost}
                              >
                                Most
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={isLeast ? "default" : "outline"}
                                onClick={() => {
                                  if (!currentGroup) return
                                  setLeastIndex(currentGroup.id, idx)
                                }}
                                aria-pressed={isLeast}
                              >
                                Least
                              </Button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No statements available.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNextGroup}
                  disabled={!canGoNext || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {groupIndex >= totalGroups - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
