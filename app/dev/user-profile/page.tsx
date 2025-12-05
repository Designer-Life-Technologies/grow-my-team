import { Suspense } from "react"
import { ProfileDisplay, SessionData } from "@/components/auth"

// Force dynamic rendering since this page uses cookies
export const dynamic = "force-dynamic"

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl">
        <SessionData />
      </div>

      <div className="w-full max-w-5xl pt-4">
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileDisplay />
        </Suspense>
      </div>
    </main>
  )
}
