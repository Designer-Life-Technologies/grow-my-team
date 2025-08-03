import { Suspense } from "react"
import { ProfileDisplay, SessionData } from "@/components/auth"

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl">
        <SessionData />
      </div>

      <div className="w-full max-w-5xl">
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileDisplay />
        </Suspense>
      </div>
    </main>
  )
}
