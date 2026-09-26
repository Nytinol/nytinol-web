import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex min-h-svh min-w-0 flex-1 flex-col">
        <SidebarTrigger className="absolute left-3 top-3 z-50 bg-background/80 backdrop-blur-sm" />
        <div className="min-h-0 flex-1">{children}</div>
      </main>
    </SidebarProvider>
  )
}