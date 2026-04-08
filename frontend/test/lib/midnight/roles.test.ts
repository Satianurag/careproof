import { describe, it, expect } from "vitest";
import { resolveRoles, hasRole, roleToDashboardRoute } from "@/lib/midnight/roles";

describe("resolveRoles", () => {
  it("admin-only returns admin as primary", () => {
    const r = resolveRoles(true, false, false);
    expect(r.primary).toBe("admin");
    expect(r.all).toEqual(["admin"]);
    expect(r.isAdmin).toBe(true);
    expect(r.isDoctor).toBe(false);
    expect(r.isVerifier).toBe(false);
  });

  it("doctor-only returns doctor as primary", () => {
    const r = resolveRoles(false, true, false);
    expect(r.primary).toBe("doctor");
    expect(r.all).toEqual(["doctor"]);
  });

  it("verifier-only returns verifier as primary", () => {
    const r = resolveRoles(false, false, true);
    expect(r.primary).toBe("verifier");
    expect(r.all).toEqual(["verifier"]);
  });

  it("no roles defaults to patient", () => {
    const r = resolveRoles(false, false, false);
    expect(r.primary).toBe("patient");
    expect(r.all).toEqual(["patient"]);
  });

  it("admin+doctor returns admin as primary (highest priority)", () => {
    const r = resolveRoles(true, true, false);
    expect(r.primary).toBe("admin");
    expect(r.all).toEqual(["admin", "doctor"]);
  });

  it("doctor+verifier returns doctor as primary", () => {
    const r = resolveRoles(false, true, true);
    expect(r.primary).toBe("doctor");
    expect(r.all).toEqual(["doctor", "verifier"]);
  });

  it("all roles returns admin as primary", () => {
    const r = resolveRoles(true, true, true);
    expect(r.primary).toBe("admin");
    expect(r.all).toEqual(["admin", "doctor", "verifier"]);
  });
});

describe("hasRole", () => {
  it("patient role is always true", () => {
    const r = resolveRoles(false, false, false);
    expect(hasRole(r, "patient")).toBe(true);
  });

  it("admin role true when admin", () => {
    const r = resolveRoles(true, false, false);
    expect(hasRole(r, "admin")).toBe(true);
  });

  it("doctor role false when only admin", () => {
    const r = resolveRoles(true, false, false);
    expect(hasRole(r, "doctor")).toBe(false);
  });

  it("verifier role true when verifier", () => {
    const r = resolveRoles(false, false, true);
    expect(hasRole(r, "verifier")).toBe(true);
  });
});

describe("roleToDashboardRoute", () => {
  it("admin → /admin", () => expect(roleToDashboardRoute("admin")).toBe("/admin"));
  it("doctor → /doctor", () => expect(roleToDashboardRoute("doctor")).toBe("/doctor"));
  it("verifier → /verifier", () => expect(roleToDashboardRoute("verifier")).toBe("/verifier"));
  it("patient → /patient", () => expect(roleToDashboardRoute("patient")).toBe("/patient"));
});
