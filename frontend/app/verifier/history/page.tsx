"use client"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ListChecksIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { shortenAddress, bytesToHex } from "@/lib/types"

export default function HistoryPage() {
  const {
    ledgerState,
    isLoadingState,
    refreshLedgerState,
  } = useWallet()

  const verifications = ledgerState?.verificationLog ?? []

  // Filter to show only this verifier's records if we can identify them
  // For now, show all verifications (indexer returns global log)
  const myVerifications = verifications

  return (
    <DashboardLayout role="verifier" pageTitle="Verification History">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {myVerifications.length} verification{myVerifications.length !== 1 ? "s" : ""} recorded
        </p>
        <Button variant="outline" size="sm" onClick={() => void refreshLedgerState()} disabled={isLoadingState}>
          <RefreshCwIcon className={`mr-2 size-4 ${isLoadingState ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecksIcon className="size-5" />
            Verification Log
          </CardTitle>
          <CardDescription>
            Complete history of credential verifications recorded on-chain.
            Each entry is immutable and includes the verifier identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingState ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : myVerifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No verifications recorded yet. Use the Verify page to check credentials.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>Commitment</TableHead>
                    <TableHead>Verifier</TableHead>
                    <TableHead>Log Key</TableHead>
                    <TableHead className="text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myVerifications.map((ver, idx) => (
                    <TableRow key={ver.logKeyHex}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {shortenAddress(bytesToHex(ver.commitment))}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {shortenAddress(bytesToHex(ver.verifier.bytes))}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {ver.logKeyHex.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-right">
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
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
