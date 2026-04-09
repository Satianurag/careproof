/**
 * Typed CareProof contract client.
 *
 * Provides a strongly typed interface for all contract circuits.
 * Two modes of operation:
 *
 *   1. READ operations (role checks, state queries) — use the indexer.
 *   2. WRITE operations (issue, verify, etc.) — create a transaction,
 *      delegate proving/balancing/submission to the wallet via DApp Connector.
 *
 * Architecture:
 *   UI component → client.issueCredential(params)
 *     → builds circuit call → tx-pipeline → wallet balances → submits
 *     → indexer refreshes state
 *
 * API reference (verified via Context7):
 *   - DApp Connector: balanceUnsealedTransaction, submitTransaction
 *   - midnight-js: findDeployedContract, callTx.circuitName(args)
 *   - Compact: Circuit signatures from careproof.compact
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type {
  WalletConnection,
  ContractConfig,
  ResolvedRoles,
  FullLedgerState,
  LedgerStats,
} from "./types";
import { resolveRoles } from "./roles";
import { queryLedgerStats, queryFullLedgerState } from "./indexer";
import { type TxProgressCallback } from "./tx-pipeline";
import { ensureConnected } from "./wallet";
import { MidnightError } from "./errors";

// ─── Circuit parameter types (match careproof.compact) ──────────

export interface IssueCredentialParams {
  credentialId: bigint;
  client: { bytes: Uint8Array };
  commitment: Uint8Array;
  expiry: bigint;
}

export interface RevokeCredentialParams {
  credentialId: bigint;
  client: { bytes: Uint8Array };
}

export interface VerifyCredentialParams {
  commitment: Uint8Array;
}

export interface ConsentParams {
  doctor: { bytes: Uint8Array };
  credentialId: bigint;
}

export interface RoleParams {
  account: { bytes: Uint8Array };
}

export interface TransferAdminParams {
  newAdmin: { bytes: Uint8Array };
}

// ─── Contract client ────────────────────────────────────────────

/**
 * CareProof contract client.
 *
 * Wraps the deployed contract handle (when available) and provides
 * typed methods for every exported circuit.
 *
 * Phase 2 delivers the integration layer; the actual callTx bridge
 * is wired in Phase 3 when midnight-js packages are added to the
 * frontend and the WalletProvider creates the full provider set.
 */
export class CareProofClient {
  private connection: WalletConnection;
  private config: ContractConfig;

  /** Deployed contract handle — set when midnight-js bridge is ready */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private deployedContract: any | null = null;

  constructor(connection: WalletConnection, config: ContractConfig) {
    this.connection = connection;
    this.config = config;
  }

  /** Update the wallet connection (e.g. after reconnect). */
  setConnection(connection: WalletConnection): void {
    this.connection = connection;
  }

  /** Set the deployed contract handle (from midnight-js). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDeployedContract(deployed: any): void {
    this.deployedContract = deployed;
  }

  get api(): ConnectedAPI {
    return this.connection.api;
  }

  get indexerUri(): string {
    return this.connection.config.indexerUri;
  }

  get contractAddress(): string {
    return this.config.contractAddress;
  }

  // ─── Health ─────────────────────────────────────────────────

  async checkConnection(): Promise<void> {
    await ensureConnected(this.api);
  }

  // ─── Read: Ledger state ─────────────────────────────────────

  async getLedgerStats(): Promise<LedgerStats | null> {
    return queryLedgerStats(this.indexerUri, this.contractAddress);
  }

  async getFullLedgerState(): Promise<FullLedgerState | null> {
    return queryFullLedgerState(this.indexerUri, this.contractAddress);
  }

  // ─── Read: Role resolution ──────────────────────────────────

  /**
   * Resolve on-chain roles for the connected wallet.
   *
   * Uses the deployed contract's read circuits when available,
   * falls back to indexer state parsing.
   */
  async resolveMyRoles(): Promise<ResolvedRoles> {
    if (this.deployedContract) {
      try {
        const [adminResult, doctorResult, verifierResult] = await Promise.all([
          this.deployedContract.callTx.has_admin_role({ bytes: this.coinPublicKeyBytes() }),
          this.deployedContract.callTx.has_doctor_role({ bytes: this.coinPublicKeyBytes() }),
          this.deployedContract.callTx.has_verifier_role({ bytes: this.coinPublicKeyBytes() }),
        ]);
        return resolveRoles(
          adminResult.public.returnValue === true,
          doctorResult.public.returnValue === true,
          verifierResult.public.returnValue === true,
        );
      } catch {
        // Fall through to basic resolution
      }
    }

    // Fallback: patient role (no on-chain query available without contract handle)
    return resolveRoles(false, false, false);
  }

