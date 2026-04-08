"use client"

import { useEffect } from "react"
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
import {
  ShieldCheckIcon,
  ShieldOffIcon,
  ClockIcon,
  RefreshCwIcon,
  CopyIcon,
  FolderOpenIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useCredentialStore } from "@/lib/storage/hooks"
import { shortenAddress } from "@/lib/types"
import {
  credentialTypeDisplay,
  formatExpiry,
  STATUS_STYLES,
  type CredentialDisplayStatus,
} from "@/lib/credentials/display"
import { shortenDid } from "@/lib/credentials/did"
import { toast } from "sonner"

const StatusIcon = ({ status }: { status: CredentialDisplayStatus }) => {
  switch (status) {
    case "active":
      return <ShieldCheckIcon className="size-4 text-green-500" />
    case "revoked":
      return <ShieldOffIcon className="size-4 text-destructive" />
    case "expired":
      return <ClockIcon className="size-4 text-muted-foreground" />
  }
}

export default function CredentialsPage() {
  const { ledgerState, isLoadingState } = useWallet()

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
  const { credentials, isLoading, refresh, syncWithChain } = useCredentialStore(contractAddress)

  // Sync local vault status with on-chain state whenever ledger refreshes
  useEffect(() => {
    if (ledgerState && !isLoadingState) {
      void syncWithChain(
        ledgerState.activeCredentials,
        ledgerState.revokedCredentials,
      )
    }
  }, [ledgerState, isLoadingState, syncWithChain])

  const copyVC = (vc: object) => {
    void navigator.clipboard.writeText(JSON.stringify(vc, null, 2))
    toast.success("VC copied to clipboard")
  }

  const downloadVC = (credentialId: string, vc: object) => {
    const blob = new Blob([JSON.stringify(vc, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `careproof-credential-${credentialId}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("VC downloaded")
  }

  const active = credentials.filter((c) => c.status === "active")
  const other = credentials.filter((c) => c.status !== "active")

  return (
    <DashboardLayout role="patient" pageTitle="Credential Vault">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {credentials.length} credential{credentials.length !== 1 ? "s" : ""} in your local vault
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()}>
          <RefreshCwIcon className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading vault...</p>
      ) : credentials.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <FolderOpenIcon className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Your credential vault is empty. Credentials will appear here after a doctor
                issues them on-chain.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Active Credentials ────────────────────────────── */}
          {active.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="size-5 text-green-500" />
                  Active Credentials ({active.length})
                </CardTitle>
                <CardDescription>
                  Valid credentials you can present to verifiers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {active.map((cred) => {
                  const typeInfo = credentialTypeDisplay(cred.credentialType)
                  const expiry = formatExpiry(new Date(cred.expiryUnix * 1000).toISOString())
                  return (
                    <div key={cred.credentialId} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon status="active" />
                          <Badge variant="secondary">#{cred.credentialId}</Badge>
                          <span className={`text-sm font-medium ${typeInfo.color}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        </div>
                        <Badge variant={STATUS_STYLES.active.variant}>
                          {STATUS_STYLES.active.label}
                        </Badge>
                      </div>
                      <div className="grid gap-1 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium">Commitment:</span>{" "}
                          <span className="font-mono">{shortenAddress(cred.commitmentHex)}</span>
                        </p>
                        <p>
                          <span className="font-medium">Issuer:</span>{" "}
                          {shortenDid(cred.issuerDid)}
                        </p>
                        <p>
                          <span className="font-medium">Expires:</span>{" "}
                          {expiry.text}
                          {expiry.expired && <span className="ml-1 text-destructive">(expired)</span>}
                        </p>
                        <p>
                          <span className="font-medium">Issued:</span>{" "}
                          {new Date(cred.issuedAtUnix * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/patient/credentials/${cred.credentialId}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => copyVC(cred.vc)}
                        >
                          <CopyIcon className="size-3.5" />
                          Copy VC
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadVC(cred.credentialId, cred.vc)}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* ── Revoked / Expired ─────────────────────────────── */}
          {other.length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldOffIcon className="size-5 text-muted-foreground" />
                    Revoked / Expired ({other.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {other.map((cred) => {
                    const typeInfo = credentialTypeDisplay(cred.credentialType)
                    const style = STATUS_STYLES[cred.status]
                    return (
                      <div key={cred.credentialId} className="flex items-center justify-between rounded-lg border p-4 opacity-60">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={cred.status} />
                          <Badge variant="secondary">#{cred.credentialId}</Badge>
                          <span className="text-sm">{typeInfo.label}</span>
                        </div>
                        <Badge variant={style.variant}>{style.label}</Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
