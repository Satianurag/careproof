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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  HandshakeIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCwIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useConsentStore } from "@/lib/storage/hooks"
import { hexToBytes } from "@/lib/types"
import { shortenAddress } from "@/lib/types"
import type { TxProgress } from "@/lib/midnight"
import { toast } from "sonner"

export default function ConsentPage() {
  const {
    client,
    isTxPending,
  } = useWallet()

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
  const { consents, isLoading: isLoadingConsents, add: addConsent, remove: removeConsent, refresh } = useConsentStore(contractAddress)

  const [doctorKey, setDoctorKey] = useState("")
  const [credentialId, setCredentialId] = useState("")
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)

  const handleGrantConsent = async () => {
    if (!client || !doctorKey || !credentialId) return
    setTxProgress({ stage: "building", message: "Preparing grant_consent transaction..." })
    try {
      const cleanKey = doctorKey.replace(/^0x/, "")
      await client.grantConsent(
        { doctor: { bytes: hexToBytes(cleanKey) }, credentialId: BigInt(credentialId) },
        setTxProgress,
      )
      // Store locally
      await addConsent(cleanKey, credentialId)
      setTxProgress({ stage: "done", message: "Consent granted successfully." })
      toast.success("Consent granted on-chain")
      setDoctorKey("")
      setCredentialId("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to grant consent")
    }
  }

  const handleRevokeConsent = async (dHex: string, cId: string) => {
    if (!client) return
    setTxProgress({ stage: "building", message: "Preparing revoke_consent transaction..." })
    try {
      await client.revokeConsent(
        { doctor: { bytes: hexToBytes(dHex) }, credentialId: BigInt(cId) },
        setTxProgress,
      )
      await removeConsent(dHex, cId)
      setTxProgress({ stage: "done", message: "Consent revoked successfully." })
      toast.success("Consent revoked on-chain")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to revoke consent")
    }
  }

  return (
    <DashboardLayout role="patient" pageTitle="Consent Management">
      <TxProgressIndicator progress={txProgress} />

      {/* ── Grant new consent ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="size-5" />
            Grant New Consent
          </CardTitle>
          <CardDescription>
            Authorize a specific doctor to issue a credential on your behalf.
            Each consent is per-credential-ID and patient-initiated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="consent-doctor">Doctor Public Key (hex)</Label>
              <Input
                id="consent-doctor"
                placeholder="0x... or raw hex"
                value={doctorKey}
                onChange={(e) => setDoctorKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consent-cred-id">Credential ID</Label>
              <Input
                id="consent-cred-id"
                type="number"
                placeholder="e.g. 1001"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="gap-2"
            disabled={!client || isTxPending || !doctorKey || !credentialId}
            onClick={() => void handleGrantConsent()}
          >
            <HandshakeIcon className="size-4" />
            Grant Consent
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Active consents ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HandshakeIcon className="size-5" />
                Active Consents
              </CardTitle>
              <CardDescription>
                Consents you have granted to doctors. Revoke at any time to block future issuance.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              <RefreshCwIcon className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingConsents ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : consents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active consents. Grant consent to a doctor to allow credential issuance.
            </p>
          ) : (
            <div className="space-y-3">
              {consents.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Cred #{c.credentialId}</Badge>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      Doctor: {shortenAddress(c.doctorHex)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Granted: {new Date(c.grantedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    disabled={!client || isTxPending}
                    onClick={() => void handleRevokeConsent(c.doctorHex, c.credentialId)}
                  >
                    <Trash2Icon className="size-3.5" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
