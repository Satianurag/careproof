import { describe, it, expect } from "vitest";
import {
  credentialTypeDisplay,
  formatCommitment,
  formatExpiry,
  resolveCredentialStatus,
  STATUS_STYLES,
} from "@/lib/credentials/display";

describe("credentialTypeDisplay", () => {
  it("maps known types", () => {
    expect(credentialTypeDisplay("MedicalLeave").label).toBe("Medical Leave");
    expect(credentialTypeDisplay("Vaccination").label).toBe("Vaccination");
    expect(credentialTypeDisplay("Eligibility").label).toBe("Eligibility");
  });

  it("returns fallback for unknown types", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = credentialTypeDisplay("SomeNewType" as any);
    expect(result.label).toBe("SomeNewType");
  });
});

describe("formatCommitment", () => {
  it("shortens long hex strings", () => {
    const hex = "a".repeat(64);
    const short = formatCommitment(hex);
    expect(short.length).toBeLessThan(64);
    expect(short).toContain("...");
  });

  it("returns short strings as-is", () => {
    expect(formatCommitment("abc")).toBe("abc");
  });
});

describe("formatExpiry", () => {
  it("marks future dates as not expired", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const result = formatExpiry(future);
    expect(result.expired).toBe(false);
  });

  it("marks past dates as expired", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const result = formatExpiry(past);
    expect(result.expired).toBe(true);
  });
});

describe("resolveCredentialStatus", () => {
  it("returns revoked if isRevoked", () => {
    expect(resolveCredentialStatus(true, 9999999999n)).toBe("revoked");
  });

  it("returns expired if expiry in past", () => {
    expect(resolveCredentialStatus(false, 0n)).toBe("expired");
  });

  it("returns active if not revoked and future expiry", () => {
    expect(resolveCredentialStatus(false, 9999999999n)).toBe("active");
  });
});

describe("STATUS_STYLES", () => {
  it("has entries for all statuses", () => {
    expect(STATUS_STYLES.active).toBeDefined();
    expect(STATUS_STYLES.revoked).toBeDefined();
    expect(STATUS_STYLES.expired).toBeDefined();
  });
});
