"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShieldCheck, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useContractState } from "@/lib/hooks/use-contract-state"
import { SkeletonCard } from "@/components/skeleton-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { z } from "zod"

const verifySchema = z.object({
  dataHash: z.string().min(1, "Credential data hash is required").refine(
    (v) => /^(0x)?[0-9a-fA-F]{1,64}$/.test(v),
    "Must be a valid hex hash (up to 64 hex characters)",
  ),
})

export default function VerificationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showVerifyForm, setShowVerifyForm] = useState(false)
  const [dataHash, setDataHash] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { state, isLoading } = useContractState()

  const handleVerify = () => {
    const result = verifySchema.safeParse({ dataHash })
    if (!result.success) {
      setValidationError(result.error.errors[0].message)
      return
    }
    setValidationError(null)
    toast.success("Submitting verify credential transaction...")
    setShowVerifyForm(false)
    setDataHash("")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">Verification Center</h1>
          <p className="text-sm text-neutral-400">Verify credentials and review audit trail</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => { setValidationError(null); setDataHash(""); setShowVerifyForm(true) }}
        >
          Verify Credential
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search verification records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">
                      TOTAL VERIFICATIONS
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-neutral-500 inline-block ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-xs text-xs">
                          Total ZK proof verifications performed against the on-chain Merkle tree
                        </TooltipContent>
                      </Tooltip>
                    </p>
                    <p className="text-2xl font-bold text-white font-mono">{state?.total_verifications ?? "—"}</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">VALID</p>
                    <p className="text-2xl font-bold text-green-400 font-mono">&mdash;</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">FAILED</p>
                    <p className="text-2xl font-bold text-red-500 font-mono">&mdash;</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Audit Trail */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Verification Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">TIMESTAMP</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">CREDENTIAL HASH</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">VERIFIER</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">RESULT</th>
                </tr>
              </thead>
              <tbody />
            </table>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="w-12 h-12 text-neutral-700 mb-4" />
            <p className="text-sm text-neutral-400">No verification records yet</p>
            <p className="text-xs text-neutral-500 mt-1">Verify a credential to create an audit trail entry</p>
          </div>
        </CardContent>
      </Card>

      {/* Verify Credential Dialog */}
      <Dialog open={showVerifyForm} onOpenChange={setShowVerifyForm}>
        <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white tracking-wider">Verify Credential</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Verify a credential by providing its data hash. A zero-knowledge proof will be generated
              and verified against the on-chain Merkle tree.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">CREDENTIAL DATA HASH</label>
              <Input
                placeholder="0x..."
                value={dataHash}
                onChange={(e) => { setDataHash(e.target.value); setValidationError(null) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!validationError}
              />
              {validationError && <p className="text-xs text-red-500 mt-1">{validationError}</p>}
              <p className="text-xs text-neutral-500 mt-1">
                The SHA-256 hash of the credential data to verify against the on-chain Merkle tree
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleVerify}>Verify</Button>
              <Button variant="outline" className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent" onClick={() => setShowVerifyForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
