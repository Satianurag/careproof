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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  StethoscopeIcon,
  ClipboardCheckIcon,
  UserPlusIcon,
  UserMinusIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { hexToBytes, shortenAddress } from "@/lib/types"
import type { TxProgress } from "@/lib/midnight"
import { toast } from "sonner"

export default function RolesPage() {
  const {
    client,
    isTxPending,
    refreshLedgerState,
    isLoadingState,
  } = useWallet()

  const [doctorKey, setDoctorKey] = useState("")
  const [verifierKey, setVerifierKey] = useState("")
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<{ type: "doctor" | "verifier"; key: string } | null>(null)

  const handleAddDoctor = async () => {
    if (!client || !doctorKey) return
    setTxProgress({ stage: "building", message: "Granting DOCTOR_ROLE..." })
    try {
      const clean = doctorKey.replace(/^0x/, "")
      await client.addDoctor({ account: { bytes: hexToBytes(clean) } }, setTxProgress)
      setTxProgress({ stage: "done", message: "Doctor role granted." })
      toast.success("Doctor role granted")
      setDoctorKey("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to grant doctor role")
    }
  }

  const handleAddVerifier = async () => {
    if (!client || !verifierKey) return
    setTxProgress({ stage: "building", message: "Granting VERIFIER_ROLE..." })
    try {
      const clean = verifierKey.replace(/^0x/, "")
      await client.addVerifier({ account: { bytes: hexToBytes(clean) } }, setTxProgress)
      setTxProgress({ stage: "done", message: "Verifier role granted." })
      toast.success("Verifier role granted")
      setVerifierKey("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error("Failed to grant verifier role")
    }
  }

  const handleRemoveRole = async () => {
    if (!client || !pendingRemoval) return
    const { type, key } = pendingRemoval
    const label = type === "doctor" ? "DOCTOR_ROLE" : "VERIFIER_ROLE"
    setTxProgress({ stage: "building", message: `Revoking ${label}...` })
    try {
      if (type === "doctor") {
        await client.removeDoctor({ account: { bytes: hexToBytes(key) } }, setTxProgress)
      } else {
        await client.removeVerifier({ account: { bytes: hexToBytes(key) } }, setTxProgress)
      }
      setTxProgress({ stage: "done", message: `${label} revoked.` })
      toast.success(`${label} revoked`)
      setPendingRemoval(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTxProgress({ stage: "error", message: msg, error: msg })
      toast.error(`Failed to revoke ${label}`)
      setPendingRemoval(null)
    }
  }

  return (
    <DashboardLayout role="admin" pageTitle="Role Management">
      <TxProgressIndicator progress={txProgress} />

      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => void refreshLedgerState()} disabled={isLoadingState}>
          <RefreshCwIcon className={`mr-2 size-4 ${isLoadingState ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="doctors">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="doctors" className="gap-2">
            <StethoscopeIcon className="size-4" />
            Doctors
          </TabsTrigger>
          <TabsTrigger value="verifiers" className="gap-2">
            <ClipboardCheckIcon className="size-4" />
            Verifiers
          </TabsTrigger>
        </TabsList>

        {/* ── Doctors Tab ──────────────────────────────────────── */}
        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlusIcon className="size-5" />
                Grant Doctor Role
              </CardTitle>
              <CardDescription>
                Grant DOCTOR_ROLE to a public key. Doctors can issue credentials
                to patients who have granted consent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-doctor-key">Doctor Public Key (hex)</Label>
                <Input
                  id="add-doctor-key"
                  placeholder="0x... or raw hex"
                  value={doctorKey}
                  onChange={(e) => setDoctorKey(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <Button
                className="gap-2"
                disabled={!client || isTxPending || !doctorKey}
                onClick={() => void handleAddDoctor()}
              >
                <UserPlusIcon className="size-4" />
                Grant Doctor Role
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StethoscopeIcon className="size-5" />
                Revoke Doctor Role
              </CardTitle>
              <CardDescription>
                Enter a doctor&apos;s public key to revoke their role. The revocation is
                recorded on-chain and takes effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remove-doctor-key">Doctor Public Key (hex)</Label>
                <Input
                  id="remove-doctor-key"
                  placeholder="0x... or raw hex key to revoke"
                  className="font-mono text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.replace(/^0x/, "")
                      if (val) setPendingRemoval({ type: "doctor", key: val })
                    }
                  }}
                />
              </div>
              <AlertDialog open={pendingRemoval?.type === "doctor"} onOpenChange={(open) => !open && setPendingRemoval(null)}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    disabled={!client || isTxPending}
                    onClick={() => {
                      const input = document.getElementById("remove-doctor-key") as HTMLInputElement
                      const val = input?.value?.replace(/^0x/, "")
                      if (val) setPendingRemoval({ type: "doctor", key: val })
                    }}
                  >
                    <UserMinusIcon className="size-4" />
                    Revoke Doctor
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Doctor Role</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove DOCTOR_ROLE from{" "}
                      <span className="font-mono text-xs">{pendingRemoval ? shortenAddress(pendingRemoval.key) : ""}</span>.
                      They will no longer be able to issue credentials. This action is on-chain and irreversible without re-granting.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => void handleRemoveRole()}
                    >
                      Confirm Revocation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Verifiers Tab ────────────────────────────────────── */}
        <TabsContent value="verifiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlusIcon className="size-5" />
                Grant Verifier Role
              </CardTitle>
              <CardDescription>
                Grant VERIFIER_ROLE to a public key. Verifiers can check credential
                validity and create audit log entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-verifier-key">Verifier Public Key (hex)</Label>
                <Input
                  id="add-verifier-key"
                  placeholder="0x... or raw hex"
                  value={verifierKey}
                  onChange={(e) => setVerifierKey(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <Button
                className="gap-2"
                disabled={!client || isTxPending || !verifierKey}
                onClick={() => void handleAddVerifier()}
              >
                <UserPlusIcon className="size-4" />
                Grant Verifier Role
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheckIcon className="size-5" />
                Revoke Verifier Role
              </CardTitle>
              <CardDescription>
                Enter a verifier&apos;s public key to revoke their role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remove-verifier-key">Verifier Public Key (hex)</Label>
                <Input
                  id="remove-verifier-key"
                  placeholder="0x... or raw hex key to revoke"
                  className="font-mono text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.replace(/^0x/, "")
                      if (val) setPendingRemoval({ type: "verifier", key: val })
                    }
                  }}
                />
              </div>
              <AlertDialog open={pendingRemoval?.type === "verifier"} onOpenChange={(open) => !open && setPendingRemoval(null)}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    disabled={!client || isTxPending}
                    onClick={() => {
                      const input = document.getElementById("remove-verifier-key") as HTMLInputElement
                      const val = input?.value?.replace(/^0x/, "")
                      if (val) setPendingRemoval({ type: "verifier", key: val })
                    }}
                  >
                    <UserMinusIcon className="size-4" />
                    Revoke Verifier
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Verifier Role</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove VERIFIER_ROLE from{" "}
                      <span className="font-mono text-xs">{pendingRemoval ? shortenAddress(pendingRemoval.key) : ""}</span>.
                      They will no longer be able to verify credentials on-chain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => void handleRemoveRole()}
                    >
                      Confirm Revocation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
