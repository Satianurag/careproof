"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheckIcon,
  UserCogIcon,
  StethoscopeIcon,
  HeartPulseIcon,
  ClipboardCheckIcon,
  AlertCircleIcon,
  Loader2Icon,
  ArrowRightIcon,
  WalletIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/lib/midnight"
import { roleToDashboardRoute } from "@/lib/midnight"
import { shortenAddress } from "@/lib/types"

const roleConfig: { role: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Manage doctors, verifiers, and contract settings",
    icon: <UserCogIcon className="size-8 text-primary" />,
  },
  {
    role: "doctor",
    label: "Doctor",
    description: "Issue healthcare credentials to patients",
    icon: <StethoscopeIcon className="size-8 text-primary" />,
  },
  {
    role: "patient",
    label: "Patient",
    description: "View credentials and prove credential ownership",
    icon: <HeartPulseIcon className="size-8 text-primary" />,
  },
  {
    role: "verifier",
    label: "Verifier",
    description: "Verify credential commitments on-chain",
    icon: <ClipboardCheckIcon className="size-8 text-primary" />,
  },
]

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    isConnected,
    isConnecting,
    walletAddress,
    walletName,
    error,
    roles,
    isResolvingRoles,
    connectWallet,
    disconnectWallet,
  } = useWallet()
  const router = useRouter()

  const handleRoleSelect = (role: UserRole) => {
    router.push(roleToDashboardRoute(role))
  }

  // ── Not connected ─────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <WalletIcon className="size-6 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect the Midnight-enabled Lace wallet to interact with CareProof.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertDescription>
                  {error}
                  {(error.includes("not installed") || error.includes("not detected")) && (
                    <a
                      href="https://chromewebstore.google.com/detail/lace-midnight-preview/hgeekaiplokcnmakghbdfbgnlfheichg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-xs font-medium underline underline-offset-2"
                    >
                      Install Lace Midnight Preview →
                    </a>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => void connectWallet()}
              disabled={isConnecting}
              aria-label="Connect Midnight wallet"
            >
              {isConnecting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <WalletIcon className="size-4" />
                  Connect Lace Wallet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Resolving roles ───────────────────────────────────────
  if (isResolvingRoles) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Resolving on-chain roles...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Connected: show role selection ────────────────────────
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Your Role</h2>
        <p className="text-muted-foreground">
          {roles && roles.all.length > 1
            ? `You hold ${roles.all.length} on-chain roles. Choose one to continue.`
            : "Choose how you want to interact with CareProof"}
        </p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-green-500" />
              <span className="font-medium text-foreground">
                {walletName || "Lace Wallet"} connected
              </span>
            </p>
            {walletAddress && (
              <p className="font-mono text-xs">{shortenAddress(walletAddress)}</p>
            )}
            {roles && (
              <div className="mt-1 flex flex-wrap gap-1">
                {roles.all.map((r) => (
                  <Badge key={r} variant={r === roles.primary ? "default" : "secondary"} className="text-xs capitalize">
                    {r === roles.primary && <SparklesIcon className="mr-1 size-3" />}
                    {r}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={disconnectWallet}
          >
            <LogOutIcon className="size-3.5" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {roleConfig.map(({ role, label, description, icon }) => {
          const isOnChainRole = roles?.all.includes(role) ?? false
          const isPrimary = roles?.primary === role

          return (
            <Card
              key={role}
              role="button"
              tabIndex={0}
              aria-label={`Continue as ${label}`}
              className={cn(
                "group cursor-pointer border-border/50 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isPrimary && "border-primary/40 bg-primary/5",
              )}
              onClick={() => handleRoleSelect(role)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleRoleSelect(role) } }}
            >
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{label}</CardTitle>
                    {isPrimary && (
                      <Badge variant="default" className="text-[10px]">Primary</Badge>
                    )}
                    {isOnChainRole && !isPrimary && (
                      <Badge variant="secondary" className="text-[10px]">On-chain</Badge>
                    )}
                  </div>
                  <CardDescription>{description}</CardDescription>
                </div>
                <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
