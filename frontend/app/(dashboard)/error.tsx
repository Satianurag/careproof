"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-sm text-neutral-400 mb-6 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} className="bg-orange-500 hover:bg-orange-600 text-white">
        Try Again
      </Button>
    </div>
  )
}
