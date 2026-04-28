import type { Metadata } from "next"
import { headers } from "next/headers"
import { getOrganisationId } from "@/lib/api/context"
import { getOpenPositions } from "@/lib/applicant"
import PositionsClient from "./PositionsClient"

export const metadata: Metadata = {
  title: "Positions | Grow My Team",
  description: "Search and browse open positions",
}

export default async function ApplicantPositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ organisationId?: string; theme?: string }>
}) {
  const params = await searchParams
  const urlOrganisationId = params.organisationId

  // Use URL parameter if provided, then AsyncLocalStorage context, then middleware header
  let organisationId = urlOrganisationId || getOrganisationId()
  if (!organisationId) {
    const headersList = await headers()
    const headerOrgId = headersList.get("X-OrganisationId")
    if (headerOrgId) organisationId = headerOrgId
  }

  // Fetch open positions from the API, filtered by organisation if available
  const positions = await getOpenPositions(organisationId || undefined)

  return <PositionsClient vacancies={positions} />
}
