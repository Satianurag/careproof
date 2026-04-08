/**
 * Indexer queries for reading on-chain CareProof state.
 *
 * The Midnight indexer exposes a GraphQL API. The wallet provides
 * the indexer URI via api.getConfiguration().indexerUri.
 *
 * This module replaces the ad-hoc fetch calls in careproof-service.ts
 * with typed, error-handled queries.
 */

import type { LedgerStats, FullLedgerState, VerificationLogEntry } from "./types";
import { IndexerError } from "./errors";
import { bytesToHex } from "@/lib/types";

// ─── GraphQL helper ─────────────────────────────────────────────

async function gql<T>(
  indexerUri: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(indexerUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
  } catch (err) {
    throw new IndexerError(
      `Cannot reach indexer at ${indexerUri}`,
      err,
    );
  }

  if (!response.ok) {
    throw new IndexerError(
      `Indexer returned ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new IndexerError(
      `GraphQL error: ${result.errors[0].message}`,
      result.errors,
    );
  }

  return result.data as T;
}

// ─── Queries ────────────────────────────────────────────────────

const CONTRACT_STATE_QUERY = `
  query GetContractState($address: String!) {
    contractState(address: $address) {
      state
    }
  }
`;

/**
 * Fetch aggregate statistics from the contract ledger.
 */
export async function queryLedgerStats(
  indexerUri: string,
  contractAddress: string,
): Promise<LedgerStats | null> {
  const data = await gql<{
    contractState: { state: Record<string, unknown> } | null;
  }>(indexerUri, CONTRACT_STATE_QUERY, { address: contractAddress });

  const state = data.contractState?.state;
  if (!state) return null;

  return {
    totalCredentials: BigInt((state.total_credentials as string | number) ?? 0),
    totalVerifications: BigInt((state.total_verifications as string | number) ?? 0),
    activeCredentialCount: BigInt((state.active_credentials_size as string | number) ?? 0),
    revokedCredentialCount: BigInt((state.revoked_credentials_size as string | number) ?? 0),
  };
}

/**
 * Fetch full ledger state including credential sets and verification log.
 */
export async function queryFullLedgerState(
  indexerUri: string,
  contractAddress: string,
): Promise<FullLedgerState | null> {
  const data = await gql<{
    contractState: { state: Record<string, unknown> } | null;
  }>(indexerUri, CONTRACT_STATE_QUERY, { address: contractAddress });

  const state = data.contractState?.state;
  if (!state) return null;

  // Parse active credentials set
  const activeCredentials: string[] = [];
  if (state.active_credentials) {
    for (const elem of Object.values(state.active_credentials as Record<string, unknown>)) {
      activeCredentials.push(
        elem instanceof Uint8Array ? bytesToHex(elem) : String(elem),
      );
    }
  }

  // Parse revoked credentials set
  const revokedCredentials: string[] = [];
  if (state.revoked_credentials) {
    for (const elem of Object.values(state.revoked_credentials as Record<string, unknown>)) {
      revokedCredentials.push(
        elem instanceof Uint8Array ? bytesToHex(elem) : String(elem),
      );
    }
  }

  // Parse verification log entries
  const verificationLog: VerificationLogEntry[] = [];
  if (state.verification_log) {
    for (const [logKey, rec] of Object.entries(state.verification_log as Record<string, unknown>)) {
      const r = rec as Record<string, unknown>;
      verificationLog.push({
        logKeyHex: logKey,
        verifier: (r.verifier as { bytes: Uint8Array }) ?? { bytes: new Uint8Array(32) },
        commitment: r.commitment instanceof Uint8Array ? r.commitment : new Uint8Array(32),
        is_valid: Boolean(r.is_valid),
      });
    }
  }

  return {
    totalCredentials: BigInt((state.total_credentials as string | number) ?? 0),
    totalVerifications: BigInt((state.total_verifications as string | number) ?? 0),
    activeCredentialCount: BigInt((state.active_credentials_size as string | number) ?? 0),
    revokedCredentialCount: BigInt((state.revoked_credentials_size as string | number) ?? 0),
    activeCredentials,
    revokedCredentials,
    verificationLog,
  };
}
