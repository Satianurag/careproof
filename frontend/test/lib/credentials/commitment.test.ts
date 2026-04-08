import { describe, it, expect } from "vitest";
import {
  computeCommitment,
  commitmentToHex,
  computeCommitmentWithHex,
  type CredentialData,
} from "@/lib/credentials/commitment";

describe("computeCommitment", () => {
  const testData: CredentialData = {
    credentialId: 123n,
    credentialType: 0,
    patientKeyHex: "aabbccdd",
    issuerKeyHex: "11223344",
    expiry: 1700000000n,
  };

  it("returns a 32-byte Uint8Array (SHA-256)", async () => {
    const hash = await computeCommitment(testData);
    expect(hash).toBeInstanceOf(Uint8Array);
    expect(hash.length).toBe(32);
  });

  it("is deterministic — same input gives same hash", async () => {
    const hash1 = await computeCommitment(testData);
    const hash2 = await computeCommitment(testData);
    expect(hash1).toEqual(hash2);
  });

  it("different input gives different hash", async () => {
    const hash1 = await computeCommitment(testData);
    const hash2 = await computeCommitment({ ...testData, credentialId: 456n });
    expect(hash1).not.toEqual(hash2);
  });
});

describe("commitmentToHex", () => {
  it("converts bytes to 64-char hex string", () => {
    const bytes = new Uint8Array(32).fill(0xab);
    const hex = commitmentToHex(bytes);
    expect(hex).toHaveLength(64);
    expect(hex).toBe("ab".repeat(32));
  });

  it("handles zero bytes", () => {
    const bytes = new Uint8Array(32).fill(0);
    expect(commitmentToHex(bytes)).toBe("00".repeat(32));
  });
});

describe("computeCommitmentWithHex", () => {
  it("returns both bytes and hex", async () => {
    const result = await computeCommitmentWithHex({
      credentialId: 1n,
      credentialType: 1,
      patientKeyHex: "aa",
      issuerKeyHex: "bb",
      expiry: 999n,
    });
    expect(result.bytes).toBeInstanceOf(Uint8Array);
    expect(result.bytes.length).toBe(32);
    expect(result.hex).toHaveLength(64);
    expect(result.hex).toBe(commitmentToHex(result.bytes));
  });
});
