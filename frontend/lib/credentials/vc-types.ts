/**
 * W3C Verifiable Credentials envelope types for CareProof.
 *
 * Wraps on-chain commitment hashes in a W3C VC-compatible structure
 * so downstream systems can consume CareProof credentials without
 * understanding Midnight internals.
 *
 * Reference: https://www.w3.org/TR/vc-data-model-2.0/
 */

export interface W3CProof {
  type: string;
  verificationMethod: string;
  created: string;
  proofPurpose: "assertionMethod" | "authentication";
  proofValue: string;
}

export interface CredentialStatus {
  id: string;
  type: "MidnightRevocationRegistry2024";
  revocationListCredential: string;
}

export interface CredentialSubject {
  id: string;
  commitmentHash: string;
  credentialType: "MedicalLeave" | "Vaccination" | "Eligibility";
  expirationDate: string;
}

export interface CareProofVC {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://careproof.midnight.network/ns/v1",
  ];
  id: string;
  type: ["VerifiableCredential", "CareProofHealthCredential"];
  issuer: string;
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: CredentialSubject;
  credentialStatus?: CredentialStatus;
  proof?: W3CProof;
}

export interface CareProofVP {
  "@context": ["https://www.w3.org/ns/credentials/v2"];
  type: ["VerifiablePresentation"];
  holder: string;
  verifiableCredential: CareProofVC[];
  proof?: W3CProof;
}
