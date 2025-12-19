"use client"

// Client-side UI for the applicant personality profile test.

import { CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import type {
  DISCProfileTestAnswer,
  DISCProfileTestAnswerSet,
  DISCProfileTestStatementGroup,
} from "@/lib/applicant"
import { TestSequenceClient } from "./TestSequenceClient"

type GroupAnswer = {
  mostIndex: number | null
  leastIndex: number | null
}

type PersistedAnswerSet = {
  startedAt: string
  completedAt: string
  answers: DISCProfileTestAnswer[]
}

export function ProfileTestClient({
  instructions,
  profileTest,
}: {
  instructions: ReactNode
  profileTest: DISCProfileTestStatementGroup[]
}) {
  const storageKey = "applicantProfileTestProgress"

  const [hasStarted, setHasStarted] = useState(false)
  const [groupIndex, setGroupIndex] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, GroupAnswer>>({})
  const [completedAt, setCompletedAt] = useState<number | null>(null)
  const [hydratedAnswerSetAnswers, setHydratedAnswerSetAnswers] = useState<
    DISCProfileTestAnswer[] | null
  >(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        hasStarted?: boolean
        groupIndex?: number
        startedAt?: number
        answers?: Record<string, GroupAnswer>
        completedAt?: number
        answerSet?: PersistedAnswerSet
      }

      if (parsed.hasStarted) {
        setHasStarted(true)
      }

      if (typeof parsed.groupIndex === "number" && parsed.groupIndex >= 0) {
        setGroupIndex(parsed.groupIndex)
      }

      if (typeof parsed.startedAt === "number" && parsed.startedAt > 0) {
        setStartedAt(parsed.startedAt)
      }

      if (typeof parsed.completedAt === "number" && parsed.completedAt > 0) {
        setCompletedAt(parsed.completedAt)
      }

      if (
        parsed.answerSet?.startedAt &&
        typeof parsed.answerSet.startedAt === "string"
      ) {
        const revivedStartedAt = Date.parse(parsed.answerSet.startedAt)
        if (!Number.isNaN(revivedStartedAt)) {
          setStartedAt((existing) => existing ?? revivedStartedAt)
        }
      }

      if (
        parsed.answerSet?.completedAt &&
        typeof parsed.answerSet.completedAt === "string"
      ) {
        const revivedCompletedAt = Date.parse(parsed.answerSet.completedAt)
        if (!Number.isNaN(revivedCompletedAt)) {
          setCompletedAt((existing) => existing ?? revivedCompletedAt)
        }
      }

      if (
        parsed.answerSet?.answers &&
        Array.isArray(parsed.answerSet.answers)
      ) {
        setHydratedAnswerSetAnswers(parsed.answerSet.answers)
      }

      if (parsed.answers && typeof parsed.answers === "object") {
        setAnswers(parsed.answers)
      }
    } catch {
      // Ignore malformed localStorage entries.
    }
  }, [])

  useEffect(() => {
    if (!hydratedAnswerSetAnswers) return
    if (!profileTest.length) return

    const next: Record<string, GroupAnswer> = {}

    for (const answer of hydratedAnswerSetAnswers) {
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
  }, [hydratedAnswerSetAnswers, profileTest])

  const answerSet = useMemo(() => {
    if (!startedAt) return null

    const out: DISCProfileTestAnswer[] = []

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

    const completed = completedAt ?? Date.now()
    const set: DISCProfileTestAnswerSet = {
      startedAt: new Date(startedAt),
      completedAt: new Date(completed),
      answers: out,
    }

    return set
  }, [answers, completedAt, profileTest, startedAt])

  useEffect(() => {
    try {
      const persistedAnswerSet: PersistedAnswerSet | null = answerSet
        ? {
            startedAt: answerSet.startedAt.toISOString(),
            completedAt: answerSet.completedAt.toISOString(),
            answers: answerSet.answers,
          }
        : null

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          hasStarted,
          groupIndex,
          startedAt,
          completedAt,
          answerSet: persistedAnswerSet,
        }),
      )
    } catch {
      // Ignore write failures (e.g., storage disabled).
    }
  }, [answerSet, completedAt, groupIndex, hasStarted, startedAt])

  useEffect(() => {
    if (!hasStarted) return
    if (startedAt !== null) return
    setStartedAt(Date.now())
  }, [hasStarted, startedAt])

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

  function handleStart() {
    if (hasStarted) return
    setHasStarted(true)
    if (!startedAt) {
      setStartedAt(Date.now())
    }
  }

  function handleNextGroup() {
    if (!canGoNext) return
    setGroupIndex((prev) => {
      if (prev >= totalGroups - 1) {
        setCompletedAt((existing) => existing ?? Date.now())
        return prev
      }
      return prev + 1
    })
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

  return (
    <div className="space-y-6">
      {!hasStarted ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mt-2 space-y-6 text-sm text-muted-foreground">
            {instructions}
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={handleStart}>
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
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              We appreciate your time.
            </p>
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
          canGoNext={canGoNext}
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
