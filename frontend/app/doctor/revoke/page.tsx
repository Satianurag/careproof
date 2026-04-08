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
  Trash2Icon,
  ShieldOffIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useCredentialStore } from "@/lib/storage/hooks"
import { hexToBytes, shortenAddress } from "@/lib/types"
import { formatExpiry, STATUS_STYLES } from "@/lib/credentials/display"
import type { TxProgress } from "@/lib/midnight"
import { toast } from "sonner"

export default function RevokePage() {
  const {
    client,
    isTxPending,
  } = useWallet()

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
  const { credentials, setStatus } = useCredentialStore(contractAddress)

  const [revokeCredId, setRevokeCredId] = useState("")
  const [revokePatientKey, setRevokePatientKey] = useState("")
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)

  const activeCredentials = credentials.filter((c) => c.status === "active")

  const handleRevoke = async (credId?: string, patientHex?: string) => {
    const cId = credId ?? revokeCredId
    const pKey = patientHex ?? revokePatientKey.replace(/^0x/, "")
    if (!client || !cId || !pKey) return

    setTxProgress({ stage: "building", message: "Preparing revoke_credential transaction..." })
    try {
      await client.revokeCredential(
        { credentialId: BigInt(cId), client: { bytes: hexToBytes(pKey) } },
        setTxProgress,
      )
      // Update local status
      await setStatus(cId, "revoked")
      setTxProgress({ stage: "done", message: "Credential revoked." })
      toast.success("Credential revoked on-chain")
      setRevokeCredId("")
      setRevokePatientKey("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to revoke credential")
    }
  }

  return (
    <DashboardLayout role="doctor" pageTitle="Revoke Credential">
      <TxProgressIndicator progress={txProgress} />

      {/* ── Manual Revocation ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2Icon className="size-5" />
            Revoke by ID
          </CardTitle>
          <CardDescription>
            Revoke a credential by providing its ID and the patient&apos;s public key.
            The commitment is moved to the revoked set and can no longer be verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="revoke-id">Credential ID</Label>
              <Input
                id="revoke-id"
                type="number"
                placeholder="e.g. 1001"
                value={revokeCredId}
                onChange={(e) => setRevokeCredId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revoke-patient">Patient Public Key (hex)</Label>
              <Input
                id="revoke-patient"
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
            onClick={() => void handleRevoke()}
          >
            <Trash2Icon className="size-4" />
            Revoke Credential
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Active Credentials (from vault) ───────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOffIcon className="size-5" />
            Issued Credentials
          </CardTitle>
          <CardDescription>
            Credentials stored in the local vault. Click Revoke to revoke on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeCredentials.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active credentials in the local vault.
            </p>
          ) : (
            <div className="space-y-3">
              {activeCredentials.map((cred) => {
                const expiry = formatExpiry(new Date(cred.expiryUnix * 1000).toISOString())
                const style = STATUS_STYLES[cred.status]
                return (
                  <div
                    key={cred.credentialId}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{cred.credentialId}</Badge>
                        <Badge variant={style.variant}>{cred.credentialType}</Badge>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Commitment: {shortenAddress(cred.commitmentHex)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {expiry.text}
                        {expiry.expired && (
                          <span className="ml-1 text-destructive">(expired)</span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      disabled={!client || isTxPending}
                      onClick={() => {
                        // Extract patient key from subject DID
                        const parts = cred.subjectDid.split(":")
                        const patientHex = parts[parts.length - 1]
                        void handleRevoke(cred.credentialId, patientHex)
                      }}
                    >
                      <AlertTriangleIcon className="size-3.5" />
                      Revoke
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
