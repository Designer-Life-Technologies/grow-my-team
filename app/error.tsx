"use client"

import { TriangleAlert } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error is already logged by instrumentation.ts
    // We can also double-log to console here for client-side debugging if needed
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/20">
        <TriangleAlert className="h-10 w-10 text-yellow-500" />
      </div>
      <h2 className="mb-4 text-2xl font-bold tracking-tight">
        Something went wrong!
      </h2>
      <p className="mb-8 text-muted-foreground">
        We apologize for the inconvenience. Please try again.
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  )
}
