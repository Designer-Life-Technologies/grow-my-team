import { getCurrentUserProfile } from "@/lib/user/actions"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export async function ProfileDisplay() {
  const user = await getCurrentUserProfile()

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto">
            <code>{JSON.stringify(user, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
