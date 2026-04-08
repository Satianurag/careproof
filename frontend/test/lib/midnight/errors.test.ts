import { describe, it, expect } from "vitest";
import {
  MidnightError,
  WalletNotFoundError,
  WalletConnectionRejectedError,
  WalletDisconnectedError,
  TxRejectedError,
  TxBalancingError,
  TxSubmissionError,
  ContractAssertionError,
  IndexerError,
  InsufficientRoleError,
  classifyError,
} from "@/lib/midnight/errors";

describe("MidnightError hierarchy", () => {
  it("MidnightError has correct code and message", () => {
    const err = new MidnightError("test", "TEST_CODE");
    expect(err.message).toBe("test");
    expect(err.code).toBe("TEST_CODE");
    expect(err.name).toBe("MidnightError");
    expect(err).toBeInstanceOf(Error);
  });

  it("WalletNotFoundError has correct defaults", () => {
    const err = new WalletNotFoundError();
    expect(err.code).toBe("WALLET_NOT_FOUND");
    expect(err.name).toBe("WalletNotFoundError");
    expect(err).toBeInstanceOf(MidnightError);
  });

  it("WalletConnectionRejectedError preserves cause", () => {
    const cause = new Error("original");
    const err = new WalletConnectionRejectedError(cause);
    expect(err.code).toBe("WALLET_CONNECTION_REJECTED");
    expect(err.cause).toBe(cause);
  });

  it("WalletDisconnectedError", () => {
    const err = new WalletDisconnectedError();
    expect(err.code).toBe("WALLET_DISCONNECTED");
  });

  it("TxRejectedError", () => {
    const err = new TxRejectedError();
    expect(err.code).toBe("TX_REJECTED");
  });

  it("TxBalancingError", () => {
    const err = new TxBalancingError("no funds");
    expect(err.code).toBe("TX_BALANCING_FAILED");
    expect(err.message).toBe("no funds");
  });

  it("TxSubmissionError", () => {
    const err = new TxSubmissionError("network error");
    expect(err.code).toBe("TX_SUBMISSION_FAILED");
  });

  it("ContractAssertionError includes assertion text", () => {
    const err = new ContractAssertionError("Patient consent required");
    expect(err.message).toContain("Patient consent required");
    expect(err.code).toBe("CONTRACT_ASSERTION");
  });

  it("IndexerError", () => {
    const err = new IndexerError("timeout");
    expect(err.code).toBe("INDEXER_ERROR");
  });

  it("InsufficientRoleError formats roles", () => {
    const err = new InsufficientRoleError("admin", ["doctor", "verifier"]);
    expect(err.message).toContain("admin");
    expect(err.message).toContain("doctor, verifier");
  });

  it("InsufficientRoleError with empty roles shows patient", () => {
    const err = new InsufficientRoleError("doctor", []);
    expect(err.message).toContain("patient (no on-chain role)");
  });
});

describe("classifyError", () => {
  it("returns existing MidnightError as-is", () => {
    const original = new TxRejectedError();
    expect(classifyError(original)).toBe(original);
  });

  it("classifies 'user rejected' as TxRejectedError", () => {
    const err = classifyError(new Error("User rejected the transaction"));
    expect(err).toBeInstanceOf(TxRejectedError);
  });

  it("classifies 'user denied' as TxRejectedError", () => {
    const err = classifyError(new Error("User denied request"));
    expect(err).toBeInstanceOf(TxRejectedError);
  });

  it("classifies 'insufficient' as TxBalancingError", () => {
    const err = classifyError(new Error("Insufficient balance"));
    expect(err).toBeInstanceOf(TxBalancingError);
  });

  it("classifies 'not enough' as TxBalancingError", () => {
    const err = classifyError(new Error("Not enough funds"));
    expect(err).toBeInstanceOf(TxBalancingError);
  });

  it("classifies 'assertion' as ContractAssertionError", () => {
    const err = classifyError(new Error("assertion failed: Patient consent required"));
    expect(err).toBeInstanceOf(ContractAssertionError);
  });

  it("classifies 'not found' as WalletNotFoundError", () => {
    const err = classifyError(new Error("Wallet not found"));
    expect(err).toBeInstanceOf(WalletNotFoundError);
  });

  it("classifies 'disconnected' as WalletDisconnectedError", () => {
    const err = classifyError(new Error("Wallet disconnected"));
    expect(err).toBeInstanceOf(WalletDisconnectedError);
  });

  it("classifies unknown errors as generic MidnightError", () => {
    const err = classifyError(new Error("something random"));
    expect(err).toBeInstanceOf(MidnightError);
    expect(err.code).toBe("UNKNOWN");
  });

  it("handles non-Error values (strings)", () => {
    const err = classifyError("user rejected something");
    expect(err).toBeInstanceOf(TxRejectedError);
  });
});
