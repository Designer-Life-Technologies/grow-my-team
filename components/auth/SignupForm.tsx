"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/lib/theme"
import { registerUser } from "@/lib/user/actions"
import { cn } from "@/lib/utils"

import { ClientLogo } from "../layout"

// Signup form collects basic user info. Actual registration endpoint
// is not implemented yet. Wire this to your backend when available.
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerUser({
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        organisations: formData.companyName
          ? [
              {
                organisation: { name: formData.companyName },
                roles: [],
              },
            ]
          : undefined,
      })

      if (result.success) {
        setSuccess("Account created. Please set your password.")
        setIsLoading(false)
        setTimeout(() => {
          router.push("/set-password")
        }, 800)
      } else {
        setError(result.errorMessage || result.error || "Registration failed")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card
        className={cn(
          // Smooth, premium entrance on mount
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-4 motion-safe:duration-300 motion-safe:ease-out",
          // Respect reduced motion preferences
          "motion-reduce:transition-none motion-reduce:transform-none",
        )}
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ClientLogo />
          </div>
          <CardTitle>
            Create your {currentTheme.branding.companyName} account
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
                <Label htmlFor="companyName">Company name (optional)</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
