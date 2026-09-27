"use client"

import { useUser } from "@clerk/nextjs"
import { ChevronUp, LogIn, Settings, User } from "lucide-react"

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
  const { user } = useUser()
  const displayName = user?.fullName || user?.username || "Your account"
  const initials = displayName.slice(0, 2).toUpperCase()

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
                        john@example.com
                      </span>
                    </span>

                    <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>

                  <DropdownMenuItem>
                    <User />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Settings />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem>
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