"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { Candidate } from "@/lib/candidate/types"

interface PositionsClientProps {
  vacancies: Candidate.Position[]
}

export default function PositionsClient({ vacancies }: PositionsClientProps) {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState<string | "">("")
  const [remoteOnly, setRemoteOnly] = useState(false)

  // Filter vacancies based on search criteria
  const results = useMemo(() => {
    return vacancies.filter((vacancy) => {
      const { jobDescription } = vacancy
      const q = query.trim().toLowerCase()
      const matchesQuery = !q
        ? true
        : [
            jobDescription.title,
            jobDescription.industry,
            ...jobDescription.skills,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)

      const l = location.trim().toLowerCase()
      const matchesLocation = !l
        ? true
        : jobDescription.location.toLowerCase().includes(l)

      const matchesType = jobType ? jobDescription.type === jobType : true

      const matchesRemote = remoteOnly
        ? jobDescription.workplaceType === "REMOTE"
        : true

      return matchesQuery && matchesLocation && matchesType && matchesRemote
    })
  }, [vacancies, query, location, jobType, remoteOnly])

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
      <p className="mt-2 text-muted-foreground">
        Search and filter roles that match your skills and goals.
      </p>

      {/* Search and filters */}
      <div className="mt-6 rounded-lg border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="query" className="text-sm font-medium">
              Keyword
            </label>
            <input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, company, tag..."
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote, city, country..."
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobType" className="text-sm font-medium">
              Job Type
            </label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <input
              id="remoteOnly"
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            <label htmlFor="remoteOnly" className="text-sm">
              Remote only
            </label>
          </div>
        </div>
      </div>

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
