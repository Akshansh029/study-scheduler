"use client";
import { SignOutButton } from "@clerk/nextjs";
import {
  Calendar,
  Home,
  BookOpen,
  Brain,
  User,
  Clock,
  NotepadText,
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
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { api } from "@/trpc/react";

// Menu items for main navigation
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Schedule",
    url: "/dashboard/schedule",
    icon: Calendar,
  },
  {
    title: "Subjects",
    url: "/dashboard/subjects",
    icon: BookOpen,
  },
  {
    title: "Sessions",
    url: "/dashboard/sessions",
    icon: Clock,
  },
  {
    title: "Flashcard",
    url: "/dashboard/flashcards",
    icon: NotepadText,
  },
  {
    title: "Review",
    url: "/dashboard/review",
    icon: Brain,
  },
];

// Settings items
const settingsItems = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const [selected, setSelected] = useState(() => {
    const selectedItem = localStorage.getItem("sidebarItem");
    return selectedItem ?? "Dashboard";
  });

  const { data: userData, isLoading } = api.user.getUserDetails.useQuery();

  const getDisplayName = () => {
    if (isLoading) {
      return "--";
    } else {
      if (userData?.firstName && userData?.lastName) {
        return `${userData?.firstName} ${userData?.lastName}`;
      }
      if (userData?.firstName) {
        return userData?.firstName;
      }
      return userData?.emailAddress.split("@")[0];
    }
  };

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData?.firstName[0]}${userData?.lastName[0]}`.toUpperCase();
    }
    if (userData?.firstName) {
      return userData?.firstName ? userData?.firstName[0]!.toUpperCase() : "";
    }
    return userData?.emailAddress[0]!.toUpperCase();
  };

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
                  <SidebarMenuButton
                    onClick={() => {
                      setSelected(item.title);
                      localStorage.setItem("sidebarItem", item.title);
                    }}
                    className={cn(selected === item.title ? "bg-zinc-100" : "")}
                    asChild
                  >
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

        <SidebarSeparator />
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t bg-white">
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => {
                  setSelected(item.title);
                  localStorage.setItem("sidebarItem", item.title);
                }}
                className={cn(selected === item.title ? "bg-zinc-100" : "")}
                asChild
              >
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
            <div className="flex flex-1 items-center gap-3">
              <div className="to-pur9le-900 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500">
                {userData?.imageUrl ? (
                  <Image
                    src={userData?.imageUrl ?? "/placeholder.svg"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    height={9}
                    width={9}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-semibold">{getDisplayName()}</div>
                <div className="rounded-md px-2 py-1 text-xs text-red-500">
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
