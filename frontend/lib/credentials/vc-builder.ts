import type { CareProofVC, CareProofVP } from "./vc-types";

const CREDENTIAL_TYPE_LABELS = {
  0: "MedicalLeave",
  1: "Vaccination",
  2: "Eligibility",
} as const;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const unixToISO = (ts: bigint): string => new Date(Number(ts) * 1000).toISOString();

export interface BuildVCParams {
  credentialId: bigint;
  commitmentHash: Uint8Array;
  credentialType: 0 | 1 | 2;
  issuerDid: string;
  subjectDid: string;
  issuedAt: bigint;
  expiry: bigint;
  contractAddress: string;
}

export function buildVC(params: BuildVCParams): CareProofVC {
  const commitHex = toHex(params.commitmentHash);
  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://careproof.midnight.network/ns/v1",
    ],
    id: `urn:careproof:${params.contractAddress}:cred:${params.credentialId}`,
    type: ["VerifiableCredential", "CareProofHealthCredential"],
    issuer: params.issuerDid,
    issuanceDate: unixToISO(params.issuedAt),
    expirationDate: unixToISO(params.expiry),
    credentialSubject: {
      id: params.subjectDid,
      commitmentHash: commitHex,
      credentialType: CREDENTIAL_TYPE_LABELS[params.credentialType],
      expirationDate: unixToISO(params.expiry),
    },
    credentialStatus: {
      id: `urn:careproof:${params.contractAddress}:revocation:${params.credentialId}`,
      type: "MidnightRevocationRegistry2024",
      revocationListCredential: commitHex,
    },
  };
}

export function buildVP(holderDid: string, credentials: CareProofVC[]): CareProofVP {
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    type: ["VerifiablePresentation"],
    holder: holderDid,
    verifiableCredential: credentials,
  };
}
