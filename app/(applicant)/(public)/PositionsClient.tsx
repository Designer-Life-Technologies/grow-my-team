"use client"

import Link from "next/link"
import type { ApplicantPublic } from "@/lib/applicant/types"

interface PositionsClientProps {
  vacancies: ApplicantPublic.Position[]
}

export default function PositionsClient({ vacancies }: PositionsClientProps) {
  const results = vacancies

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
      <p className="mt-2 text-muted-foreground">
        Browse our available positions.
      </p>

      {/* Results */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {results.length} position{results.length === 1 ? "" : "s"}
          </p>
        </div>

        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {results.map((vacancy) => {
            const { id, jobDescription } = vacancy
            return (
              <li
                key={id}
                className="rounded-lg border bg-card p-5 flex flex-col"
              >
                <div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {jobDescription.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {jobDescription.location} · {jobDescription.type}
                  </p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {jobDescription.salary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {jobDescription.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <Link
                    href={`/position/${id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
                  >
                    View details
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
