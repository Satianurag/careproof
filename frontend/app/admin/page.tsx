"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ShieldCheckIcon,
  ShieldOffIcon,
  ClipboardCheckIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  SettingsIcon,
  WifiIcon,
  WalletIcon,
  GlobeIcon,
  ServerIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { shortenAddress, bytesToHex } from "@/lib/types"

export default function AdminPage() {
  const {
    ledgerStats,
    ledgerState,
    isLoadingState,
    refreshLedgerState,
    walletAddress,
    coinPublicKey,
    walletName,
    connectedAPI,
  } = useWallet()

  const activeCount = ledgerStats?.activeCredentialCount ?? 0n
  const revokedCount = ledgerStats?.revokedCredentialCount ?? 0n
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
  const networkId = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || "preprod"

  return (
    <DashboardLayout role="admin" pageTitle="Admin Dashboard">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => void refreshLedgerState()} disabled={isLoadingState}>
          <RefreshCwIcon className={`mr-2 size-4 ${isLoadingState ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Operational Stats ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
            <ShieldCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {ledgerStats?.totalCredentials.toString() ?? "0"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Commitment hashes on-chain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircleIcon className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{activeCount.toString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Non-revoked credentials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            <ShieldOffIcon className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{revokedCount.toString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Revoked credentials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <ClipboardCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {ledgerStats?.totalVerifications.toString() ?? "0"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Recorded on-chain</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Role Management
            </CardTitle>
            <CardDescription>
              Grant or revoke DOCTOR_ROLE and VERIFIER_ROLE on-chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/roles">Manage Roles</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="size-5" />
              Contract Control
            </CardTitle>
            <CardDescription>
              Pause/unpause contract, transfer admin role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/admin/control">Contract Controls</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Environment Diagnostics ───────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeIcon className="size-5" />
            Environment Diagnostics
          </CardTitle>
          <CardDescription>
            Connected wallet, network, and service configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <WalletIcon className="size-3.5" />
                Wallet
              </dt>
              <dd className="font-medium">{walletName ?? "Unknown"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <WifiIcon className="size-3.5" />
                Network
              </dt>
              <dd>
                <Badge variant="secondary" className="font-mono text-xs">
                  {networkId}
                </Badge>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <ServerIcon className="size-3.5" />
                Contract
              </dt>
              <dd className="font-mono text-xs">
                {contractAddress ? shortenAddress(contractAddress) : "Not configured"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Wallet Address</dt>
              <dd className="font-mono text-xs">
                {walletAddress ? shortenAddress(walletAddress) : "Not connected"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Coin Public Key</dt>
              <dd className="font-mono text-xs">
                {coinPublicKey ? shortenAddress(coinPublicKey) : "N/A"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Connection Status</dt>
              <dd>
                {connectedAPI ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <WifiIcon className="size-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Disconnected
                  </Badge>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* ── Recent Activity ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheckIcon className="size-5" />
            Recent Verifications
          </CardTitle>
          <CardDescription>Latest on-chain verification audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {!ledgerState || ledgerState.verificationLog.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No verifications recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {ledgerState.verificationLog.slice(0, 10).map((ver) => (
                <div key={ver.logKeyHex} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {shortenAddress(bytesToHex(ver.commitment))}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      by {shortenAddress(bytesToHex(ver.verifier.bytes))}
                    </p>
                  </div>
                  {ver.is_valid ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircleIcon className="size-3" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircleIcon className="size-3" />
                      Invalid
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
