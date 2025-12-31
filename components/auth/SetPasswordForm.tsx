"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/utils/logger"
import { ClientLogo } from "../layout"

// A simple Set Password form shown after signup.
// Backend integration is not implemented yet; wire to your API when available.
export function SetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      // TODO: Call your backend to set the password
      logger.info("Set password request", { length: formData.password.length })

      setSuccess("Your password has been set. You can now sign in.")
      setIsLoading(false)

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 800)
    } catch (err) {
      logger.error("Set password error:", err)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card
        className={cn(
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-4 motion-safe:duration-300 motion-safe:ease-out",
          "motion-reduce:transition-none motion-reduce:transform-none",
        )}
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ClientLogo />
          </div>
          <CardTitle>
            Set your {currentTheme.branding.companyName} password
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-600/10 border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-sm rounded-md">
                  {success}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Set password"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
