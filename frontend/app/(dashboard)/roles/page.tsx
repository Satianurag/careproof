"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserCog, ShieldCheck, Shield } from "lucide-react"
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
import { z } from "zod"

const walletAddressSchema = z
  .string()
  .min(1, "Wallet address is required")
  .refine(
    (val) => val.startsWith("mn_") || val.length >= 20,
    "Must be a valid Midnight wallet address (Bech32m format starting with mn_)",
  )

export default function RoleManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [addRoleDialog, setAddRoleDialog] = useState<{ open: boolean; type: string }>({ open: false, type: "" })
  const [walletAddress, setWalletAddress] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { state, isLoading } = useContractState()

  const handleSubmitRole = () => {
    const result = walletAddressSchema.safeParse(walletAddress)
    if (!result.success) {
      setValidationError(result.error.errors[0].message)
      return
    }
    setValidationError(null)
    toast.success(`Submitting add ${addRoleDialog.type} transaction...`)
    setAddRoleDialog({ open: false, type: "" })
    setWalletAddress("")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">Role Management</h1>
          <p className="text-sm text-neutral-400">Manage doctors, verifiers, and admin access</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => { setWalletAddress(""); setValidationError(null); setAddRoleDialog({ open: true, type: "doctor" }) }}
          >
            Add Doctor
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => { setWalletAddress(""); setValidationError(null); setAddRoleDialog({ open: true, type: "verifier" }) }}
          >
            Add Verifier
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search by public key or role..."
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
                    <p className="text-xs text-neutral-400 tracking-wider">DOCTORS</p>
                    <p className="text-2xl font-bold text-white font-mono">&mdash;</p>
                  </div>
                  <UserCog className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">VERIFIERS</p>
                    <p className="text-2xl font-bold text-white font-mono">&mdash;</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">ADMINS</p>
                    <p className="text-2xl font-bold text-orange-500 font-mono">&mdash;</p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Role Members Table */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Role Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">WALLET ADDRESS</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ROLE</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">STATUS</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ASSIGNED BY</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody />
            </table>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCog className="w-12 h-12 text-neutral-700 mb-4" />
            <p className="text-sm text-neutral-400">No roles assigned yet</p>
            <p className="text-xs text-neutral-500 mt-1">Add a doctor or verifier to get started</p>
          </div>
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={addRoleDialog.open} onOpenChange={(open) => setAddRoleDialog({ ...addRoleDialog, open })}>
        <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white tracking-wider">
              Add {addRoleDialog.type.charAt(0).toUpperCase() + addRoleDialog.type.slice(1)}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Enter the Midnight wallet address to assign the {addRoleDialog.type} role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">WALLET ADDRESS</label>
              <Input
                placeholder="mn_addr1..."
                value={walletAddress}
                onChange={(e) => { setWalletAddress(e.target.value); setValidationError(null) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!validationError}
              />
              {validationError && (
                <p className="text-xs text-red-500 mt-1">{validationError}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">The Midnight wallet address of the {addRoleDialog.type} to add</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmitRole}>
                Add {addRoleDialog.type.charAt(0).toUpperCase() + addRoleDialog.type.slice(1)}
              </Button>
              <Button
                variant="outline"
                className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                onClick={() => setAddRoleDialog({ open: false, type: "" })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
