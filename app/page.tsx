import { redirect } from "next/navigation"

export default function Home() {
  // Redirect root ("/") to the dashboard. This is a server component so it can
  // use Next.js redirect and works seamlessly with Next-Auth middleware.
  redirect("/dashboard")
}
