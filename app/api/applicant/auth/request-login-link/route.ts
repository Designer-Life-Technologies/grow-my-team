/**
 * Dummy API route for requesting an applicant login link by email.
 *
 * This will later call the GetMeVideo API to generate a login link and email it
 * to the applicant.
 */
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string
  } | null

  const email = body?.email?.trim()

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  // Dummy implementation: this will later call the GetMeVideo API to generate
  // a login link and send it to the applicant.
  return NextResponse.json({ ok: true }, { status: 200 })
}
