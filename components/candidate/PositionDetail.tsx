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
 * Used as a Suspense fallback while position data is being fetched.
 *
 * Features:
 * - Matches PositionDetail structure
 * - Theme-aware skeleton colors
 * - Smooth pulse animation
 */
export function PositionDetailSkeleton() {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>

      <header>
        <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-muted" />
      </header>

      <div className="mt-8 grid gap-6">
        <div className="rounded-lg border bg-card p-5">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-4 h-9 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </section>
  )
}

export async function PositionDetail({ positionId }: PositionDetailProps) {
  // Fetch position data
  const vacancy = await getPositionById(positionId)

  // Show 404 if position not found
  if (!vacancy || !vacancy.jobDescription) {
    notFound()
  }

  const { jobDescription, candidateSourcing } = vacancy

  return (
    <section className="mx-auto max-w-3xl">
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
          {jobDescription.title || "Untitled Position"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {jobDescription.location || "Location not specified"}
        </p>
      </header>

      <div className="mt-8 grid gap-6">
        {/* Overview Section */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Overview</h2>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            {jobDescription.title && (
              <p>
                <span className="font-medium text-foreground">Title:</span>{" "}
                {jobDescription.title}
              </p>
            )}
            {jobDescription.type && (
              <p>
                <span className="font-medium text-foreground">Type:</span>{" "}
                {jobDescription.type.replace(/_/g, " ")}
              </p>
            )}
            {jobDescription.workplaceType && (
              <p>
                <span className="font-medium text-foreground">Workplace:</span>{" "}
                {jobDescription.workplaceType.replace(/_/g, " ")}
              </p>
            )}
            {jobDescription.location && (
              <p>
                <span className="font-medium text-foreground">Location:</span>{" "}
                {jobDescription.location}
              </p>
            )}
            {jobDescription.seniority && (
              <p>
                <span className="font-medium text-foreground">Seniority:</span>{" "}
                {jobDescription.seniority}
              </p>
            )}
            {jobDescription.industry && (
              <p>
                <span className="font-medium text-foreground">Industry:</span>{" "}
                {jobDescription.industry}
              </p>
            )}
            {jobDescription.salary && (
              <p>
                <span className="font-medium text-foreground">Salary:</span>{" "}
                {jobDescription.salary}
              </p>
            )}
            {jobDescription.skills && jobDescription.skills.length > 0 && (
              <p>
                <span className="font-medium text-foreground">Skills:</span>{" "}
                {jobDescription.skills.join(", ")}
              </p>
            )}
            {jobDescription.qualifications &&
              jobDescription.qualifications.length > 0 && (
                <p>
                  <span className="font-medium text-foreground">
                    Qualifications:
                  </span>{" "}
                  {jobDescription.qualifications.join(", ")}
                </p>
              )}
          </div>
        </div>

        {/* Job Advert Section */}
        {candidateSourcing?.advert && (
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">
              {candidateSourcing.advert.title || "About this role"}
            </h2>
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content from API is trusted
              dangerouslySetInnerHTML={{
                __html: candidateSourcing.advert.copy,
              }}
            />
          </div>
        )}

        {/* Application Section */}
        {candidateSourcing?.status === "OPEN" && (
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">How to apply</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This position is currently accepting applications. Click below to
              start your application.
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="h-9 rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
              >
                Apply now
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
