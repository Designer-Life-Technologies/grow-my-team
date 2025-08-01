"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentTheme, isDark } = useTheme()

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          {/* Theme-aware logo */}
          <div className="flex justify-center mb-4">
            <Image
              src={
                isDark
                  ? currentTheme.branding.logo.dark
                  : currentTheme.branding.logo.light
              }
              alt={currentTheme.branding.companyName}
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
          <CardTitle>Welcome to {currentTheme.branding.companyName}</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline bg-transparent border-none p-0 text-muted-foreground"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input id="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="underline underline-offset-4 bg-transparent border-none p-0 text-primary hover:text-primary/80"
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