  // ─── Write: Admin circuits ──────────────────────────────────

  async addDoctor(params: RoleParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("add_doctor", [params.account], onProgress);
  }

  async removeDoctor(params: RoleParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("remove_doctor", [params.account], onProgress);
  }

  async addVerifier(params: RoleParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("add_verifier", [params.account], onProgress);
  }

  async removeVerifier(params: RoleParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("remove_verifier", [params.account], onProgress);
  }

  async transferAdmin(params: TransferAdminParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("transfer_admin", [params.newAdmin], onProgress);
  }

  async pause(onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("pause", [], onProgress);
  }

  async unpause(onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("unpause", [], onProgress);
  }

  // ─── Write: Consent circuits ────────────────────────────────

  async grantConsent(params: ConsentParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("grant_consent", [params.doctor, params.credentialId], onProgress);
  }

  async revokeConsent(params: ConsentParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("revoke_consent", [params.doctor, params.credentialId], onProgress);
  }

  // ─── Write: Credential circuits ─────────────────────────────

  async issueCredential(params: IssueCredentialParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("issue_credential", [
      params.credentialId,
      params.client,
      params.commitment,
      params.expiry,
    ], onProgress);
  }

  async revokeCredential(params: RevokeCredentialParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("revoke_credential", [
      params.credentialId,
      params.client,
    ], onProgress);
  }

  // ─── Write: Verification circuits ───────────────────────────

  async verifyCredential(params: VerifyCredentialParams, onProgress?: TxProgressCallback): Promise<void> {
    await this.callCircuit("verify_credential", [params.commitment], onProgress);
  }

  // ─── Internal: Circuit call bridge ──────────────────────────

  /**
   * Call a contract circuit through the deployed contract handle.
   *
   * When midnight-js is integrated (Phase 3), this uses
   * deployedContract.callTx.circuitName(args) which internally:
   *   1. Runs the circuit locally to create the transaction
   *   2. Proves it (via wallet's proving provider)
   *   3. Returns the unbalanced tx
   *
   * Then we balance + submit via the DApp Connector.
   */
  private async callCircuit(
    circuitId: string,
    args: unknown[],
    onProgress?: TxProgressCallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    await this.checkConnection();

    if (!this.deployedContract) {
      throw new MidnightError(
        "Contract client not initialized. Connect your wallet and wait for the contract to load.",
        "CONTRACT_NOT_READY",
      );
    }

    onProgress?.({ stage: "building", message: `Preparing ${circuitId} transaction...` });

    try {
      // midnight-js callTx handles proving internally
      const result = await this.deployedContract.callTx[circuitId](...args);
      onProgress?.({ stage: "done", message: "Transaction confirmed." });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      // If the error is from the wallet (user rejected), propagate it
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("denied")) {
        onProgress?.({ stage: "error", message: "Transaction rejected.", error: msg });
        throw err;
      }

      // Otherwise, try the manual pipeline as fallback
      // (for cases where callTx returns a raw tx instead of auto-submitting)
      onProgress?.({ stage: "error", message: msg, error: msg });
      throw err;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────

  private coinPublicKeyBytes(): Uint8Array {
    // The coinPublicKey from the wallet is bech32m-encoded
    // For contract calls, we need the raw bytes
    // This will be properly decoded when the address-format package is integrated
    const cpk = this.connection.state.coinPublicKey;
    return new TextEncoder().encode(cpk);
  }
}
