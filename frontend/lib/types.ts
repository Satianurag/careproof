export enum CredentialType {
  MedicalLeave = 0,
  Vaccination = 1,
  Eligibility = 2,
}

export interface VerificationRecord {
  verifier: { bytes: Uint8Array };
  commitment: Uint8Array;
  is_valid: boolean;
}

export interface ContractState {
  totalCredentials: bigint;
  totalVerifications: bigint;
  activeCredentialCount: bigint;
  revokedCredentialCount: bigint;
}

export interface IssueCredentialParams {
  credentialId: bigint;
  client: Uint8Array;
  commitment: Uint8Array;
  expiry: bigint;
}

export interface RevokeCredentialParams {
  credentialId: bigint;
  client: Uint8Array;
}

export interface VerifyCredentialParams {
  commitment: Uint8Array;
}

export interface ConsentParams {
  doctor: Uint8Array;
  credentialId: bigint;
}

export type UserRole = "admin" | "doctor" | "patient" | "verifier";

export const credentialTypeToString = (type: CredentialType): string => {
  switch (type) {
    case CredentialType.MedicalLeave:
      return "Medical Leave";
    case CredentialType.Vaccination:
      return "Vaccination";
    case CredentialType.Eligibility:
      return "Eligibility";
    default:
      return `Unknown(${type})`;
  }
};

export const validateCredentialType = (type: number): boolean => {
  return type >= 0 && type <= 2;
};

export const isExpired = (expiry: bigint, now?: bigint): boolean => {
  const currentTime = now ?? BigInt(Math.floor(Date.now() / 1000));
  return expiry < currentTime;
};

export const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const shortenAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};
