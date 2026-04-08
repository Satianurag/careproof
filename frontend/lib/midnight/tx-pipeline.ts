/**
 * Transaction pipeline for the Midnight DApp Connector.
 *
 * Handles the full lifecycle of a contract transaction:
 *   1. Build (create the transaction from a circuit call)
 *   2. Balance (wallet adds inputs/outputs to pay fees)
 *   3. Submit (wallet relays to network)
 *   4. Confirm (optional: poll for finalization)
 *
 * API reference (verified via Context7):
 *   - api.balanceUnsealedTransaction(tx) → { tx: string }
 *   - api.submitTransaction(tx) → void
 *
 * Note: balanceUnsealedTransaction is used for contract-generated
 * transactions (unsealed, with proofs but pre-binding). This is the
 * correct method per the DApp Connector API docs.
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { TxProgress, TxStage } from "./types";
import {
  TxBalancingError,
  TxSubmissionError,
  TxRejectedError,
  classifyError,
} from "./errors";

export type TxProgressCallback = (progress: TxProgress) => void;

function progress(stage: TxStage, message: string, error?: string): TxProgress {
  return { stage, message, error };
}

/**
 * Execute the full transaction pipeline:
 *   balance → submit
 *
 * @param api       Connected wallet API
 * @param unsealedTx  Serialized unsealed transaction (from circuit call)
 * @param onProgress  Optional callback for UI progress updates
 */
export async function executeTx(
  api: ConnectedAPI,
  unsealedTx: string,
  onProgress?: TxProgressCallback,
): Promise<void> {
  try {
    // ── Balance ───────────────────────────────────────────────
    onProgress?.(progress("balancing", "Balancing transaction in wallet..."));

    let balancedTx: string;
    try {
      const result = await api.balanceUnsealedTransaction(unsealedTx);
      balancedTx = result.tx;
    } catch (err) {
      const classified = classifyError(err);
      if (classified instanceof TxRejectedError) throw classified;
      throw new TxBalancingError(
        "Failed to balance transaction. You may not have enough DUST.",
        err,
      );
    }

    // ── Submit ────────────────────────────────────────────────
    onProgress?.(progress("submitting", "Submitting transaction to network..."));

    try {
      await api.submitTransaction(balancedTx);
    } catch (err) {
      const classified = classifyError(err);
      if (classified instanceof TxRejectedError) throw classified;
      throw new TxSubmissionError(
        "Transaction submission failed.",
        err,
      );
    }

    onProgress?.(progress("done", "Transaction confirmed."));
  } catch (err) {
    const classified = err instanceof TxBalancingError || err instanceof TxSubmissionError || err instanceof TxRejectedError
      ? err
      : classifyError(err);
    onProgress?.(progress("error", classified.message, classified.message));
    throw classified;
  }
}

/**
 * Balance-only helper (for cases where submission is handled separately).
 */
export async function balanceTx(
  api: ConnectedAPI,
  unsealedTx: string,
): Promise<string> {
  try {
    const result = await api.balanceUnsealedTransaction(unsealedTx);
    return result.tx;
  } catch (err) {
    throw new TxBalancingError("Failed to balance transaction.", err);
  }
}
