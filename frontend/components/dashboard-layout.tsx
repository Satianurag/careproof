"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CircleDotIcon } from "lucide-react"
import type { UserRole } from "@/lib/midnight"
import { useWallet } from "@/contexts/wallet-context"
import { shortenAddress } from "@/lib/types"
import { WalletStatusBanner } from "@/components/wallet-status-banner"

export function DashboardLayout({
  role,
  pageTitle,
  children,
}: {
  role: UserRole
  pageTitle: string
  children: React.ReactNode
}) {
  const { walletAddress, walletName } = useWallet()

  return (
    <SidebarProvider>
      <AppSidebar
        role={role}
        walletAddress={walletAddress}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">CareProof</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {walletName && <Badge variant="secondary">{walletName}</Badge>}
            {walletAddress && (
              <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                <CircleDotIcon className="size-2.5 text-green-500" />
                {shortenAddress(walletAddress)}
              </Badge>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <WalletStatusBanner />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
