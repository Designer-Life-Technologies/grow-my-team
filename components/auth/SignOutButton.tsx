"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const { status } = useSession()

  if (status !== "authenticated") {
    return null
  }

  return (
    <Button
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </Button>
  )
}
