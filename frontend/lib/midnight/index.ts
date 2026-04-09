/**
 * Midnight integration layer for CareProof.
 *
 * This module provides a clean, typed boundary between the
 * Next.js frontend and the Midnight Network:
 *
 *   - wallet.ts    → Lace wallet connection via DApp Connector
 *   - client.ts    → Typed CareProof contract client
 *   - tx-pipeline  → Transaction lifecycle (balance → submit)
 *   - indexer.ts   → GraphQL queries for on-chain state
 *   - roles.ts     → On-chain role resolution
 *   - errors.ts    → Typed error hierarchy
 *   - types.ts     → Shared TypeScript types
 */

// Types
export type {
  WalletState,
  WalletConnection,
  ContractConfig,
  UserRole,
  ResolvedRoles,
  TxStage,
  TxProgress,
  LedgerStats,
  VerificationLogEntry,
  FullLedgerState,
  ConnectedAPI,
  Configuration,
  ConnectionStatus,
} from "./types";

// Wallet
export {
  findLaceEntry,
  isLaceInstalled,
  isWalletAvailable,
  getWalletInfo,
  connectWallet,
  fetchWalletState,
  ensureConnected,
} from "./wallet";

// Client
export { CareProofClient } from "./client";
export type {
  IssueCredentialParams,
  RevokeCredentialParams,
  VerifyCredentialParams,
  ConsentParams,
  RoleParams,
  TransferAdminParams,
} from "./client";

// Transaction pipeline
export { executeTx, balanceTx } from "./tx-pipeline";
export type { TxProgressCallback } from "./tx-pipeline";

// Indexer
export { queryLedgerStats, queryFullLedgerState } from "./indexer";

// Roles
export { resolveRoles, hasRole, roleToDashboardRoute } from "./roles";

// Errors
export {
  MidnightError,
  WalletNotFoundError,
  WalletMidnightNotEnabledError,
  WalletConnectionRejectedError,
  WalletDisconnectedError,
  TxRejectedError,
  TxBalancingError,
  TxSubmissionError,
  ContractAssertionError,
  IndexerError,
  InsufficientRoleError,
  classifyError,
} from "./errors";
