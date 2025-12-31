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
import { TestSequenceClient } from "./TestSequenceClient"

// Internal state type for tracking answers per group.
type GroupAnswer = {
  mostIndex: number | null
  leastIndex: number | null
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

  // Fetch initial state from server
  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await getDISC(applicationId)
        if (status.startedAt) {
          setHasStarted(true)
          setStartedAt(new Date(status.startedAt).getTime())
        }
        if (status.completedAt) {
          setCompletedAt(new Date(status.completedAt).getTime())
        }
        if (status.answers && status.answers.length > 0) {
          const next: Record<string, GroupAnswer> = {}
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

          // Set group index to the first unanswered group
          const firstUnanswered = profileTest.findIndex(
            (g) => !next[String(g.id)] || next[String(g.id)].mostIndex === null,
          )
          if (firstUnanswered !== -1) {
            setGroupIndex(firstUnanswered)
          } else if (status.completedAt) {
            setGroupIndex(profileTest.length - 1)
          }
        }
      } catch (error) {
        console.error("Failed to load DISC status:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStatus()
  }, [applicationId, profileTest])

  const currentAnswerSet = useMemo(() => {
    if (!startedAt) return null

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

    const completed = completedAt ?? null
    const set: DISCAnswerSet = {
      startedAt: new Date(startedAt),
      completedAt: completed ? new Date(completed) : undefined,
      answers: out,
    }

    return set
  }, [answers, completedAt, profileTest, startedAt])

  const persistAnswers = useCallback(
    async (overrideSet?: DISCAnswerSet) => {
      const setToPersist = overrideSet ?? currentAnswerSet
      if (!setToPersist) return

      setIsSubmitting(true)
      try {
        await submitDISCAnswers(applicationId, setToPersist)
      } catch (error) {
        console.error("Failed to persist DISC answers:", error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [applicationId, currentAnswerSet],
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
    const now = Date.now()
    setHasStarted(true)
    setStartedAt(now)

    await persistAnswers({
      startedAt: new Date(now),
      answers: [],
    })
  }

  async function handleNextGroup() {
    if (!canGoNext) return

    const isLastGroup = groupIndex >= totalGroups - 1
    const newCompletedAt = isLastGroup ? Date.now() : null

    if (isLastGroup) {
      setCompletedAt(newCompletedAt)
    } else {
      setGroupIndex((prev) => prev + 1)
    }

    // Persist to server
    if (currentAnswerSet) {
      const setToPersist = {
        ...currentAnswerSet,
        completedAt: newCompletedAt ? new Date(newCompletedAt) : undefined,
      }
      await persistAnswers(setToPersist)
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
              Your responses have been recorded. You’ll receive feedback
              shortly.
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
                  <span>You may be contacted if your profile is a match</span>
                </li>
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">
                We appreciate your time.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <TestSequenceClient
          currentGroup={currentGroup}
          groupIndex={groupIndex}
          totalGroups={totalGroups}
          startedAt={startedAt}
          mostIndex={currentGroupAnswer.mostIndex}
          leastIndex={currentGroupAnswer.leastIndex}
          canGoNext={canGoNext && !isSubmitting}
          onSelectMost={(index: number) => {
            if (!currentGroup) return
            setMostIndex(currentGroup.id, index)
          }}
          onSelectLeast={(index: number) => {
            if (!currentGroup) return
            setLeastIndex(currentGroup.id, index)
          }}
          onNext={handleNextGroup}
        />
      )}
    </div>
  )
}
