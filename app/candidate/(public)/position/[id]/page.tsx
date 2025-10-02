import type { Metadata } from "next"
import { Suspense } from "react"
import { PositionDetail, PositionDetailSkeleton } from "@/components/candidate"

type PageProps = {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // In a real app, fetch the position to generate a rich title/description.
  // For now, use the ID as a placeholder.
  return {
    title: `Position ${params.id} | Grow My Team`,
    description: "Position details page",
  }
}

export default async function CandidatePositionDetailPage({
  params,
}: PageProps) {
  const { id } = params

  return (
    <Suspense fallback={<PositionDetailSkeleton />}>
      <PositionDetail positionId={id} />
    </Suspense>
  )
}
