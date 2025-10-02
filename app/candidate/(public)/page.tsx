import type { Metadata } from "next"
import PositionsClient from "./PositionsClient"

export const metadata: Metadata = {
  title: "Positions | Grow My Team",
  description: "Search and browse open positions",
}

export default function CandidatePositionsPage() {
  return <PositionsClient />
}
