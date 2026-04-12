"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, LayoutDashboard, Settings, ShieldCheck, FileCheck, UserCog, Bell, RefreshCw, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useContractState } from "@/lib/hooks/use-contract-state"
import { useIsMobile } from "@/hooks/use-mobile"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SimulationProvider, useSimulation } from "@/lib/simulation-context"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/roles", icon: UserCog, label: "Role Management" },
  { href: "/credentials", icon: FileCheck, label: "Credentials" },
  { href: "/verification", icon: ShieldCheck, label: "Verification" },
  { href: "/settings", icon: Settings, label: "Network & Contract" },
]

function SidebarContent({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean
  onNavClick?: () => void
}) {
  const pathname = usePathname()
  const { state } = useContractState()
  const { stats } = useSimulation()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-8">
        {!collapsed && (
          <div>
            <h1 className="text-orange-500 font-bold text-lg tracking-wider">CAREPROOF</h1>
            <p className="text-neutral-500 text-xs">v1.0.0 · MIDNIGHT NETWORK</p>
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              state?.connected ? "bg-green-500" : "bg-neutral-500"
            } ${state?.connected ? "animate-pulse" : ""}`} />
            <span className="text-xs text-white">
              {state?.connected ? "CONTRACT CONNECTED" : "CONTRACT DISCONNECTED"}
            </span>
          </div>
          <div className="text-xs text-neutral-500">
            <div>NETWORK: LOCALNET</div>
            <div>CREDENTIALS: {stats.activeCredentials} ACTIVE</div>
            <div>VERIFICATIONS: {stats.totalVerifications} TOTAL</div>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { refresh } = useContractState()

  const activeLabel = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Dashboard"

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 hidden md:block shrink-0`}
      >
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-neutral-400 hover:text-orange-500"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
            />
          </Button>
        </div>
        <SidebarContent collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-70 bg-neutral-900 border-r border-neutral-700 z-50 md:hidden">
            <SidebarContent
              collapsed={false}
              onNavClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-orange-500 md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-sm text-neutral-400">
              CAREPROOF / <span className="text-orange-500">{activeLabel.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-xs text-neutral-500 hidden sm:block">MIDNIGHT NETWORK</div>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-orange-500"
              onClick={() => toast.info("No new notifications")}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-orange-500"
              onClick={() => {
                refresh()
                toast.success("Dashboard refreshed")
              }}
              aria-label="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SimulationProvider>
        <DashboardShell>{children}</DashboardShell>
      </SimulationProvider>
    </TooltipProvider>
  )
}
