"use client"

import { IconLogin, IconLogout, IconUser } from "@tabler/icons-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApplicantSession } from "@/hooks/use-applicant-session"

/**
 * ApplicantUserMenu Component
 *
 * Displays applicant authentication controls in the header.
 * - When an applicant is logged in, shows avatar dropdown with logout option.
 * - When no applicant session exists, shows a login link that points to the applicant login page.
 *
 * Features:
 * - Avatar with initials
 * - User name and email display
 * - Logout functionality
 * - Dropdown menu interface
 */
export function ApplicantUserMenu() {
  const { isApplicant, isApplicationUser, user } = useApplicantSession()

  // Application-scoped users should not see the applicant menu at all
  if (isApplicationUser) {
    return null
  }

  if (!isApplicant || !user) {
    return null
    // Currently disabled until the applicant login page is implemented
    // return (
    //   <Link
    //     href="/applicant/login"
    //     className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
    //   >
    //     <IconLogin className="h-4 w-4" />
    //     Login
    //   </Link>
    // )
  }

  // Generate user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("")
  }

  const userName = user.name || "Applicant"
  const userEmail = user.email || ""
  const userInitials = getInitials(userName)

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <IconUser className="mr-2 h-4 w-4" />
          <span>My Applications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
