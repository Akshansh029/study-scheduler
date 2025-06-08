"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Calendar,
  Home,
  BookOpen,
  Brain,
  BarChart3,
  Settings,
  User,
  Plus,
  Clock,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

// Menu items for main navigation
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Schedule",
    url: "/dashboard/schedule",
    icon: Calendar,
    badge: "3",
  },
  {
    title: "Subjects",
    url: "/dashboard/subjects",
    icon: BookOpen,
    badge: null,
  },
  {
    title: "Review",
    url: "/dashboard/review",
    icon: Brain,
    badge: "24",
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
    badge: null,
  },
];

// Quick actions
const quickActions = [
  {
    title: "New Flashcard",
    url: "/dashboard/flashcards/new",
    icon: Plus,
  },
  {
    title: "Quick Review",
    url: "/dashboard/review/quick",
    icon: Clock,
  },
];

// Settings items
const settingsItems = [
  {
    title: "Preferences",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const { user } = useUser();

  return (
    <Sidebar variant="inset" className="bg-white">
      <SidebarHeader className="border-sidebar-border border-b bg-white">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Brain className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">SlotWise</span>
            <span className="text-sidebar-foreground/70 truncate text-xs">
              Scheduler
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden bg-white">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t bg-white">
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="px-2 py-2">
          <div className="bg-sidebar-accent flex items-center gap-2 rounded-lg px-2 py-2">
            <div className="flex flex-1 items-center gap-3 text-sm">
              <UserButton />
              <div className="font-medium">{user?.fullName}</div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
