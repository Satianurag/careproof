"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileCheck, CheckCircle, XCircle, HandshakeIcon } from "lucide-react"
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

const issueSchema = z.object({
  credentialId: z.string().min(1, "Credential ID is required").refine((v) => /^\d+$/.test(v), "Must be a positive integer"),
  patientAddress: z.string().min(1, "Patient address is required").refine(
    (v) => v.startsWith("mn_") || v.length >= 20,
    "Must be a valid Midnight address (Bech32m, starting with mn_)",
  ),
  dataHash: z.string().min(1, "Data hash is required").refine(
    (v) => /^(0x)?[0-9a-fA-F]{1,64}$/.test(v),
    "Must be a valid hex hash (up to 64 hex characters)",
  ),
  expiryDate: z.string().min(1, "Expiry date is required").refine(
    (v) => new Date(v) > new Date(),
    "Expiry date must be in the future",
  ),
})

const consentSchema = z.object({
  doctorAddress: z.string().min(1, "Doctor address is required").refine(
    (v) => v.startsWith("mn_") || v.length >= 20,
    "Must be a valid Midnight address (Bech32m, starting with mn_)",
  ),
  credentialId: z.string().min(1, "Credential ID is required").refine((v) => /^\d+$/.test(v), "Must be a positive integer"),
})

export default function CredentialsPage() {
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [showConsentForm, setShowConsentForm] = useState(false)
  const [issueForm, setIssueForm] = useState({ credentialId: "", patientAddress: "", dataHash: "", expiryDate: "" })
  const [consentForm, setConsentForm] = useState({ doctorAddress: "", credentialId: "" })
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({})
  const [consentErrors, setConsentErrors] = useState<Record<string, string>>({})
  const { state, isLoading } = useContractState()

  const handleIssue = () => {
    const result = issueSchema.safeParse(issueForm)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((e) => { errors[e.path[0] as string] = e.message })
      setIssueErrors(errors)
      return
    }
    setIssueErrors({})
    toast.success("Submitting issue credential transaction...")
    setShowIssueForm(false)
    setIssueForm({ credentialId: "", patientAddress: "", dataHash: "", expiryDate: "" })
  }

  const handleConsent = () => {
    const result = consentSchema.safeParse(consentForm)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((e) => { errors[e.path[0] as string] = e.message })
      setConsentErrors(errors)
      return
    }
    setConsentErrors({})
    toast.success("Submitting grant consent transaction...")
    setShowConsentForm(false)
    setConsentForm({ doctorAddress: "", credentialId: "" })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">Credentials</h1>
          <p className="text-sm text-neutral-400">Issue, track, and revoke healthcare credentials</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { setConsentErrors({}); setShowConsentForm(true) }}>
            Grant Consent
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { setIssueErrors({}); setShowIssueForm(true) }}>
            Issue Credential
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">ACTIVE</p>
                    <p className="text-2xl font-bold text-white font-mono">{state?.active_count ?? "—"}</p>
                  </div>
                  <FileCheck className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">TOTAL ISSUED</p>
                    <p className="text-2xl font-bold text-white font-mono">{state?.total_credentials ?? "—"}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">REVOKED</p>
                    <p className="text-2xl font-bold text-red-500 font-mono">{state?.revoked_count ?? "—"}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 tracking-wider">CONSENT ENTRIES</p>
                    <p className="text-2xl font-bold text-orange-500 font-mono">{state?.consent_count ?? "—"}</p>
                  </div>
                  <HandshakeIcon className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Empty State */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileCheck className="w-12 h-12 text-neutral-700 mb-4" />
            <p className="text-sm text-neutral-400">No credentials issued yet</p>
            <p className="text-xs text-neutral-500 mt-1">Issue a credential or grant consent to get started</p>
          </div>
        </CardContent>
      </Card>

      {/* Issue Credential Dialog */}
      <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
        <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white tracking-wider">Issue Credential</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Issue a new healthcare credential on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">CREDENTIAL ID</label>
              <Input
                placeholder="e.g. 1"
                value={issueForm.credentialId}
                onChange={(e) => { setIssueForm({ ...issueForm, credentialId: e.target.value }); setIssueErrors((p) => ({ ...p, credentialId: "" })) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!issueErrors.credentialId}
              />
              {issueErrors.credentialId && <p className="text-xs text-red-500 mt-1">{issueErrors.credentialId}</p>}
            </div>
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">PATIENT WALLET ADDRESS</label>
              <Input
                placeholder="mn_addr1..."
                value={issueForm.patientAddress}
                onChange={(e) => { setIssueForm({ ...issueForm, patientAddress: e.target.value }); setIssueErrors((p) => ({ ...p, patientAddress: "" })) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!issueErrors.patientAddress}
              />
              {issueErrors.patientAddress && <p className="text-xs text-red-500 mt-1">{issueErrors.patientAddress}</p>}
            </div>
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">CREDENTIAL DATA HASH</label>
              <Input
                placeholder="0x..."
                value={issueForm.dataHash}
                onChange={(e) => { setIssueForm({ ...issueForm, dataHash: e.target.value }); setIssueErrors((p) => ({ ...p, dataHash: "" })) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!issueErrors.dataHash}
              />
              {issueErrors.dataHash && <p className="text-xs text-red-500 mt-1">{issueErrors.dataHash}</p>}
            </div>
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">EXPIRY DATE</label>
              <Input
                type="date"
                value={issueForm.expiryDate}
                onChange={(e) => { setIssueForm({ ...issueForm, expiryDate: e.target.value }); setIssueErrors((p) => ({ ...p, expiryDate: "" })) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!issueErrors.expiryDate}
              />
              {issueErrors.expiryDate && <p className="text-xs text-red-500 mt-1">{issueErrors.expiryDate}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleIssue}>Issue Credential</Button>
              <Button variant="outline" className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent" onClick={() => setShowIssueForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Consent Dialog */}
      <Dialog open={showConsentForm} onOpenChange={setShowConsentForm}>
        <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white tracking-wider">Grant Consent</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Allow a doctor to issue a credential on your behalf.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">DOCTOR WALLET ADDRESS</label>
              <Input
                placeholder="mn_addr1..."
                value={consentForm.doctorAddress}
                onChange={(e) => { setConsentForm({ ...consentForm, doctorAddress: e.target.value }); setConsentErrors((p) => ({ ...p, doctorAddress: "" })) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!consentErrors.doctorAddress}
              />
              {consentErrors.doctorAddress && <p className="text-xs text-red-500 mt-1">{consentErrors.doctorAddress}</p>}
            </div>
            <div>
              <label className="text-xs text-neutral-400 tracking-wider mb-2 block">CREDENTIAL ID</label>
              <Input
                placeholder="e.g. 1"
                value={consentForm.credentialId}
                onChange={(e) => { setConsentForm({ ...consentForm, credentialId: e.target.value }); setConsentErrors((p) => ({ ...p, credentialId: "" })) }}
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 font-mono"
                aria-invalid={!!consentErrors.credentialId}
              />
              {consentErrors.credentialId && <p className="text-xs text-red-500 mt-1">{consentErrors.credentialId}</p>}
            </div>
            <p className="text-xs text-neutral-500">
              Granting consent allows the specified doctor to issue a credential on your behalf.
              This uses your wallet&apos;s public key as the patient identity.
            </p>
            <div className="flex gap-2 pt-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleConsent}>Grant Consent</Button>
              <Button variant="outline" className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent" onClick={() => setShowConsentForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
