"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TxProgressIndicator } from "@/components/tx-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FilePlusIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { shortenAddress, hexToBytes } from "@/lib/types"
import type { TxProgress } from "@/lib/midnight"

export default function DoctorPage() {
  const {
    ledgerStats,
    ledgerState,
    isLoadingState,
    refreshLedgerState,
    client,
    isTxPending,
  } = useWallet()

  // Issue credential form
  const [credentialId, setCredentialId] = useState("")
  const [patientKey, setPatientKey] = useState("")
  const [commitment, setCommitment] = useState("")
  const [expiry, setExpiry] = useState("")

  // Revoke credential form
  const [revokeCredId, setRevokeCredId] = useState("")
  const [revokePatientKey, setRevokePatientKey] = useState("")

  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)

  const activeCredentials = ledgerState?.activeCredentials ?? []
  const revokedCredentials = ledgerState?.revokedCredentials ?? []

  const handleAction = async (action: () => Promise<void>) => {
    setTxProgress({ stage: "building", message: "Preparing transaction..." })
    try {
      await action()
      setTxProgress({ stage: "done", message: "Transaction confirmed." })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
    }
  }

  return (
    <DashboardLayout role="doctor" pageTitle="Doctor Dashboard">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => void refreshLedgerState()} disabled={isLoadingState}>
          <RefreshCwIcon className={`mr-2 size-4 ${isLoadingState ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <ShieldCheckIcon className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {ledgerStats?.activeCredentialCount.toString() ?? "0"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Non-revoked</p>
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
              <div className="text-2xl font-bold">
                {ledgerStats?.revokedCredentialCount.toString() ?? "0"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Revoked credentials</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <TxProgressIndicator progress={txProgress} />

      {/* ── Issue Credential ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlusIcon className="size-5" />
            Issue Credential
          </CardTitle>
          <CardDescription>
            Issue a new credential commitment on-chain. Only the Bytes&lt;32&gt; commitment hash
            is stored on the public ledger &mdash; no plaintext medical data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="credential-id">Credential ID</Label>
              <Input
                id="credential-id"
                type="number"
                placeholder="e.g. 1001"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-key">Patient Public Key (hex)</Label>
              <Input
                id="patient-key"
                placeholder="0x... or raw hex"
                value={patientKey}
                onChange={(e) => setPatientKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commitment">Commitment Hash (32-byte hex)</Label>
              <Input
                id="commitment"
                placeholder="64 hex characters"
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry (unix timestamp)</Label>
              <Input
                id="expiry"
                type="number"
                placeholder="e.g. 1735689600"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="gap-2"
            disabled={!client || isTxPending || !credentialId || !patientKey || !commitment || !expiry}
            onClick={() => void handleAction(async () => {
              await client!.issueCredential({
                credentialId: BigInt(credentialId),
                client: { bytes: hexToBytes(patientKey.replace(/^0x/, "")) },
                commitment: hexToBytes(commitment.replace(/^0x/, "")),
                expiry: BigInt(expiry),
              }, setTxProgress)
              setCredentialId("")
              setPatientKey("")
              setCommitment("")
              setExpiry("")
            })}
          >
            <FilePlusIcon className="size-4" />
            Issue Credential
          </Button>
        </CardContent>
      </Card>

      {/* ── Revoke Credential ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2Icon className="size-5" />
            Revoke Credential
          </CardTitle>
          <CardDescription>
            Revoke an existing credential. The commitment is moved to the revoked set
            and can no longer be verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="revoke-cred-id">Credential ID</Label>
              <Input
                id="revoke-cred-id"
                type="number"
                placeholder="e.g. 1001"
                value={revokeCredId}
                onChange={(e) => setRevokeCredId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revoke-patient-key">Patient Public Key (hex)</Label>
              <Input
                id="revoke-patient-key"
                placeholder="0x... or raw hex"
                value={revokePatientKey}
                onChange={(e) => setRevokePatientKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!client || isTxPending || !revokeCredId || !revokePatientKey}
            onClick={() => void handleAction(async () => {
              await client!.revokeCredential({
                credentialId: BigInt(revokeCredId),
                client: { bytes: hexToBytes(revokePatientKey.replace(/^0x/, "")) },
              }, setTxProgress)
              setRevokeCredId("")
              setRevokePatientKey("")
            })}
          >
            <Trash2Icon className="size-4" />
            Revoke Credential
          </Button>
        </CardContent>
      </Card>

      {/* ── Active Credentials ────────────────────────────────── */}
      {activeCredentials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Credential Commitments</CardTitle>
            <CardDescription>On-chain commitment hashes for active credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeCredentials.map((hash) => (
                <div key={hash} className="flex items-center gap-2 rounded-md border p-2 font-mono text-xs">
                  <ShieldCheckIcon className="size-3.5 text-green-500 shrink-0" />
                  {shortenAddress(hash)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {revokedCredentials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revoked Credential Commitments</CardTitle>
            <CardDescription>Credentials that have been revoked by their issuer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revokedCredentials.map((hash) => (
                <div key={hash} className="flex items-center gap-2 rounded-md border p-2 font-mono text-xs">
                  <ShieldOffIcon className="size-3.5 text-destructive shrink-0" />
                  {shortenAddress(hash)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
