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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SearchIcon,
  ListChecksIcon,
  ClipboardCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { shortenAddress, bytesToHex, hexToBytes } from "@/lib/types"
import type { TxProgress } from "@/lib/midnight"

export default function VerifierPage() {
  const {
    ledgerStats,
    ledgerState,
    isLoadingState,
    refreshLedgerState,
    client,
    isTxPending,
  } = useWallet()

  const [commitmentHex, setCommitmentHex] = useState("")
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)

  const verifications = ledgerState?.verificationLog ?? []
  const successCount = verifications.filter((v) => v.is_valid).length
  const failCount = verifications.filter((v) => !v.is_valid).length

  const handleVerify = async () => {
    setTxProgress({ stage: "building", message: "Preparing verify_credential transaction..." })
    try {
      await client!.verifyCredential(
        { commitment: hexToBytes(commitmentHex.replace(/^0x/, "")) },
        setTxProgress,
      )
      setTxProgress({ stage: "done", message: "Verification recorded on-chain." })
      setCommitmentHex("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
    }
  }

  return (
    <DashboardLayout role="verifier" pageTitle="Verifier Dashboard">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => void refreshLedgerState()} disabled={isLoadingState}>
          <RefreshCwIcon className={`mr-2 size-4 ${isLoadingState ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid</CardTitle>
            <CheckCircleIcon className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{successCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Valid credentials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid</CardTitle>
            <XCircleIcon className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoadingState ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{failCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Invalid credentials</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <TxProgressIndicator progress={txProgress} />

      {/* ── Verify Credential ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="size-5" />
            Verify Credential
          </CardTitle>
          <CardDescription>
            Verify a credential commitment on-chain. The contract checks the credential
            exists, is not revoked, and has not expired. A verification record is appended
            to the immutable audit log.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-commitment">Commitment Hash (32-byte hex)</Label>
            <Input
              id="verify-commitment"
              placeholder="64 hex characters"
              value={commitmentHex}
              onChange={(e) => setCommitmentHex(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <Button
            className="gap-2"
            disabled={!client || isTxPending || !commitmentHex}
            onClick={() => void handleVerify()}
          >
            <SearchIcon className="size-4" />
            Verify Credential
          </Button>
        </CardContent>
      </Card>

      {/* ── Verification Log ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecksIcon className="size-5" />
            Verification Log
          </CardTitle>
          <CardDescription>History of all recorded verifications from the ledger</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingState ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : verifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No verifications recorded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commitment</TableHead>
                  <TableHead>Verifier</TableHead>
                  <TableHead>Log Key</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((ver) => (
                  <TableRow key={ver.logKeyHex}>
                    <TableCell className="font-mono text-xs">
                      {shortenAddress(bytesToHex(ver.commitment))}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {shortenAddress(bytesToHex(ver.verifier.bytes))}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ver.logKeyHex.slice(0, 12)}...
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
