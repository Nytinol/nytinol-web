"use client"

import { useEffect, useState } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { ChevronUp, LogIn, Sparkles, User } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraphExplorer } from "@/components/graph-explorer"

export function AppSidebar() {
  const { openUserProfile, signOut } = useClerk()
  const { user } = useUser()
  const displayName = user?.fullName || user?.username || "Your account"
  const email = user?.primaryEmailAddress?.emailAddress || ""
  const initials = displayName.slice(0, 2).toUpperCase()
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  useEffect(() => {
    function updateGenerating(event: Event) {
      setIsGeneratingSuggestions(Boolean((event as CustomEvent<{ generating?: boolean }>).detail?.generating))
    }

    window.addEventListener("graph:generating-suggestions", updateGenerating)
    window.dispatchEvent(new CustomEvent("graph:request-generating"))
    return () => window.removeEventListener("graph:generating-suggestions", updateGenerating)
  }, [])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                N
              </span>
              <span className="font-semibold group-data-[collapsible=icon]:hidden">
                Nytinol
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <GraphExplorer />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
          <Button
            className="w-full"
            disabled={isGeneratingSuggestions}
            onClick={() => {
              setIsGeneratingSuggestions(true)
              window.dispatchEvent(new CustomEvent("graph:generate-suggestions"))
            }}
            size="sm"
          >
            <Sparkles data-icon="inline-start" />
            {isGeneratingSuggestions ? "Generating..." : "Generate Suggestions"}
          </Button>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg">
                    <span
                      aria-label={`${displayName} profile picture`}
                      className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                      role="img"
                    >
                      {user?.imageUrl ? (
                        <span
                          aria-hidden="true"
                          className="size-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${user.imageUrl})` }}
                        />
                      ) : (
                        initials
                      )}
                    </span>

                    <span className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                      <span className="font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {email}
                      </span>
                    </span>

                    <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>

                  <DropdownMenuItem onClick={() => openUserProfile()}>
                    <User />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => void signOut({ redirectUrl: "/" })}>
                    <LogIn />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}