"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import type { DISCProfileTestStatementGroup } from "@/lib/applicant"

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return `${mm}:${ss}`
}

export function TestSequenceClient({
  currentGroup,
  groupIndex,
  totalGroups,
  startedAt,
  mostIndex,
  leastIndex,
  canGoNext,
  onSelectMost,
  onSelectLeast,
  onNext,
}: {
  currentGroup: DISCProfileTestStatementGroup | undefined
  groupIndex: number
  totalGroups: number
  startedAt: number | null
  mostIndex: number | null
  leastIndex: number | null
  canGoNext: boolean
  onSelectMost: (index: number) => void
  onSelectLeast: (index: number) => void
  onNext: () => void
}) {
  const [now, setNow] = useState(() => Date.now())

  const isLastGroup = groupIndex >= totalGroups - 1

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const elapsedSeconds = useMemo(() => {
    if (!startedAt) return 0
    return Math.max(0, Math.floor((now - startedAt) / 1000))
  }, [now, startedAt])

  const elapsedLabel = useMemo(() => {
    if (!startedAt) return "00:00"
    return formatElapsed(elapsedSeconds)
  }, [elapsedSeconds, startedAt])

  const elapsedClassName = useMemo(() => {
    if (elapsedSeconds >= 10 * 60) return "text-destructive"
    if (elapsedSeconds >= 7 * 60) return "text-amber-500 dark:text-amber-400"
    return "text-primary"
  }, [elapsedSeconds])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Quick reminder</div>
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

          <div className="space-y-2">
            {currentGroup?.statements?.length ? (
              <ul className="space-y-2">
                {currentGroup.statements.map((s, idx) => {
                  const isMost = mostIndex === idx
                  const isLeast = leastIndex === idx

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
                            onClick={() => onSelectMost(idx)}
                            aria-pressed={isMost}
                          >
                            Most
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={isLeast ? "default" : "outline"}
                            onClick={() => onSelectLeast(idx)}
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
              onClick={onNext}
              disabled={!canGoNext}
            >
              {isLastGroup ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
