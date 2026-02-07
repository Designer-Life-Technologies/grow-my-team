import { CheckCircle2 } from "lucide-react"
import ApplicantPublicLayout from "@/app/(applicant)/(public)/layout"

export default function RefereesThankYouPage() {
  return (
    <ApplicantPublicLayout>
      <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>

          <h1 className="text-2xl font-bold">Referees submitted!</h1>
          <p className="mt-3 text-muted-foreground">
            Thanks for sharing your contacts. We&apos;ll reach out to them
            shortly to collect their feedback.
          </p>

          <div className="mt-6 rounded-lg bg-muted/50 p-6 text-left">
            <h2 className="font-semibold">What happens next?</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-base leading-tight">•</span>
                <span>
                  Each referee receives a brief email with instructions to
                  submit their reference.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base leading-tight">•</span>
                <span>
                  Give them a quick heads-up so they know to expect our message
                  and can reply promptly.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </ApplicantPublicLayout>
  )
}
