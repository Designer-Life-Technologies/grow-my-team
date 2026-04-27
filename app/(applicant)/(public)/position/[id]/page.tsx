import type { Metadata } from "next"
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

  // Use URL parameter if provided (for testing), otherwise get from global context
  const organisationId = urlOrganisationId || getOrganisationId()

  console.log(
    `[PositionDetailPage] ✓ Using organisationId: ${organisationId || "none"}`,
  )

  return (
    <Suspense fallback={<PositionDetailSkeleton />}>
      <PositionDetail
        positionId={id}
        organisationId={organisationId || undefined}
      />
    </Suspense>
  )
}
