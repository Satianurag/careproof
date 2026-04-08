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
  ShieldCheckIcon,
  ShieldOffIcon,
  KeyIcon,
  CalendarIcon,
  RefreshCwIcon,
  HandshakeIcon,
  XIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { hexToBytes } from "@/lib/types"
import type { TxProgress } from "@/lib/midnight"

export default function PatientPage() {
  const {
    ledgerStats,
    ledgerState,
    isLoadingState,
    refreshLedgerState,
    client,
    isTxPending,
  } = useWallet()

  // Consent form
  const [consentDoctorKey, setConsentDoctorKey] = useState("")
  const [consentCredId, setConsentCredId] = useState("")

  // Prove ownership form
  const [proveCredId, setProveCredId] = useState("")

  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)

  const totalCredentials = ledgerStats?.totalCredentials ?? 0n
  const activeCount = ledgerStats?.activeCredentialCount ?? 0n
  const revokedCount = ledgerStats?.revokedCredentialCount ?? 0n

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
    <DashboardLayout role="patient" pageTitle="Patient Dashboard">
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
              <div className="text-2xl font-bold">{totalCredentials.toString()}</div>
            )}
            <p className="text-xs text-muted-foreground">On-chain commitments</p>
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
              <div className="text-2xl font-bold">{activeCount.toString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Non-revoked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {ledgerStats?.totalVerifications.toString() ?? "0"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total verifications</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <TxProgressIndicator progress={txProgress} />

      {/* ── Consent Management ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandshakeIcon className="size-5" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Grant or revoke consent for a doctor to issue a specific credential on your behalf.
            Consent is per-credential-ID and patient-initiated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="consent-doctor">Doctor Public Key (hex)</Label>
              <Input
                id="consent-doctor"
                placeholder="0x... or raw hex"
                value={consentDoctorKey}
                onChange={(e) => setConsentDoctorKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consent-cred-id">Credential ID</Label>
              <Input
                id="consent-cred-id"
                type="number"
                placeholder="e.g. 1001"
                value={consentCredId}
                onChange={(e) => setConsentCredId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="gap-2"
              disabled={!client || isTxPending || !consentDoctorKey || !consentCredId}
              onClick={() => void handleAction(async () => {
                await client!.grantConsent({
                  doctor: { bytes: hexToBytes(consentDoctorKey.replace(/^0x/, "")) },
                  credentialId: BigInt(consentCredId),
                }, setTxProgress)
                setConsentDoctorKey("")
                setConsentCredId("")
              })}
            >
              <HandshakeIcon className="size-4" />
              Grant Consent
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!client || isTxPending || !consentDoctorKey || !consentCredId}
              onClick={() => void handleAction(async () => {
                await client!.revokeConsent({
                  doctor: { bytes: hexToBytes(consentDoctorKey.replace(/^0x/, "")) },
                  credentialId: BigInt(consentCredId),
                }, setTxProgress)
                setConsentDoctorKey("")
                setConsentCredId("")
              })}
            >
              <XIcon className="size-4" />
              Revoke Consent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Prove Ownership ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="size-5" />
            Prove Credential Ownership
          </CardTitle>
          <CardDescription>
            Generate a zero-knowledge proof that you hold a valid, non-revoked, non-expired
            credential &mdash; without revealing any medical data. The witness retrieves your
            commitment from private state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prove-cred-id">Credential ID</Label>
            <Input
              id="prove-cred-id"
              type="number"
              placeholder="e.g. 1001"
              value={proveCredId}
              onChange={(e) => setProveCredId(e.target.value)}
            />
          </div>
          <Button
            className="gap-2"
            disabled={!client || isTxPending || !proveCredId}
            onClick={() => void handleAction(async () => {
              await client!.proveCredentialOwnership(
                { credentialId: BigInt(proveCredId) },
                setTxProgress,
              )
              setProveCredId("")
            })}
          >
            <KeyIcon className="size-4" />
            Prove Ownership
          </Button>
        </CardContent>
      </Card>

      {/* ── Revoked Credentials ───────────────────────────────── */}
      {revokedCount > 0n && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldOffIcon className="size-5 text-destructive" />
                Revoked Credentials
              </CardTitle>
              <CardDescription>
                {revokedCount.toString()} credential(s) have been revoked on-chain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(ledgerState?.revokedCredentials ?? []).map((hash) => (
                  <div key={hash} className="flex items-center gap-2 rounded-md border p-2 font-mono text-xs">
                    <ShieldOffIcon className="size-3.5 text-destructive shrink-0" />
                    {hash.length > 12 ? `${hash.slice(0, 6)}...${hash.slice(-6)}` : hash}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}
