"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Settings, Pause, Play, ArrowRightLeft, AlertTriangle, Info } from "lucide-react"
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
import { z } from "zod"
import { useSimulation } from "@/lib/simulation-context"

const adminSchema = z.object({
  adminAddress: z.string().min(1, "Admin address is required").refine(
    (v) => v.startsWith("mn_") || v.length >= 20,
    "Must be a valid Midnight address (Bech32m, starting with mn_)",
  ),
})

const CONTRACT_CIRCUITS = [
  { name: "issue_credential", role: "DOCTOR" },
  { name: "revoke_credential", role: "DOCTOR" },
  { name: "grant_consent", role: "PATIENT" },
  { name: "verify_credential", role: "VERIFIER" },
  { name: "add_doctor", role: "ADMIN" },
  { name: "remove_doctor", role: "ADMIN" },
  { name: "add_verifier", role: "ADMIN" },
  { name: "remove_verifier", role: "ADMIN" },
  { name: "pause_contract", role: "ADMIN" },
  { name: "unpause_contract", role: "ADMIN" },
  { name: "transfer_admin", role: "ADMIN" },
]

const NETWORK_SERVICES = [
  { name: "Midnight Node", endpoint: "http://127.0.0.1:9944", status: "active" },
  { name: "Proof Server", endpoint: "http://127.0.0.1:6300", status: "active" },
  { name: "Indexer", endpoint: "http://127.0.0.1:8088/api/v3/graphql", status: "active" },
]

export default function SettingsPage() {
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [adminAddress, setAdminAddress] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { state, isLoading } = useContractState()
  const { sim, togglePause, resetSimulation } = useSimulation()

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || state?.contractAddress || "Not configured"
  const network = state?.network || "Localnet"

  const handlePauseToggle = () => {
    togglePause()
    if (sim.paused) {
      toast.success("Contract unpaused successfully")
    } else {
      toast.success("Contract paused successfully")
    }
  }

  const handleTransferAdmin = () => {
    const result = adminSchema.safeParse({ adminAddress })
    if (!result.success) {
      setValidationError(result.error.errors[0].message)
      return
    }
    setValidationError(null)
    toast.success("Submitting transfer admin transaction...")
    setShowTransferDialog(false)
    setAdminAddress("")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">Network & Contract</h1>
          <p className="text-sm text-neutral-400">Contract configuration, network status, and admin controls</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
            onClick={handlePauseToggle}
          >
            {sim.paused ? (
              <><Play className="w-4 h-4 mr-2" /> Unpause Contract</>
            ) : (
              <><Pause className="w-4 h-4 mr-2" /> Pause Contract</>
            )}
          </Button>
          <Button
            variant="outline"
            className="border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 bg-transparent"
            onClick={() => { setValidationError(null); setAdminAddress(""); setShowTransferDialog(true) }}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Admin
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <p className="text-xs text-neutral-400 tracking-wider mb-1">CONTRACT STATUS</p>
                <Badge variant={sim.paused ? "destructive" : "default"} className={sim.paused ? "" : "bg-green-900 text-green-300 border-green-700"}>
                  {sim.paused ? "PAUSED" : "ACTIVE"}
                </Badge>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <p className="text-xs text-neutral-400 tracking-wider mb-1">NETWORK</p>
                <p className="text-lg font-bold text-orange-500 font-mono">{network.toUpperCase()}</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <p className="text-xs text-neutral-400 tracking-wider mb-1">
                  MERKLE TREE DEPTH
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-neutral-500 inline-block ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-xs text-xs">
                      Depth of the on-chain Merkle tree that stores credential commitments. A depth of 16 supports up to 65,536 credentials.
                    </TooltipContent>
                  </Tooltip>
                </p>
                <p className="text-lg font-bold text-white font-mono">16</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <p className="text-xs text-neutral-400 tracking-wider mb-1">COMPACT VERSION</p>
                <p className="text-lg font-bold text-white font-mono">v0.30.0</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Contract Configuration */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4" /> Contract Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Contract Address", value: contractAddress },
              { label: "Admin Role Hash", value: "keccak256('ADMIN_ROLE')" },
              { label: "Doctor Role Hash", value: "keccak256('DOCTOR_ROLE')" },
              { label: "Verifier Role Hash", value: "keccak256('VERIFIER_ROLE')" },
              { label: "Merkle Depth", value: "16" },
              { label: "Pausable", value: "Yes" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                <span className="text-xs text-neutral-400">{item.label}</span>
                <span className="text-xs text-orange-500 font-mono break-all text-right max-w-[60%]">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Circuits */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Contract Circuits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTRACT_CIRCUITS.map((circuit) => (
              <div key={circuit.name} className="flex items-center justify-between p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                <span className="text-xs text-white font-mono">{circuit.name}</span>
                <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                  {circuit.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Services */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Network Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {NETWORK_SERVICES.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <div className="text-xs text-white">{service.name}</div>
                    <div className="text-xs text-neutral-500 font-mono">{service.endpoint}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs border-green-800 text-green-400">
                  {service.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Admin Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Transfer Admin
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Transfer contract admin ownership to a new address. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-red-900/20 border border-red-800 rounded">
              <p className="text-xs text-red-400">
                Warning: You will lose all admin privileges once the transfer is confirmed.
                Make sure the new admin address is correct.
              </p>
            </div>
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">NEW ADMIN WALLET ADDRESS</label>
              <Input
                placeholder="mn_addr1..."
                value={adminAddress}
                onChange={(e) => { setAdminAddress(e.target.value); setValidationError(null) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!validationError}
              />
              {validationError && <p className="text-xs text-red-500 mt-1">{validationError}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleTransferAdmin}>
                Confirm Transfer
              </Button>
              <Button variant="outline" className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent" onClick={() => setShowTransferDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
