import { type CredentialSubject } from "./vc-types";

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  MedicalLeave: { label: "Medical Leave", icon: "🏥", color: "text-blue-600" },
  Vaccination: { label: "Vaccination", icon: "💉", color: "text-green-600" },
  Eligibility: { label: "Eligibility", icon: "✅", color: "text-purple-600" },
};

export function credentialTypeDisplay(type: CredentialSubject["credentialType"]) {
  return TYPE_LABELS[type] ?? { label: type, icon: "📄", color: "text-gray-600" };
}

export function formatCommitment(hex: string, chars = 8): string {
  if (hex.length <= chars * 2) return hex;
  return `${hex.slice(0, chars)}...${hex.slice(-chars)}`;
}

export function formatExpiry(iso: string): { text: string; expired: boolean } {
  const date = new Date(iso);
  const now = new Date();
  const expired = date < now;
  const text = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return { text, expired };
}

export function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type CredentialDisplayStatus = "active" | "revoked" | "expired";

export function resolveCredentialStatus(
  isRevoked: boolean,
  expiryUnix: bigint,
  nowUnix?: bigint,
): CredentialDisplayStatus {
  if (isRevoked) return "revoked";
  const now = nowUnix ?? BigInt(Math.floor(Date.now() / 1000));
  if (expiryUnix < now) return "expired";
  return "active";
}

export const STATUS_STYLES: Record<CredentialDisplayStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "secondary" },
  revoked: { label: "Revoked", variant: "destructive" },
  expired: { label: "Expired", variant: "default" },
};
