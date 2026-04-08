"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOffIcon, RefreshCwIcon } from "lucide-react"

export function WalletStatusBanner() {
  const { isConnected, isWalletHealthy, retryConnect, isConnecting, error } = useWallet()

  if (!isConnected && error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOffIcon className="size-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={isConnecting}
            onClick={() => void retryConnect()}
            className="ml-2 gap-1"
          >
            <RefreshCwIcon className={`size-3 ${isConnecting ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (isConnected && !isWalletHealthy) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOffIcon className="size-4" />
        <AlertTitle>Wallet Disconnected</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            Your wallet connection was lost. Transactions will fail until you reconnect.
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={isConnecting}
            onClick={() => void retryConnect()}
            className="ml-2 gap-1"
          >
            <RefreshCwIcon className={`size-3 ${isConnecting ? "animate-spin" : ""}`} />
            Reconnect
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
