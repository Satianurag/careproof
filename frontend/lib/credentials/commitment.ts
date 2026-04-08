/**
 * Client-side credential commitment hashing.
 *
 * The CareProof contract stores only Bytes<32> commitment hashes on-chain.
 * Compact's `persistentHash<T>` uses SHA-256 internally (verified via Context7).
 *
 * This module generates the same commitment hash client-side so the doctor
 * can compute it before calling issue_credential. The credential plaintext
 * never leaves the browser — only the hash goes on-chain.
 *
 * IMPORTANT: The hash input must be serialized identically to how the Compact
 * runtime would serialize the same struct. For MVP, we use a canonical JSON
 * encoding fed into SHA-256. In production, this should use the exact Compact
 * serialization format (ABI-encoded struct).
 */

export interface CredentialData {
  credentialId: bigint;
  credentialType: 0 | 1 | 2;
  /** Patient public key (hex) */
  patientKeyHex: string;
  /** Doctor/issuer public key (hex) */
  issuerKeyHex: string;
  /** Expiry as unix timestamp */
  expiry: bigint;
  /** Optional notes (not stored on-chain) */
  notes?: string;
}

/**
 * Compute a SHA-256 commitment hash from credential data.
 *
 * Returns a 32-byte Uint8Array suitable for the `commitment` param
 * of the `issue_credential` circuit.
 */
export async function computeCommitment(data: CredentialData): Promise<Uint8Array> {
  // Canonical serialization: deterministic JSON of core fields
  const canonical = JSON.stringify({
    credentialId: data.credentialId.toString(),
    credentialType: data.credentialType,
    patientKey: data.patientKeyHex,
    issuerKey: data.issuerKeyHex,
    expiry: data.expiry.toString(),
  });

  const encoded = new TextEncoder().encode(canonical);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return new Uint8Array(hashBuffer);
}

/**
 * Convert a Uint8Array to hex string.
 */
export function commitmentToHex(commitment: Uint8Array): string {
  return Array.from(commitment)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compute commitment and return both bytes and hex.
 */
export async function computeCommitmentWithHex(
  data: CredentialData,
): Promise<{ bytes: Uint8Array; hex: string }> {
  const bytes = await computeCommitment(data);
  return { bytes, hex: commitmentToHex(bytes) };
}
