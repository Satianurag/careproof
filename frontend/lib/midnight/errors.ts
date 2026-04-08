/**
 * Typed error classes for the Midnight integration layer.
 *
 * Every error thrown by the integration layer is an instance of
 * MidnightError or one of its subclasses, making it easy for UI
 * code to catch and display context-appropriate messages.
 */

export class MidnightError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MidnightError";
  }
}

/** Lace wallet extension is not installed or not detected. */
export class WalletNotFoundError extends MidnightError {
  constructor() {
    super(
      "Midnight wallet not detected. Please install the Lace Midnight Preview extension from the Chrome Web Store.",
      "WALLET_NOT_FOUND",
    );
    this.name = "WalletNotFoundError";
  }
}

/** Lace wallet is installed but Midnight Beta features are not enabled. */
export class WalletMidnightNotEnabledError extends MidnightError {
  constructor() {
    super(
      "Lace (Cardano) wallet detected, but the Midnight Preview extension is not installed. The Lace Midnight Preview is a separate Chrome extension required for Midnight DApps.",
      "WALLET_MIDNIGHT_NOT_ENABLED",
    );
    this.name = "WalletMidnightNotEnabledError";
  }
}

/** User rejected the connection request in the wallet popup. */
export class WalletConnectionRejectedError extends MidnightError {
  constructor(cause?: unknown) {
    super(
      "Wallet connection was rejected. Please approve the connection in your Lace wallet.",
      "WALLET_CONNECTION_REJECTED",
      cause,
    );
    this.name = "WalletConnectionRejectedError";
  }
}

/** Wallet is connected but the connection was lost (e.g. user locked wallet). */
export class WalletDisconnectedError extends MidnightError {
  constructor() {
    super(
      "Wallet connection lost. Please reconnect.",
      "WALLET_DISCONNECTED",
    );
    this.name = "WalletDisconnectedError";
  }
}

/** Transaction was rejected by the user in the wallet popup. */
export class TxRejectedError extends MidnightError {
  constructor(cause?: unknown) {
    super(
      "Transaction was rejected in the wallet.",
      "TX_REJECTED",
      cause,
    );
    this.name = "TxRejectedError";
  }
}

/** Transaction failed during balancing (insufficient funds, etc). */
export class TxBalancingError extends MidnightError {
  constructor(message: string, cause?: unknown) {
    super(message, "TX_BALANCING_FAILED", cause);
    this.name = "TxBalancingError";
  }
}

/** Transaction failed during submission or on-chain execution. */
export class TxSubmissionError extends MidnightError {
  constructor(message: string, cause?: unknown) {
    super(message, "TX_SUBMISSION_FAILED", cause);
    this.name = "TxSubmissionError";
  }
}

/** Contract assertion failed (e.g. "Patient consent required"). */
export class ContractAssertionError extends MidnightError {
  constructor(assertion: string, cause?: unknown) {
    super(
      `Contract assertion failed: ${assertion}`,
      "CONTRACT_ASSERTION",
      cause,
    );
    this.name = "ContractAssertionError";
  }
}

/** Indexer query failed or returned unexpected data. */
export class IndexerError extends MidnightError {
  constructor(message: string, cause?: unknown) {
    super(message, "INDEXER_ERROR", cause);
    this.name = "IndexerError";
  }
}

/** Role check failed — user does not have the required role. */
export class InsufficientRoleError extends MidnightError {
  constructor(required: string, actual: string[]) {
    super(
      `Requires ${required} role. Your roles: ${actual.length > 0 ? actual.join(", ") : "patient (no on-chain role)"}`,
      "INSUFFICIENT_ROLE",
    );
    this.name = "InsufficientRoleError";
  }
}

/**
 * Classify an unknown error into a typed MidnightError.
 * Useful in catch blocks to normalize wallet/tx errors.
 */
export function classifyError(err: unknown): MidnightError {
  if (err instanceof MidnightError) return err;

  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("user denied") || lower.includes("rejected by user")) {
    return new TxRejectedError(err);
  }
  if (lower.includes("insufficient") || lower.includes("not enough")) {
    return new TxBalancingError(msg, err);
  }
  if (lower.includes("assertion") || lower.includes("assert")) {
    return new ContractAssertionError(msg, err);
  }
  if (lower.includes("not found") || lower.includes("not detected")) {
    return new WalletNotFoundError();
  }
  if (lower.includes("disconnected") || lower.includes("connection lost")) {
    return new WalletDisconnectedError();
  }

  return new MidnightError(msg, "UNKNOWN", err);
}
