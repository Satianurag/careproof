/**
 * Shared types for the Midnight integration layer.
 *
 * These types bridge the DApp Connector API (Lace wallet) with
 * the CareProof contract circuits.
 *
 * Source of truth:
 *   - DApp Connector: @midnight-ntwrk/dapp-connector-api ^4.0.1
 *   - Contract:       contracts/contracts/careproof.compact
 */

import type {
  ConnectedAPI,
  Configuration,
  ConnectionStatus,
} from "@midnight-ntwrk/dapp-connector-api";

// ─── Wallet state ───────────────────────────────────────────────

export interface WalletState {
  /** bech32m address */
  address: string;
  /** bech32m coin public key */
  coinPublicKey: string;
  /** bech32m encryption public key */
  encryptionPublicKey: string;
  /** Dust balance snapshot */
  dustBalance: bigint;
  /** Dust cap */
  dustCap: bigint;
}

export interface WalletConnection {
  api: ConnectedAPI;
  state: WalletState;
  config: Configuration;
}

// ─── Contract configuration ─────────────────────────────────────

export interface ContractConfig {
  /** Deployed contract address (hex) */
  contractAddress: string;
  /** Network ID the wallet should connect to */
  networkId: string;
}

// ─── Role types ─────────────────────────────────────────────────

export type UserRole = "admin" | "doctor" | "verifier" | "patient";

export interface ResolvedRoles {
  isAdmin: boolean;
  isDoctor: boolean;
  isVerifier: boolean;
  /** Primary role for routing — highest-privilege first */
  primary: UserRole;
  /** All roles the user holds (may be multiple) */
  all: UserRole[];
}

// ─── Transaction types ──────────────────────────────────────────

export type TxStage =
  | "idle"
  | "building"
  | "proving"
  | "balancing"
  | "submitting"
  | "confirming"
  | "done"
  | "error";

export interface TxProgress {
  stage: TxStage;
  message: string;
  error?: string;
}

// ─── Ledger types (indexer-side) ────────────────────────────────

export interface LedgerStats {
  totalCredentials: bigint;
  totalVerifications: bigint;
  activeCredentialCount: bigint;
  revokedCredentialCount: bigint;
}

export interface VerificationLogEntry {
  logKeyHex: string;
  verifier: { bytes: Uint8Array };
  commitment: Uint8Array;
  is_valid: boolean;
}

export interface FullLedgerState extends LedgerStats {
  activeCredentials: string[];
  revokedCredentials: string[];
  verificationLog: VerificationLogEntry[];
}

// ─── Re-exports for convenience ─────────────────────────────────

export type { ConnectedAPI, Configuration, ConnectionStatus };
