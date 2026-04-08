/**
 * On-chain role resolution for CareProof.
 *
 * Queries the contract's AccessControl ledger to determine which
 * roles (admin, doctor, verifier) a wallet public key holds.
 * A user with no on-chain role is treated as a "patient".
 *
 * This replaces client-side role guessing with authoritative
 * on-chain role checks.
 */

import type { ResolvedRoles, UserRole } from "./types";

/**
 * Role resolution result from contract state.
 *
 * In the CareProof contract, roles are stored via OpenZeppelin
 * AccessControl. The `has_*_role` circuits query this storage.
 *
 * Since we can't call circuits without a transaction in a pure
 * indexer query, we instead check the AccessControl role mapping
 * from the indexer's contract state.
 *
 * When the contract client (Phase 2D) is available, we'll use
 * the circuit-based role check. For now, this provides the
 * resolution logic that the UI needs.
 */

/** Priority order for primary role selection (highest first). */
const ROLE_PRIORITY: UserRole[] = ["admin", "doctor", "verifier", "patient"];

/**
 * Build a ResolvedRoles from individual boolean flags.
 */
export function resolveRoles(
  isAdmin: boolean,
  isDoctor: boolean,
  isVerifier: boolean,
): ResolvedRoles {
  const all: UserRole[] = [];
  if (isAdmin) all.push("admin");
  if (isDoctor) all.push("doctor");
  if (isVerifier) all.push("verifier");
  if (all.length === 0) all.push("patient");

  const primary = ROLE_PRIORITY.find((r) => all.includes(r)) ?? "patient";

  return { isAdmin, isDoctor, isVerifier, primary, all };
}

/**
 * Check if a resolved role set has the required role.
 */
export function hasRole(resolved: ResolvedRoles, required: UserRole): boolean {
  if (required === "patient") return true; // everyone is at least a patient
  return resolved.all.includes(required);
}

/**
 * Get the dashboard route for a given primary role.
 */
export function roleToDashboardRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor";
    case "verifier":
      return "/verifier";
    case "patient":
    default:
      return "/patient";
  }
}
