"use client"

import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * ApplicationSuccess Component
 *
 * Success message displayed after an application has been successfully submitted.
 * Provides confirmation and next steps information to the applicant.
 *
 * Features:
 * - Success icon and message
 * - Next steps information
 * - Navigation options
 */

interface ApplicationSuccessProps {
  /**
   * Position title that was applied to
   */
  positionTitle: string
  /**
   * Position ID for navigation
   */
  positionId: string
  /**
   * Applicant's email address
   */
  applicantEmail?: string
}

export function ApplicationSuccess({
  positionTitle,
  positionId,
  applicantEmail,
}: ApplicationSuccessProps) {
  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
        </div>

        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="mt-3 text-muted-foreground">
          Thank you for applying for the <strong>{positionTitle}</strong>{" "}
          position.
        </p>

        <div className="mt-6 rounded-lg bg-muted/50 p-6 text-left">
          <h3 className="font-semibold">What happens next?</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Our team will review your application and resume carefully
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                You will receive a confirmation email
                {applicantEmail && (
                  <>
                    {" "}
                    at{" "}
                    <strong className="text-foreground">
                      {applicantEmail}
                    </strong>
                  </>
                )}{" "}
                shortly
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                If your profile matches our requirements, we'll contact you to
                schedule an interview
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Please check your email regularly, including your spam folder
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href={`/candidate/position/${positionId}`}>
              View Position Details
            </Link>
          </Button>
          <Button asChild>
            <Link href="/candidate">Browse More Positions</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          We appreciate your interest in joining our team!
        </p>
      </div>
    </div>
  )
}
