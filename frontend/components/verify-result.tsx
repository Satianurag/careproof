"use client"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  ShieldCheckIcon,
} from "lucide-react"

export type VerifyResultStatus = "valid" | "revoked" | "expired" | "unknown" | "not_found"

interface VerifyResultProps {
  status: VerifyResultStatus
  commitmentHex?: string
  details?: string
}

const STATUS_CONFIG: Record<VerifyResultStatus, {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  badgeVariant: "default" | "secondary" | "destructive"
}> = {
  valid: {
    icon: <CheckCircle2Icon className="size-16 text-green-500" />,
    title: "Credential Valid",
    description: "This credential exists on-chain, is not revoked, and has not expired.",
    color: "border-green-500/30 bg-green-500/5",
    badgeVariant: "secondary",
  },
  revoked: {
    icon: <XCircleIcon className="size-16 text-destructive" />,
    title: "Credential Revoked",
    description: "This credential has been revoked by its issuer and is no longer valid.",
    color: "border-destructive/30 bg-destructive/5",
    badgeVariant: "destructive",
  },
  expired: {
    icon: <ClockIcon className="size-16 text-amber-500" />,
    title: "Credential Expired",
    description: "This credential has passed its expiration date.",
    color: "border-amber-500/30 bg-amber-500/5",
    badgeVariant: "default",
  },
  unknown: {
    icon: <HelpCircleIcon className="size-16 text-muted-foreground" />,
    title: "Unknown Status",
    description: "Could not determine the status of this credential. It may not exist on-chain.",
    color: "border-muted-foreground/30 bg-muted/50",
    badgeVariant: "default",
  },
  not_found: {
    icon: <HelpCircleIcon className="size-16 text-muted-foreground" />,
    title: "Credential Not Found",
    description: "No credential with this commitment hash was found on the ledger.",
    color: "border-muted-foreground/30 bg-muted/50",
    badgeVariant: "default",
  },
}

export function VerifyResult({ status, commitmentHex, details }: VerifyResultProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Card className={`${config.color} transition-all`}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {config.icon}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{config.title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{config.description}</p>
          </div>
          <Badge variant={config.badgeVariant} className="text-sm">
            <ShieldCheckIcon className="mr-1.5 size-3.5" />
            {status.replace("_", " ").toUpperCase()}
          </Badge>
          {commitmentHex && (
            <p className="font-mono text-xs text-muted-foreground break-all max-w-sm">
              {commitmentHex}
            </p>
          )}
          {details && (
            <p className="text-xs text-muted-foreground">{details}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
