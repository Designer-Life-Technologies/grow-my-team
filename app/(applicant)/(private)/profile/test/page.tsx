// Dummy applicant-only personality profile test page.
// Reads an optional nonce from the URL (?n=...) for future exchange into an applicant JWT.
import { redirect } from "next/navigation"
import { getApplicantProfileTest } from "@/lib/applicant"
import { getApplicantSessionServer } from "@/lib/auth/actions"
import { ProfileTestClient } from "./ProfileTestClient"

export default async function ApplicantPersonalityProfileTestPage({
  searchParams,
}: {
  searchParams?: Promise<{ n?: string; applicantId?: string; email?: string }>
}) {
  const { isApplicant } = await getApplicantSessionServer()

  const resolvedSearchParams = await searchParams
  const nonce = resolvedSearchParams?.n ?? null
  const applicantId = resolvedSearchParams?.applicantId
  const email = resolvedSearchParams?.email

  if (!isApplicant && nonce && (applicantId || email)) {
    const callbackUrl = new URLSearchParams({
      n: nonce,
      next: "/profile/test",
    })

    if (applicantId) callbackUrl.set("applicantId", applicantId)
    if (email) callbackUrl.set("email", email)

    redirect(`/auth/callback?${callbackUrl.toString()}`)
  }

  if (!isApplicant) {
    redirect("/applicant/login")
  }

  const _profileTest = await getApplicantProfileTest().catch(
    (error: unknown) => {
      if (
        error instanceof Error &&
        (error as { status?: number }).status === 401
      ) {
        redirect("/applicant/login")
      }
      throw error
    },
  )

  return (
    <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Personality Profile Questionnaire
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Position: Senior Product Designer
        </p>
      </header>

      <div className="mt-8 grid gap-6">
        <ProfileTestClient
          profileTest={_profileTest}
          instructions={
            <>
              <div className="space-y-2">
                <p>
                  Thank you for taking the time to complete this Personality
                  Profile Questionnaire as part of your job application.
                </p>
                <p>
                  <strong>
                    Please read the following instructions carefully before
                    starting the questionnaire.
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
                    The questionnaire consists of 24 groups, each containing 4
                    short behavioral statements.
                  </li>
                  <li>
                    For each group, you will select:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>
                        One statement that is <strong>MOST</strong> like you in
                        a professional or work-related setting (e.g., how you
                        typically behave at work).
                      </li>
                      <li>
                        One statement that is <strong>LEAST</strong> like you in
                        the same setting.
                      </li>
                    </ul>
                  </li>
                  <li>
                    You must choose exactly one &quot;Most&quot; and one
                    &quot;Least&quot; per group—the other two statements will
                    remain unselected.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  How to approach the questionnaire
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Focus on a work or professional setting when
                    responding—think about how you behave in job-related
                    situations, not personal or social ones.
                  </li>
                  <li>
                    Be honest and instinctive: Go with your first gut reaction
                    rather than overthinking. This ensures the results
                    accurately reflect your true preferences.
                  </li>
                  <li>
                    Read all four statements in a group carefully before
                    selecting, but don&apos;t spend too much time deliberating.
                  </li>
                  <li>
                    Remember, this is a self-assessment tool for insight, not a
                    pass/fail test. Your responses are confidential and will be
                    used solely to evaluate job fit.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  Time guidelines
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Aim to complete the assessment in{" "}
                    <strong>7 to 10 minutes</strong>. This timeframe encourages
                    natural, spontaneous answers without rushing or
                    overanalyzing. If it takes a bit longer, that&apos;s okay,
                    but try to stay close to this range for the best results.
                  </li>
                  <li>
                    <p>
                      The entire questionnaire has to be completed in one
                      sitting. Once started, it must be completed and can not be
                      paused, restarted, or resumed at a later time.
                    </p>
                    <div className="h-2" />
                    <p>
                      Make sure you have enough time to complete the
                      questionnaire before clicking <strong>Start</strong>{" "}
                      below.
                    </p>
                  </li>
                </ul>
                <p>Good luck!</p>
              </div>
            </>
          }
        />
      </div>
    </section>
  )
}
