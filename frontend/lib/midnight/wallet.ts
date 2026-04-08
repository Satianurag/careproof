/**
 * Wallet connection helpers for the Midnight DApp Connector API.
 *
 * Handles Lace wallet detection, connection, state retrieval,
 * and connection status monitoring.
 *
 * API reference (verified via Context7):
 *   - window.midnight.{walletId}.connect(networkId) → ConnectedAPI
 *   - api.getShieldedAddresses() → { shieldedAddress, shieldedCoinPublicKey, shieldedEncryptionPublicKey }
 *   - api.getDustBalance() → { balance, cap }
 *   - api.getConfiguration() → Configuration
 *   - api.getConnectionStatus() → ConnectionStatus
 */

import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { WalletState, WalletConnection } from "./types";
import {
  WalletNotFoundError,
  WalletMidnightNotEnabledError,
  WalletConnectionRejectedError,
  WalletDisconnectedError,
  classifyError,
} from "./errors";

// ─── Detection ──────────────────────────────────────────────────

/**
 * Dynamically find the Lace wallet entry inside window.midnight.
 * The Lace Midnight Preview extension registers under a random UUID key,
 * not the static "mnLace" shown in some docs. We match by name or rdns.
 */
export function findLaceEntry(): InitialAPI | null {
  if (typeof window === "undefined" || !window.midnight) return null;
  for (const entry of Object.values(window.midnight)) {
    if (
      entry &&
      (entry.name?.toLowerCase() === "lace" ||
        entry.rdns === "io.lace.wallet")
    ) {
      return entry;
    }
  }
  return null;
}

/** Check if the Lace wallet extension (Cardano side) is installed at all. */
export function isLaceInstalled(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).cardano?.lace;
}

/** Check if the Lace wallet extension with Midnight support is installed. */
export function isWalletAvailable(): boolean {
  return !!findLaceEntry();
}

/** Get the wallet name and icon for UI display. */
export function getWalletInfo(): { name: string; icon: string } | null {
  const entry = findLaceEntry();
  if (!entry) return null;
  return { name: entry.name, icon: entry.icon };
}

// ─── Connection ─────────────────────────────────────────────────

/**
 * Connect to the Lace wallet and return a full WalletConnection.
 *
 * Flow:
 *   1. Discover Lace entry in window.midnight (by name/rdns)
 *   2. Call connect(networkId) → ConnectedAPI
 *   3. Fetch addresses, dust balance, and configuration
 *   4. Return typed WalletConnection
 *
 * @throws WalletNotFoundError if extension is not installed
 * @throws WalletConnectionRejectedError if user rejects
 */
export async function connectWallet(networkId: string): Promise<WalletConnection> {
  if (!isWalletAvailable()) {
    if (isLaceInstalled()) {
      throw new WalletMidnightNotEnabledError();
    }
    throw new WalletNotFoundError();
  }

  const entry = findLaceEntry()!;
  let api: ConnectedAPI;

  try {
    api = await entry.connect(networkId);
  } catch (err) {
    throw new WalletConnectionRejectedError(err);
  }

  const state = await fetchWalletState(api);
  const config = await api.getConfiguration();

  return { api, state, config };
}

// ─── State ──────────────────────────────────────────────────────

/**
 * Fetch current wallet state from a connected API.
 * Call this to refresh after a transaction.
 */
export async function fetchWalletState(api: ConnectedAPI): Promise<WalletState> {
  const [addresses, dust] = await Promise.all([
    api.getShieldedAddresses(),
    api.getDustBalance(),
  ]);

  return {
    address: addresses.shieldedAddress,
    coinPublicKey: addresses.shieldedCoinPublicKey,
    encryptionPublicKey: addresses.shieldedEncryptionPublicKey,
    dustBalance: dust.balance,
    dustCap: dust.cap,
  };
}

// ─── Health check ───────────────────────────────────────────────

/**
 * Check if the wallet connection is still alive.
 * @throws WalletDisconnectedError if connection is lost
 */
export async function ensureConnected(api: ConnectedAPI): Promise<void> {
  try {
    const status = await api.getConnectionStatus();
    if (status.status === "disconnected") {
      throw new WalletDisconnectedError();
    }
  } catch (err) {
    if (err instanceof WalletDisconnectedError) throw err;
    throw classifyError(err);
  }
}
