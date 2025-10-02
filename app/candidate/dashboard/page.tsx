import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Candidate Home | Grow My Team",
  description: "Public candidate landing page",
}

export default function CandidateHomePage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">
        Private Candidate Dashboard - Will Require Candidate Authentication
      </h1>
      <p className="mt-3 text-muted-foreground">
        This is the public candidate home page. Replace this placeholder text
        with real content, such as an overview of the candidate experience,
        links to create a profile, and helpful resources.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Create Your Profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Showcase your experience, skills, and achievements to potential
            employers.
          </p>
        </div>
        <Link className="rounded-lg border bg-card p-5" href="/candidate">
          <h2 className="text-lg font-semibold">Explore Opportunities</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse open roles and find positions that match your goals and
            interests.
          </p>
        </Link>
      </div>
    </section>
  )
}
