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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  PauseIcon,
  PlayIcon,
  ArrowRightLeftIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { hexToBytes, shortenAddress } from "@/lib/types"
import type { TxProgress } from "@/lib/midnight"
import { toast } from "sonner"

type PendingAction = "pause" | "unpause" | "transfer" | null

export default function ControlPage() {
  const {
    client,
    isTxPending,
    walletAddress,
  } = useWallet()

  const [transferKey, setTransferKey] = useState("")
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)
  const [confirmAction, setConfirmAction] = useState<PendingAction>(null)
  const [confirmText, setConfirmText] = useState("")

  const handlePause = async () => {
    if (!client) return
    setConfirmAction(null)
    setTxProgress({ stage: "building", message: "Pausing contract..." })
    try {
      await client.pause(setTxProgress)
      setTxProgress({ stage: "done", message: "Contract paused." })
      toast.success("Contract paused")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to pause contract")
    }
  }

  const handleUnpause = async () => {
    if (!client) return
    setConfirmAction(null)
    setTxProgress({ stage: "building", message: "Unpausing contract..." })
    try {
      await client.unpause(setTxProgress)
      setTxProgress({ stage: "done", message: "Contract unpaused." })
      toast.success("Contract unpaused")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to unpause contract")
    }
  }

  const handleTransferAdmin = async () => {
    if (!client || !transferKey) return
    setConfirmAction(null)
    setConfirmText("")
    setTxProgress({ stage: "building", message: "Transferring admin role..." })
    try {
      const clean = transferKey.replace(/^0x/, "")
      await client.transferAdmin({ newAdmin: { bytes: hexToBytes(clean) } }, setTxProgress)
      setTxProgress({ stage: "done", message: "Admin role transferred. You are no longer admin." })
      toast.success("Admin role transferred")
      setTransferKey("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to transfer admin role")
    }
  }

  return (
    <DashboardLayout role="admin" pageTitle="Contract Control">
      <TxProgressIndicator progress={txProgress} />

      {/* ── Pause / Unpause ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PauseIcon className="size-5" />
            Emergency Circuit Breaker
          </CardTitle>
          <CardDescription>
            Pause all contract operations using OpenZeppelin Pausable.
            While paused, no credentials can be issued, revoked, or verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Caution</AlertTitle>
            <AlertDescription>
              Pausing the contract affects all users immediately. Only pause in emergencies.
            </AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!client || isTxPending}
              onClick={() => setConfirmAction("pause")}
            >
              <PauseIcon className="size-4" />
              Pause Contract
            </Button>
            <Button
              className="gap-2"
              disabled={!client || isTxPending}
              onClick={() => setConfirmAction("unpause")}
            >
              <PlayIcon className="size-4" />
              Unpause Contract
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Transfer Admin ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeftIcon className="size-5" />
            Transfer Admin Role
          </CardTitle>
          <CardDescription>
            Transfer the DEFAULT_ADMIN_ROLE to a new address. This is irreversible &mdash;
            you will lose all admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <ShieldAlertIcon className="size-4" />
            <AlertTitle>Irreversible Action</AlertTitle>
            <AlertDescription>
              Once transferred, only the new admin can manage roles and contract settings.
              You will be downgraded to patient role. Double-check the new admin address.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="transfer-admin-key">New Admin Public Key (hex)</Label>
            <Input
              id="transfer-admin-key"
              placeholder="0x... or raw hex"
              value={transferKey}
              onChange={(e) => setTransferKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          {transferKey && (
            <div className="rounded-lg border bg-muted p-3 text-sm">
              <p className="text-muted-foreground">Transfer from:</p>
              <p className="font-mono text-xs">{walletAddress ? shortenAddress(walletAddress) : "Unknown"}</p>
              <p className="mt-2 text-muted-foreground">Transfer to:</p>
              <p className="font-mono text-xs">{shortenAddress(transferKey.replace(/^0x/, ""))}</p>
            </div>
          )}
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!client || isTxPending || !transferKey}
            onClick={() => setConfirmAction("transfer")}
          >
            <ArrowRightLeftIcon className="size-4" />
            Transfer Admin Role
          </Button>
        </CardContent>
      </Card>

      {/* ── Confirmation Dialogs ──────────────────────────────── */}
      <AlertDialog open={confirmAction === "pause"} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Contract</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately halt all contract operations: credential issuance,
              revocation, verification, and consent management. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handlePause()}
            >
              Confirm Pause
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === "unpause"} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpause Contract</AlertDialogTitle>
            <AlertDialogDescription>
              This will resume all contract operations. Users will be able to issue,
              revoke, and verify credentials again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleUnpause()}>
              Confirm Unpause
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === "transfer"} onOpenChange={(open) => { if (!open) { setConfirmAction(null); setConfirmText("") } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Admin Role — Irreversible</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                You are about to transfer admin control to{" "}
                <span className="font-mono text-xs">{shortenAddress(transferKey.replace(/^0x/, ""))}</span>.
              </span>
              <span className="block font-semibold text-destructive">
                This cannot be undone. You will lose all admin privileges.
              </span>
              <span className="block">
                Type <span className="font-mono font-bold">TRANSFER</span> to confirm:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type TRANSFER to confirm"
            className="font-mono"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={confirmText !== "TRANSFER"}
              onClick={() => void handleTransferAdmin()}
            >
              Transfer Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
