import { useState } from "react"
import { Home, Inbox, Settings, Users } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox, badge: "4" },
  { id: "team", label: "Team", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
]

function AppSidebar() {
  const [active, setActive] = useState("inbox")
  return (
    <SidebarProvider className="min-h-0 w-full max-w-xl overflow-hidden rounded-lg border">
      <Sidebar collapsible="none" className="border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ITEMS.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton isActive={active === item.id} onClick={() => setActive(item.id)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="hidden flex-1 bg-background p-6 text-sm text-muted-foreground sm:block">
        {ITEMS.find((item) => item.id === active)?.label}
      </div>
    </SidebarProvider>
  )
}

export default {
  title: "Sidebar",
  group: "Navigation",
  description: "An app's side navigation, with groups, badges and an icon-only collapsed mode. It turns into a sheet on phones.",
  examples: { "Workspace navigation": AppSidebar },
} satisfies Showcase
