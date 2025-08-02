"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

import { fetchUserData, updateUserProfile } from "@/app/actions/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserProfileData {
  name: string
  bio: string
}

export function UserProfile() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserProfileData>({
    name: "",
    bio: "",
  })

  // Function to load user data using server action
  const loadUserData = async () => {
    setLoading(true)
    try {
      const data: UserProfileData = await fetchUserData()
      setUserData(data)
      if (data) {
        setFormData(data) // Populate form with fetched data
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to update profile using server action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUserProfile(formData)
      await loadUserData() // Refresh data after update
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Display client-side session data */}
          <div>
            <h3 className="text-lg font-medium">Client-Side Session Data:</h3>
            <p>User ID: {session.user.id}</p>
            <p>Name: {session.user.name}</p>
            <p>Email: {session.user.email}</p>
            {/* Notice: No access token is available here */}
          </div>

          {/* Button to load additional user data from server */}
          <div>
            <Button onClick={loadUserData} disabled={loading}>
              {loading ? "Loading..." : "Load User Data from API"}
            </Button>
          </div>

          {/* Display server-fetched data */}
          {userData && (
            <div>
              <h3 className="text-lg font-medium">Server-Fetched Data:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}

          {/* Form to update profile */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">Update Profile</h3>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Enter your bio"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
