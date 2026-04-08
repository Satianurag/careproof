/**
 * DID helpers for did:midnight: method.
 *
 * Format: did:midnight:<network>:<hex-public-key>
 * Example: did:midnight:preview:a1b2c3...
 */

export type MidnightNetwork = "undeployed" | "preview" | "preprod" | "mainnet";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export function buildDid(network: MidnightNetwork, publicKey: Uint8Array | string): string {
  const hex = typeof publicKey === "string" ? publicKey : toHex(publicKey);
  return `did:midnight:${network}:${hex}`;
}

export function parseDid(did: string): { network: MidnightNetwork; publicKey: string } | null {
  const parts = did.split(":");
  if (parts.length !== 4 || parts[0] !== "did" || parts[1] !== "midnight") return null;
  const network = parts[2] as MidnightNetwork;
  if (!["undeployed", "preview", "preprod", "mainnet"].includes(network)) return null;
  return { network, publicKey: parts[3] };
}

export function shortenDid(did: string): string {
  const parsed = parseDid(did);
  if (!parsed) return did.length > 24 ? `${did.slice(0, 12)}...${did.slice(-8)}` : did;
  const pk = parsed.publicKey;
  return `did:midnight:${parsed.network}:${pk.slice(0, 6)}...${pk.slice(-6)}`;
}

export function buildContractDid(network: MidnightNetwork, contractAddress: string): string {
  return `did:midnight:${network}:contract:${contractAddress}`;
}
