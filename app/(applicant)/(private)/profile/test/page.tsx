// Dummy applicant-only personality profile test page.
// Reads an optional nonce from the URL (?n=...) for future exchange into an applicant JWT.
import { redirect } from "next/navigation"
import { getApplicantSessionServer } from "@/lib/auth/actions"

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
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Personality Profile Test</h1>
          <p className="text-sm text-muted-foreground">
            Not signed in (temporary test mode). Add a nonce to the URL to test
            the exchange.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Nonce</div>
          <div className="mt-1 break-all text-sm text-muted-foreground">
            {nonce ? nonce : "(none provided)"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Personality Profile Test</h1>
        <p className="text-sm text-muted-foreground">
          This is a placeholder questionnaire page. Authentication + nonce
          exchange will be implemented next.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Nonce</div>
        <div className="mt-1 break-all text-sm text-muted-foreground">
          {nonce ? nonce : "(none provided)"}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Questionnaire (dummy)</div>
        <div className="mt-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm">1) I enjoy working in teams.</div>
            <div className="text-sm text-muted-foreground">
              Placeholder: Likert scale input will go here.
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-sm">2) I prefer structured tasks.</div>
            <div className="text-sm text-muted-foreground">
              Placeholder: Likert scale input will go here.
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-sm">3) I stay calm under pressure.</div>
            <div className="text-sm text-muted-foreground">
              Placeholder: Likert scale input will go here.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
