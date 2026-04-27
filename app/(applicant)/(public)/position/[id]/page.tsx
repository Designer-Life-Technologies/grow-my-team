import type { Metadata } from "next"
import { Suspense } from "react"
import { PositionDetail, PositionDetailSkeleton } from "@/components/applicant"
import { resolveClientConfig } from "@/lib/config/client-config"

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

  let organisationId: string | null = null

  if (urlOrganisationId) {
    // Use URL parameter if provided (for testing)
    organisationId = urlOrganisationId
    console.log(
      `[PositionDetailPage] Using organisationId from URL: ${organisationId}`,
    )
  } else {
    // Use unified client config resolver
    const config = await resolveClientConfig(paramsData)
    organisationId = config.organisationId
    console.log(
      `[PositionDetailPage] Organisation ID from config: ${organisationId}`,
    )
  }

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
