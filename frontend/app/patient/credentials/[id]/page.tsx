"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
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
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeftIcon,
  CopyIcon,
  DownloadIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  ClockIcon,
  ShareIcon,
} from "lucide-react"
import { getCredential, type StoredCredential } from "@/lib/storage/db"
import {
  credentialTypeDisplay,
  formatExpiry,
  STATUS_STYLES,
  type CredentialDisplayStatus,
} from "@/lib/credentials/display"
import { shortenDid } from "@/lib/credentials/did"
import { shortenAddress } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

const StatusIcon = ({ status }: { status: CredentialDisplayStatus }) => {
  switch (status) {
    case "active": return <ShieldCheckIcon className="size-5 text-green-500" />
    case "revoked": return <ShieldOffIcon className="size-5 text-destructive" />
    case "expired": return <ClockIcon className="size-5 text-muted-foreground" />
  }
}

export default function CredentialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [credential, setCredential] = useState<StoredCredential | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const cred = await getCredential(id)
        setCredential(cred ?? null)
      } catch (err) {
        console.error("Failed to load credential:", err)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id])

  const vcJson = credential ? JSON.stringify(credential.vc, null, 2) : ""

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const downloadVC = () => {
    if (!credential) return
    const blob = new Blob([vcJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `careproof-credential-${credential.credentialId}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Credential downloaded")
  }

  if (isLoading) {
    return (
      <DashboardLayout role="patient" pageTitle="Credential Detail">
        <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      </DashboardLayout>
    )
  }

  if (!credential) {
    return (
      <DashboardLayout role="patient" pageTitle="Credential Not Found">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Credential #{id} not found in your local vault.
              </p>
              <Button variant="outline" onClick={() => router.push("/patient/credentials")}>
                <ArrowLeftIcon className="mr-2 size-4" />
                Back to Vault
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const typeInfo = credentialTypeDisplay(credential.credentialType)
  const expiry = formatExpiry(new Date(credential.expiryUnix * 1000).toISOString())
  const style = STATUS_STYLES[credential.status]

  return (
    <DashboardLayout role="patient" pageTitle={`Credential #${credential.credentialId}`}>
      <Button variant="ghost" size="sm" onClick={() => router.push("/patient/credentials")}>
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Vault
      </Button>

      {/* ── Overview Card ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon status={credential.status} />
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className={typeInfo.color}>{typeInfo.icon}</span>
                  {typeInfo.label}
                </CardTitle>
                <CardDescription>Credential #{credential.credentialId}</CardDescription>
              </div>
            </div>
            <Badge variant={style.variant}>{style.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">Commitment Hash</dt>
              <dd className="mt-1 flex items-center gap-2 font-mono text-xs">
                {shortenAddress(credential.commitmentHex)}
                <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => copyToClipboard(credential.commitmentHex, "Commitment")}>
                  <CopyIcon className="size-3" />
                </Button>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Issuer</dt>
              <dd className="mt-1 flex items-center gap-2 font-mono text-xs">
                {shortenDid(credential.issuerDid)}
                <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => copyToClipboard(credential.issuerDid, "Issuer DID")}>
                  <CopyIcon className="size-3" />
                </Button>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Subject (You)</dt>
              <dd className="mt-1 font-mono text-xs">{shortenDid(credential.subjectDid)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Expiry</dt>
              <dd className="mt-1 text-xs">
                {expiry.text}
                {expiry.expired && <span className="ml-1 text-destructive">(expired)</span>}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Issued</dt>
              <dd className="mt-1 text-xs">
                {new Date(credential.issuedAtUnix * 1000).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Contract</dt>
              <dd className="mt-1 font-mono text-xs">{shortenAddress(credential.contractAddress)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Share Options ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShareIcon className="size-5" />
            Share Credential
          </CardTitle>
          <CardDescription>
            Share this credential with a verifier. The VC contains only the commitment hash &mdash;
            no medical data is exposed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowQR(!showQR)}>
              <QrCodeIcon className="size-4" />
              {showQR ? "Hide QR" : "Show QR Code"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => copyToClipboard(vcJson, "VC JSON")}>
              <CopyIcon className="size-4" />
              Copy VC JSON
            </Button>
            <Button variant="outline" className="gap-2" onClick={downloadVC}>
              <DownloadIcon className="size-4" />
              Download .json
            </Button>
          </div>

          {showQR && (
            <div className="flex justify-center rounded-lg border bg-white p-6">
              <QRCodeSVG
                value={vcJson}
                size={256}
                level="M"
                includeMargin
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Raw VC ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>W3C Verifiable Credential</CardTitle>
          <CardDescription>Raw credential artifact in W3C VC 2.0 format</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-lg border bg-muted p-4 text-xs">
            {vcJson}
          </pre>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
