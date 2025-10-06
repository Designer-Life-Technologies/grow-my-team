"use client"

import { IconLogout, IconUser } from "@tabler/icons-react"
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
 * Displays a user menu for applicants showing their name, email,
 * and logout option. Only visible when an applicant is logged in.
 *
 * Features:
 * - Avatar with initials
 * - User name and email display
 * - Logout functionality
 * - Dropdown menu interface
 */
export function ApplicantUserMenu() {
  const { isApplicant, user } = useApplicantSession()

  // Don't show menu if not an applicant
  if (!isApplicant || !user) {
    return null
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
