"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Loader2Icon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
  SendIcon,
  XIcon,
} from "lucide-react"
import type { TxProgress } from "@/lib/midnight"

const stageConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  building: { icon: <Loader2Icon className="size-4 animate-spin" />, color: "text-muted-foreground" },
  proving: { icon: <Loader2Icon className="size-4 animate-spin" />, color: "text-blue-500" },
  balancing: { icon: <WalletIcon className="size-4 animate-pulse" />, color: "text-yellow-500" },
  submitting: { icon: <SendIcon className="size-4 animate-pulse" />, color: "text-primary" },
  confirming: { icon: <Loader2Icon className="size-4 animate-spin" />, color: "text-primary" },
  done: { icon: <CheckCircleIcon className="size-4" />, color: "text-green-500" },
  error: { icon: <XCircleIcon className="size-4" />, color: "text-destructive" },
}

function getUserFriendlyHint(error: string): string | null {
  const lower = error.toLowerCase()
  if (lower.includes("rejected") || lower.includes("denied")) {
    return "You declined the transaction in your wallet. Try again when ready."
  }
  if (lower.includes("insufficient") || lower.includes("not enough") || lower.includes("not sufficient funds")) {
    return "Your wallet doesn\u2019t have enough DUST to cover this transaction. Request testnet tokens from the faucet."
  }
  if (lower.includes("consent")) {
    return "The patient has not granted consent for this credential. Ask them to grant consent first."
  }
  if (lower.includes("paused")) {
    return "The contract is currently paused by the admin. Try again after it is unpaused."
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "The network request timed out. Check your connection and try again."
  }
  return null
}

export function TxProgressIndicator({
  progress,
  onDismiss,
}: {
  progress: TxProgress | null
  onDismiss?: () => void
}) {
  if (!progress || progress.stage === "idle") return null

  const config = stageConfig[progress.stage] ?? stageConfig.building
  const canDismiss = progress.stage === "done" || progress.stage === "error"
  const hint = progress.error ? getUserFriendlyHint(progress.error) : null

  return (
    <Alert variant={progress.stage === "error" ? "destructive" : "default"} className="mt-4">
      <div className="flex items-center gap-2">
        <span className={config.color}>{config.icon}</span>
        <AlertDescription className="flex-1">{progress.message}</AlertDescription>
        {canDismiss && onDismiss && (
          <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={onDismiss}>
            <XIcon className="size-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
      {hint && progress.stage === "error" && (
        <AlertDescription className="mt-2 text-xs">
          {hint}
        </AlertDescription>
      )}
      {progress.error && progress.stage === "error" && !hint && (
        <AlertDescription className="mt-1 text-xs opacity-70">
          {progress.error}
        </AlertDescription>
      )}
    </Alert>
  )
}
