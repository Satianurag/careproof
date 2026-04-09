"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  ShieldCheckIcon,
  ToggleLeftIcon,
  BarChart3Icon,
  StethoscopeIcon,
  FilePlusIcon,
  FileTextIcon,
  HeartPulseIcon,
  EyeIcon,
  ClipboardCheckIcon,
  ListChecksIcon,
  SearchIcon,
} from "lucide-react"
import type { UserRole } from "@/lib/midnight"

const navByRole: Record<UserRole, {
  title: string
  url: string
  icon: React.ReactNode
  isActive?: boolean
  items?: { title: string; url: string }[]
}[]> = {
  admin: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <BarChart3Icon />,
      isActive: true,
      items: [
        { title: "Overview", url: "/admin" },
      ],
    },
    {
      title: "Role Management",
      url: "/admin/roles",
      icon: <StethoscopeIcon />,
      items: [
        { title: "Doctors", url: "/admin/roles" },
        { title: "Verifiers", url: "/admin/roles" },
      ],
    },
    {
      title: "Contract Control",
      url: "/admin/control",
      icon: <ToggleLeftIcon />,
      items: [
        { title: "Pause / Unpause", url: "/admin/control" },
        { title: "Transfer Admin", url: "/admin/control" },
      ],
    },
  ],
  doctor: [
    {
      title: "Dashboard",
      url: "/doctor",
      icon: <StethoscopeIcon />,
      isActive: true,
      items: [
        { title: "Overview", url: "/doctor" },
      ],
    },
    {
      title: "Issue Credential",
      url: "/doctor/issue",
      icon: <FilePlusIcon />,
      items: [
        { title: "New Credential", url: "/doctor/issue" },
      ],
    },
    {
      title: "Revoke",
      url: "/doctor/revoke",
      icon: <FileTextIcon />,
      items: [
        { title: "Revoke Credential", url: "/doctor/revoke" },
      ],
    },
  ],
  patient: [
    {
      title: "Dashboard",
      url: "/patient",
      icon: <HeartPulseIcon />,
      isActive: true,
      items: [
        { title: "Overview", url: "/patient" },
      ],
    },
    {
      title: "Credential Vault",
      url: "/patient/credentials",
      icon: <FileTextIcon />,
      items: [
        { title: "View All", url: "/patient/credentials" },
      ],
    },
    {
      title: "Consent",
      url: "/patient/consent",
      icon: <EyeIcon />,
      items: [
        { title: "Manage Consents", url: "/patient/consent" },
      ],
    },
  ],
  verifier: [
    {
      title: "Dashboard",
      url: "/verifier",
      icon: <ClipboardCheckIcon />,
      isActive: true,
      items: [
        { title: "Overview", url: "/verifier" },
      ],
    },
    {
      title: "Verify",
      url: "/verifier/verify",
      icon: <SearchIcon />,
      items: [
        { title: "Verify Credential", url: "/verifier/verify" },
      ],
    },
    {
      title: "History",
      url: "/verifier/history",
      icon: <ListChecksIcon />,
      items: [
        { title: "Verification Log", url: "/verifier/history" },
      ],
    },
  ],
}

export function AppSidebar({
  role,
  walletAddress,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  role: UserRole
  walletAddress: string | null
}) {
  const items = navByRole[role]
  const user = {
    name: role.charAt(0).toUpperCase() + role.slice(1),
    email: walletAddress
      ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
      : "Not connected",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShieldCheckIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">CareProof</span>
                  <span className="truncate text-xs capitalize">{role} Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
