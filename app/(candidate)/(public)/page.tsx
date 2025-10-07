import type { Metadata } from "next"
import { getOpenPositions } from "@/lib/candidate"
import PositionsClient from "./PositionsClient"

export const metadata: Metadata = {
  title: "Positions | Grow My Team",
  description: "Search and browse open positions",
}

export default async function CandidatePositionsPage() {
  // Fetch open positions from the API
  const positions = await getOpenPositions()

  return <PositionsClient vacancies={positions} />
}
