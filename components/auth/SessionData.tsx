"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SessionData() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading session data...</p>
        </CardContent>
      </Card>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto">
            <code>{JSON.stringify(session, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
