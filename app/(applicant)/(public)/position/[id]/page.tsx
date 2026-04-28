import type { Metadata } from "next"
import { headers } from "next/headers"
import { Suspense } from "react"
import { PositionDetail, PositionDetailSkeleton } from "@/components/applicant"
import { getOrganisationId } from "@/lib/api/context"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ organisationId?: string; theme?: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  // In a real app, fetch the position to generate a rich title/description.
  // For now, use the ID as a placeholder.
  return {
    title: `Position ${id} | Grow My Team`,
    description: "Position details page",
  }
}

export default async function ApplicantPositionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const paramsData = await searchParams
  const urlOrganisationId = paramsData.organisationId

  // Use URL parameter if provided, then AsyncLocalStorage context, then middleware header
  let organisationId = urlOrganisationId || getOrganisationId()
  if (!organisationId) {
    const headersList = await headers()
    const headerOrgId = headersList.get("X-OrganisationId")
    if (headerOrgId) organisationId = headerOrgId
  }

  return (
    <Suspense fallback={<PositionDetailSkeleton />}>
      <PositionDetail
        positionId={id}
        organisationId={organisationId || undefined}
      />
    </Suspense>
  )
}
