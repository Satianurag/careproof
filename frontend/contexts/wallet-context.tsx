"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import "@midnight-ntwrk/dapp-connector-api";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  connectWallet as mnConnectWallet,
  getWalletInfo,
  CareProofClient,
  classifyError,
  type WalletConnection,
  type ResolvedRoles,
  type FullLedgerState,
  type LedgerStats,
  type TxProgress,
} from "@/lib/midnight";
import { toast } from "sonner";

const NETWORK_ID = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || "preview";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface WalletContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  coinPublicKey: string | null;
  encryptionPublicKey: string | null;
  walletName: string | null;
  walletIcon: string | null;
  error: string | null;

  // Role resolution
  roles: ResolvedRoles | null;
  isResolvingRoles: boolean;

  // Ledger state
  ledgerStats: LedgerStats | null;
  ledgerState: FullLedgerState | null;
  refreshLedgerState: () => Promise<void>;
  isLoadingState: boolean;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Contract client
  client: CareProofClient | null;

  // Raw wallet API (for advanced use)
  connectedAPI: ConnectedAPI | null;

  // Transaction state
  isTxPending: boolean;
  txProgress: TxProgress | null;
  setTxProgress: (p: TxProgress | null) => void;

  // Error recovery
  retryConnect: () => Promise<void>;
  isWalletHealthy: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [coinPublicKey, setCoinPublicKey] = useState<string | null>(null);
  const [encryptionPublicKey, setEncryptionPublicKey] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletIcon, setWalletIcon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [roles, setRoles] = useState<ResolvedRoles | null>(null);
  const [isResolvingRoles, setIsResolvingRoles] = useState(false);

  const [ledgerStats, setLedgerStats] = useState<LedgerStats | null>(null);
  const [ledgerState, setLedgerState] = useState<FullLedgerState | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const [isTxPending, setIsTxPending] = useState(false);
  const [txProgress, setTxProgress] = useState<TxProgress | null>(null);

  const [isWalletHealthy, setIsWalletHealthy] = useState(true);

  const connectionRef = useRef<WalletConnection | null>(null);
  const clientRef = useRef<CareProofClient | null>(null);

  // ── Connect ─────────────────────────────────────────────────

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Detect wallet info for UI
      const info = getWalletInfo();
      if (info) {
        setWalletName(info.name);
        setWalletIcon(info.icon);
      }

      // Connect via integration layer
      const connection = await mnConnectWallet(NETWORK_ID);
      connectionRef.current = connection;

      // Set wallet state
      setWalletAddress(connection.state.address);
      setCoinPublicKey(connection.state.coinPublicKey);
      setEncryptionPublicKey(connection.state.encryptionPublicKey);
      setIsConnected(true);

      // Create contract client
      const client = new CareProofClient(connection, {
        contractAddress: CONTRACT_ADDRESS,
        networkId: NETWORK_ID,
      });
      clientRef.current = client;

      // Resolve roles
      setIsResolvingRoles(true);
      try {
        const resolved = await client.resolveMyRoles();
        setRoles(resolved);
      } catch (err) {
        console.error("Role resolution failed:", err);
        // Default to patient on failure
        setRoles({ isAdmin: false, isDoctor: false, isVerifier: false, primary: "patient", all: ["patient"] });
      } finally {
        setIsResolvingRoles(false);
      }

      // Initial ledger state fetch
      try {
        const [stats, full] = await Promise.all([
          client.getLedgerStats(),
          client.getFullLedgerState(),
        ]);
        if (stats) setLedgerStats(stats);
        if (full) setLedgerState(full);
      } catch (err) {
        console.error("Initial ledger fetch failed:", err);
      }
    } catch (err) {
      const classified = classifyError(err);
      console.error("Wallet connection failed:", classified);
      setError(classified.message);
      setIsConnected(false);
      connectionRef.current = null;
      clientRef.current = null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── Disconnect ──────────────────────────────────────────────

  const disconnectWallet = useCallback(() => {
    connectionRef.current = null;
    clientRef.current = null;
    setIsConnected(false);
    setWalletAddress(null);
    setCoinPublicKey(null);
    setEncryptionPublicKey(null);
    setWalletName(null);
    setWalletIcon(null);
    setError(null);
    setRoles(null);
    setLedgerStats(null);
    setLedgerState(null);
    setTxProgress(null);
  }, []);

  // ── Refresh ledger state ────────────────────────────────────

  const refreshLedgerState = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    setIsLoadingState(true);
    try {
      const [stats, full] = await Promise.all([
        client.getLedgerStats(),
        client.getFullLedgerState(),
      ]);
      if (stats) setLedgerStats(stats);
      if (full) setLedgerState(full);
    } catch (err) {
      console.error("Failed to refresh ledger state:", err);
    } finally {
      setIsLoadingState(false);
    }
  }, []);

  // ── Auto-refresh after tx ───────────────────────────────────

  useEffect(() => {
    if (txProgress?.stage === "done") {
      setIsTxPending(false);
      void refreshLedgerState();
    } else if (txProgress?.stage === "error") {
      setIsTxPending(false);
    } else if (txProgress?.stage === "submitting" || txProgress?.stage === "balancing") {
      setIsTxPending(true);
    }
  }, [txProgress, refreshLedgerState]);

  // ── Connection health check (every 30s) ───────────────────────

  useEffect(() => {
    if (!isConnected) return;

    const checkHealth = async () => {
      try {
        const api = connectionRef.current?.api;
        if (!api) {
          setIsWalletHealthy(false);
          return;
        }
        const status = await api.getConnectionStatus();
        const healthy = status.status === "connected";
        setIsWalletHealthy(healthy);
        if (!healthy) {
          toast.error("Wallet connection lost. Please reconnect.");
        }
      } catch {
        setIsWalletHealthy(false);
        toast.error("Wallet connection lost. Please reconnect.");
      }
    };

    const interval = setInterval(() => void checkHealth(), 30_000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // ── Retry connect (after disconnect) ──────────────────────────

  const retryConnect = useCallback(async () => {
    disconnectWallet();
    await connectWallet();
  }, [disconnectWallet, connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletAddress,
        coinPublicKey,
        encryptionPublicKey,
        walletName,
        walletIcon,
        error,
        roles,
        isResolvingRoles,
        ledgerStats,
        ledgerState,
        refreshLedgerState,
        isLoadingState,
        connectWallet,
        disconnectWallet,
        client: clientRef.current,
        connectedAPI: connectionRef.current?.api ?? null,
        isTxPending,
        txProgress,
        setTxProgress,
        retryConnect,
        isWalletHealthy,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
