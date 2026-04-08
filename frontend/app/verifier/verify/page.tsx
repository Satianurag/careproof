"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TxProgressIndicator } from "@/components/tx-progress"
import { VerifyResult, type VerifyResultStatus } from "@/components/verify-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  SearchIcon,
  UploadIcon,
  FileTextIcon,
  HashIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { hexToBytes } from "@/lib/types"
import type { CareProofVC } from "@/lib/credentials/vc-types"
import type { TxProgress } from "@/lib/midnight"
import { toast } from "sonner"

export default function VerifyPage() {
  const {
    client,
    isTxPending,
    ledgerState,
  } = useWallet()

  const [commitmentHex, setCommitmentHex] = useState("")
  const [vcJson, setVcJson] = useState("")
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)
  const [result, setResult] = useState<{ status: VerifyResultStatus; commitment: string; details?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pre-check: look up commitment in on-chain state (read-only, no tx)
  const precheckCommitment = (hex: string): { status: VerifyResultStatus; details?: string } => {
    if (!ledgerState) return { status: "unknown", details: "Ledger state not loaded" }

    const activeSet = new Set(ledgerState.activeCredentials)
    const revokedSet = new Set(ledgerState.revokedCredentials)

    if (revokedSet.has(hex)) return { status: "revoked" }
    if (activeSet.has(hex)) return { status: "valid" }
    return { status: "not_found" }
  }

  // Extract commitment from a VC JSON string
  const extractCommitment = (json: string): string | null => {
    try {
      const vc = JSON.parse(json) as CareProofVC
      return vc.credentialSubject?.commitmentHash ?? null
    } catch {
      return null
    }
  }

  // Verify by commitment hex (pre-check first, optionally on-chain)
  const handleVerifyCommitment = (hex: string) => {
    if (!hex) return
    const clean = hex.replace(/^0x/, "")
    const precheck = precheckCommitment(clean)
    setResult({ status: precheck.status, commitment: clean, details: precheck.details })
  }

  // Verify on-chain (creates audit log entry)
  const handleVerifyOnChain = async (hex: string) => {
    if (!client || !hex) return
    const clean = hex.replace(/^0x/, "")
    setTxProgress({ stage: "building", message: "Preparing verify_credential transaction..." })
    try {
      await client.verifyCredential(
        { commitment: hexToBytes(clean) },
        setTxProgress,
      )
      setTxProgress({ stage: "done", message: "Verification recorded on-chain." })
      // Re-check after on-chain verification
      const precheck = precheckCommitment(clean)
      setResult({ status: precheck.status === "not_found" ? "valid" : precheck.status, commitment: clean })
      toast.success("Verification recorded on-chain")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Verification failed")
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setVcJson(text)

      const commitment = extractCommitment(text)
      if (commitment) {
        setCommitmentHex(commitment)
        handleVerifyCommitment(commitment)
        toast.success("Credential loaded from file")
      } else {
        toast.error("Could not extract commitment from file")
      }
    }
    reader.readAsText(file)
  }

  // Handle paste VC JSON
  const handlePasteVerify = () => {
    const commitment = extractCommitment(vcJson)
    if (commitment) {
      setCommitmentHex(commitment)
      handleVerifyCommitment(commitment)
    } else {
      toast.error("Could not extract commitment hash from VC JSON")
    }
  }

  return (
    <DashboardLayout role="verifier" pageTitle="Verify Credential">
      <TxProgressIndicator progress={txProgress} />

      <Tabs defaultValue="hash">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hash" className="gap-2">
            <HashIcon className="size-4" />
            By Hash
          </TabsTrigger>
          <TabsTrigger value="file" className="gap-2">
            <UploadIcon className="size-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="paste" className="gap-2">
            <FileTextIcon className="size-4" />
            Paste JSON
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: By Commitment Hash ──────────────────────────── */}
        <TabsContent value="hash">
          <Card>
            <CardHeader>
              <CardTitle>Verify by Commitment Hash</CardTitle>
              <CardDescription>
                Enter the 32-byte commitment hash (64 hex characters) to check its status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="v-hash">Commitment Hash (hex)</Label>
                <Input
                  id="v-hash"
                  placeholder="64 hex characters"
                  value={commitmentHex}
                  onChange={(e) => setCommitmentHex(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="gap-2"
                  disabled={!commitmentHex}
                  onClick={() => handleVerifyCommitment(commitmentHex)}
                >
                  <SearchIcon className="size-4" />
                  Pre-Check (Read-Only)
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  disabled={!client || isTxPending || !commitmentHex}
                  onClick={() => void handleVerifyOnChain(commitmentHex)}
                >
                  <SearchIcon className="size-4" />
                  Verify On-Chain (Audit Log)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Upload File ─────────────────────────────────── */}
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Credential File</CardTitle>
              <CardDescription>
                Upload a .json credential file to extract and verify the commitment hash.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-4" />
                Choose File
              </Button>
              {commitmentHex && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="gap-2"
                    disabled={!client || isTxPending || !commitmentHex}
                    onClick={() => void handleVerifyOnChain(commitmentHex)}
                  >
                    <SearchIcon className="size-4" />
                    Verify On-Chain (Audit Log)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Paste JSON ──────────────────────────────────── */}
        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>Paste Credential JSON</CardTitle>
              <CardDescription>
                Paste the W3C Verifiable Credential JSON to extract and verify the commitment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="v-json">VC JSON</Label>
                <Textarea
                  id="v-json"
                  placeholder='{"@context": [...], "credentialSubject": {...}}'
                  value={vcJson}
                  onChange={(e) => setVcJson(e.target.value)}
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="gap-2"
                  disabled={!vcJson}
                  onClick={handlePasteVerify}
                >
                  <SearchIcon className="size-4" />
                  Extract & Pre-Check
                </Button>
                {commitmentHex && (
                  <Button
                    variant="secondary"
                    className="gap-2"
                    disabled={!client || isTxPending || !commitmentHex}
                    onClick={() => void handleVerifyOnChain(commitmentHex)}
                  >
                    <SearchIcon className="size-4" />
                    Verify On-Chain
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Result ────────────────────────────────────────────── */}
      {result && (
        <>
          <Separator />
          <VerifyResult
            status={result.status}
            commitmentHex={result.commitment}
            details={result.details}
          />
        </>
      )}
    </DashboardLayout>
  )
}
