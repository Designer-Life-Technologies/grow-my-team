// Dummy applicant-only personality profile test page.
// Reads an optional nonce from the URL (?n=...) for future exchange into an applicant JWT.

import { IconLoader2 } from "@tabler/icons-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import ApplicantPublicLayout from "@/app/(applicant)/(public)/layout"
import { getPositionById } from "@/lib/applicant"
import { getApplicantSessionServer } from "@/lib/auth/actions"
import { getApplicationProfileTest } from "@/lib/profiletest"
import { DISCQuestionnaire } from "./DISCQuestionnaire"

export default async function ApplicantPersonalityProfileTestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Get application ID from URL parameters
  const { id } = await params
  const { isApplicant, isApplicationUser, user } =
    await getApplicantSessionServer()

  // Check that the user is an applicant or application user
  if (!isApplicant && !isApplicationUser) {
    const nextParam = encodeURIComponent(`/application/${id}/profiletest`)
    redirect(`/application/${id}/pin?next=${nextParam}`)
  }

  // Get vacancy details for this application (from public API endpoint)
  const vacancy = user?.vacancyId ? await getPositionById(user.vacancyId) : null
  const positionTitle =
    vacancy?.candidateSourcing?.advert?.title ||
    vacancy?.jobDescription?.title ||
    ""

  return (
    <ApplicantPublicLayout>
      <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Personality Profile Questionnaire
          </h1>
          <p className="mt-2 text-base font-semibold text-foreground">
            {positionTitle}
          </p>
        </header>

        <div className="mt-8 grid gap-6">
          <Suspense fallback={<ProfileTestLoading />}>
            <ProfileTestSection
              applicationId={id}
              applicantFirstName={user?.firstname}
            />
          </Suspense>
        </div>
      </section>
    </ApplicantPublicLayout>
  )
}

async function ProfileTestSection({
  applicationId,
  applicantFirstName,
}: {
  applicationId: string
  applicantFirstName?: string | null
}) {
  const profileTest = await getApplicationProfileTest(applicationId).catch(
    (error: unknown) => {
      if (
        error instanceof Error &&
        (error as { status?: number }).status === 401
      ) {
        const nextParam = encodeURIComponent(
          `/application/${applicationId}/profiletest`,
        )
        redirect(`/application/${applicationId}/pin?next=${nextParam}`)
      }
      throw error
    },
  )

  return (
    <DISCQuestionnaire
      applicationId={applicationId}
      profileTest={profileTest}
      instructions={getProfileTestInstructions(applicantFirstName)}
    />
  )
}

// Loading indicator
// We will move this to a shared component later
function ProfileTestLoading() {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Loading Questionnaire…</p>
        </div>
        <div className="w-full space-y-3">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted/40" />
          <div className="h-24 w-full animate-pulse rounded bg-muted/30" />
        </div>
      </div>
    </div>
  )
}

function getProfileTestInstructions(firstName?: string | null) {
  return (
    <>
      <div className="space-y-2">
        <p>{firstName ? `Hi ${firstName},` : "Hi there,"}</p>
        <p>
          Thank you for taking the time to complete this Personality Profile
          Questionnaire as part of your job application.
        </p>
        <p>
          <strong>
            Please read the following instructions carefully before starting the
            questionnaire.
          </strong>
        </p>
        <p>
          This assessment helps us understand your natural behavioral
          preferences in a work setting, such as how you approach tasks,
          interact with others, handle challenges, and make decisions.
        </p>
        <p>
          There are no right or wrong answers—your responses will simply
          highlight your unique style.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">
          How the questionnaire works
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            The questionnaire consists of 24 groups, each containing 4 short
            behavioral statements.
          </li>
          <li>
            For each group, you will select:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                One statement that is <strong>MOST</strong> like you in a
                professional or work-related setting (e.g., how you typically
                behave at work).
              </li>
              <li>
                One statement that is <strong>LEAST</strong> like you in the
                same setting.
              </li>
            </ul>
          </li>
          <li>
            You must choose exactly one &quot;Most&quot; and one
            &quot;Least&quot; per group—the other two statements will remain
            unselected.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">
          How to approach the questionnaire
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Focus on a work or professional setting when responding—think about
            how you behave in job-related situations, not personal or social
            ones.
          </li>
          <li>
            Be honest and instinctive: Go with your first gut reaction rather
            than overthinking. This ensures the results accurately reflect your
            true preferences.
          </li>
          <li>
            Read all four statements in a group carefully before selecting, but
            don&apos;t spend too much time deliberating.
          </li>
          <li>
            Remember, this is a self-assessment tool for insight, not a
            pass/fail test. Your responses are confidential and will be used
            solely to evaluate job fit.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Time guidelines</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Aim to complete the assessment in <strong>7 to 10 minutes</strong>.
            This timeframe encourages natural, spontaneous answers without
            rushing or overanalyzing. If it takes a bit longer, that&apos;s ok,
            but try to stay close to this range for the best results.
          </li>
          <li>
            <p>
              The entire questionnaire has to be completed in one sitting.{" "}
              <strong>
                Once started, it must be completed and can not be paused,
                restarted, or resumed at a later time.
              </strong>
            </p>
            <div className="h-2" />
            <p>
              Make sure you have enough time to complete the questionnaire
              before clicking <strong>Start</strong> below.
            </p>
          </li>
        </ul>
        <p>Good luck!</p>
      </div>
    </>
  )
}
