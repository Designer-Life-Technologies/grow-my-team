import Link from "next/link"
import { notFound } from "next/navigation"
import { getPositionById } from "@/lib/candidate"

/**
 * PositionDetail Component
 *
 * Server component that displays detailed information about a job position.
 * Fetches position data using the positionId and handles not-found cases.
 *
 * Features:
 * - Fetches position data from server action
 * - Back navigation link
 * - Position overview with key details
 * - Full job description
 * - Application instructions and CTA
 * - Automatic 404 handling for invalid positions
 */

interface PositionDetailProps {
  /**
   * Position ID to fetch and display
   */
  positionId: string
}

/**
 * PositionDetailSkeleton Component
 *
 * Loading skeleton that matches the PositionDetail layout.
 * Used as a loading state while position data is being fetched.
 */
export function PositionDetailSkeleton() {
  return (
    <section className="mx-auto max-w-3xl opacity-60">
      <div className="mb-6">
        <div className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
      </div>

      <header>
        <div className="h-9 w-3/4 animate-pulse rounded bg-foreground/10" />
      </header>

      <div className="mt-8 grid gap-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-4">
            {/* Paragraph 1 */}
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-foreground/10" />
            </div>

            {/* Heading */}
            <div className="h-5 w-2/5 animate-pulse rounded bg-foreground/10" />

            {/* Paragraph 2 */}
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-foreground/10" />
            </div>

            {/* Heading */}
            <div className="h-5 w-1/3 animate-pulse rounded bg-foreground/10" />

            {/* Paragraph 3 */}
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-foreground/10" />
            </div>

            {/* Paragraph 4 */}
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-foreground/10" />
            </div>
          </div>

          {/* Apply button skeleton */}
          <div className="mt-6 flex justify-end">
            <div className="h-9 w-24 animate-pulse rounded-md bg-foreground/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export async function PositionDetail({ positionId }: PositionDetailProps) {
  // Fetch position data
  const vacancy = await getPositionById(positionId)

  // Show 404 if position not found
  if (!vacancy || !vacancy.candidateSourcing?.advert) {
    notFound()
  }

  const { candidateSourcing } = vacancy

  return (
    <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
      <div className="mb-6">
        <Link
          href="/candidate"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to positions
        </Link>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {candidateSourcing?.advert.title || "Untitled Position"}
        </h1>
      </header>

      <div className="mt-8 grid gap-6">
        {/* Job Advert Section */}
        <div className="rounded-lg border bg-card p-5">
          <div
            className="prose-html"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content from API is trusted
            dangerouslySetInnerHTML={{
              __html: candidateSourcing?.advert?.copy || "",
            }}
          />
          <div className="mt-6 flex justify-end">
            <Link
              href={`/candidate/position/${positionId}/apply`}
              className="inline-flex h-9 items-center rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
            >
              Apply now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
