"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TxProgressIndicator } from "@/components/tx-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FilePlusIcon,
  HashIcon,
  CheckCircleIcon,
  CopyIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { hexToBytes } from "@/lib/types"
import {
  computeCommitmentWithHex,
  type CredentialData,
} from "@/lib/credentials/commitment"
import { buildVC, type BuildVCParams } from "@/lib/credentials/vc-builder"
import { buildDid, type MidnightNetwork } from "@/lib/credentials/did"
import { storeCredential, type StoredCredential } from "@/lib/storage/db"
import type { TxProgress } from "@/lib/midnight"
import { toast } from "sonner"

const CREDENTIAL_TYPES = [
  { value: "0", label: "Medical Leave" },
  { value: "1", label: "Vaccination" },
  { value: "2", label: "Eligibility" },
] as const

const TYPE_LABELS: Record<number, "MedicalLeave" | "Vaccination" | "Eligibility"> = {
  0: "MedicalLeave",
  1: "Vaccination",
  2: "Eligibility",
}

export default function IssuePage() {
  const {
    client,
    isTxPending,
    coinPublicKey,
  } = useWallet()

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
  const networkId = (process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || "preview") as MidnightNetwork

  // Form state
  const [credentialId, setCredentialId] = useState("")
  const [patientKey, setPatientKey] = useState("")
  const [credentialType, setCredentialType] = useState("0")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")

  // Computed commitment
  const [commitment, setCommitment] = useState<{ bytes: Uint8Array; hex: string } | null>(null)
  const [isComputing, setIsComputing] = useState(false)

  // Tx
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)

  // Result
  const [issuedVC, setIssuedVC] = useState<string | null>(null)

  const expiryUnix = expiryDate
    ? BigInt(Math.floor(new Date(expiryDate).getTime() / 1000))
    : 0n

  const canCompute = !!credentialId && !!patientKey && !!expiryDate && expiryUnix > 0n

  const handleComputeCommitment = async () => {
    if (!canCompute || !coinPublicKey) return
    setIsComputing(true)
    try {
      const data: CredentialData = {
        credentialId: BigInt(credentialId),
        credentialType: Number(credentialType) as 0 | 1 | 2,
        patientKeyHex: patientKey.replace(/^0x/, ""),
        issuerKeyHex: coinPublicKey,
        expiry: expiryUnix,
        notes,
      }
      const result = await computeCommitmentWithHex(data)
      setCommitment(result)
      toast.success("Commitment hash computed")
    } catch (err) {
      toast.error("Failed to compute commitment")
      console.error(err)
    } finally {
      setIsComputing(false)
    }
  }

  const handleIssue = async () => {
    if (!client || !commitment || !coinPublicKey) return
    setTxProgress({ stage: "building", message: "Preparing issue_credential transaction..." })
    setIssuedVC(null)

    try {
      const cleanPatientKey = patientKey.replace(/^0x/, "")
      await client.issueCredential(
        {
          credentialId: BigInt(credentialId),
          client: { bytes: hexToBytes(cleanPatientKey) },
          commitment: commitment.bytes,
          expiry: expiryUnix,
        },
        setTxProgress,
      )

      // Build the W3C VC artifact
      const issuedAtUnix = BigInt(Math.floor(Date.now() / 1000))
      const issuerDid = buildDid(networkId, coinPublicKey)
      const subjectDid = buildDid(networkId, cleanPatientKey)

      const vcParams: BuildVCParams = {
        credentialId: BigInt(credentialId),
        commitmentHash: commitment.bytes,
        credentialType: Number(credentialType) as 0 | 1 | 2,
        issuerDid,
        subjectDid,
        issuedAt: issuedAtUnix,
        expiry: expiryUnix,
        contractAddress,
      }
      const vc = buildVC(vcParams)
      const vcJson = JSON.stringify(vc, null, 2)
      setIssuedVC(vcJson)

      // Store in patient's IndexedDB vault
      const stored: StoredCredential = {
        credentialId: credentialId,
        vc,
        commitmentHex: commitment.hex,
        credentialType: TYPE_LABELS[Number(credentialType)],
        issuerDid,
        subjectDid,
        expiryUnix: Number(expiryUnix),
        issuedAtUnix: Number(issuedAtUnix),
        status: "active",
        contractAddress,
        storedAt: Date.now(),
      }
      await storeCredential(stored)

      setTxProgress({ stage: "done", message: "Credential issued and stored." })
      toast.success("Credential issued successfully")

      // Reset form
      setCredentialId("")
      setPatientKey("")
      setExpiryDate("")
      setNotes("")
      setCommitment(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to issue credential")
    }
  }

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <DashboardLayout role="doctor" pageTitle="Issue Credential">
      <TxProgressIndicator progress={txProgress} />

      {/* ── Step 1: Credential Data ───────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlusIcon className="size-5" />
            Step 1: Credential Data
          </CardTitle>
          <CardDescription>
            Enter the credential details. The medical data stays private &mdash;
            only the commitment hash goes on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issue-cred-id">Credential ID</Label>
              <Input
                id="issue-cred-id"
                type="number"
                placeholder="e.g. 1001"
                value={credentialId}
                onChange={(e) => { setCredentialId(e.target.value); setCommitment(null) }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-type">Credential Type</Label>
              <Select value={credentialType} onValueChange={(v) => { setCredentialType(v); setCommitment(null) }}>
                <SelectTrigger id="issue-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-patient">Patient Public Key (hex)</Label>
              <Input
                id="issue-patient"
                placeholder="0x... or raw hex"
                value={patientKey}
                onChange={(e) => { setPatientKey(e.target.value); setCommitment(null) }}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-expiry">Expiry Date</Label>
              <Input
                id="issue-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => { setExpiryDate(e.target.value); setCommitment(null) }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-notes">Notes (private, not on-chain)</Label>
            <Input
              id="issue-notes"
              placeholder="Optional notes about this credential"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Step 2: Compute Commitment ────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HashIcon className="size-5" />
            Step 2: Compute Commitment
          </CardTitle>
          <CardDescription>
            SHA-256 hash of the credential data. This is the only value stored on the public ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="secondary"
            className="gap-2"
            disabled={!canCompute || isComputing}
            onClick={() => void handleComputeCommitment()}
          >
            <HashIcon className="size-4" />
            {isComputing ? "Computing..." : "Compute Commitment Hash"}
          </Button>

          {commitment && (
            <Alert>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="size-4 text-green-500" />
                <AlertDescription className="flex-1 font-mono text-xs break-all">
                  {commitment.hex}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(commitment.hex)}
                >
                  <CopyIcon className="size-3.5" />
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ── Step 3: Issue On-Chain ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlusIcon className="size-5" />
            Step 3: Issue On-Chain
          </CardTitle>
          <CardDescription>
            Submit the commitment hash to the contract. The Lace wallet will
            handle proving and balancing the transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="gap-2"
            disabled={!client || isTxPending || !commitment}
            onClick={() => void handleIssue()}
          >
            <FilePlusIcon className="size-4" />
            Issue Credential
          </Button>

          {issuedVC && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">W3C Verifiable Credential</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(issuedVC)}
                >
                  <CopyIcon className="mr-1.5 size-3.5" />
                  Copy VC
                </Button>
              </div>
              <pre className="max-h-64 overflow-auto rounded-lg border bg-muted p-3 text-xs">
                {issuedVC}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
