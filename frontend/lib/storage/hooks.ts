"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllCredentials,
  storeCredential,
  deleteCredential,
  updateCredentialStatus,
  getCredentialByCommitment,
  syncCredentialStatuses,
  getAllConsents,
  storeConsent,
  deleteConsent,
  consentKey,
  type StoredCredential,
  type StoredConsent,
  type CredentialStatus,
} from "./db";

// ─── Credential store hook ───────────────────────────────────────

export function useCredentialStore(contractAddress?: string) {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllCredentials(contractAddress);
      // Sort newest first
      setCredentials(all.sort((a, b) => b.storedAt - a.storedAt));
    } catch (err) {
      console.error("Failed to load credentials from IndexedDB:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (credential: StoredCredential) => {
      await storeCredential(credential);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (credentialId: string) => {
      await deleteCredential(credentialId);
      await refresh();
    },
    [refresh],
  );

  const setStatus = useCallback(
    async (credentialId: string, status: CredentialStatus) => {
      await updateCredentialStatus(credentialId, status);
      await refresh();
    },
    [refresh],
  );

  const findByCommitment = useCallback(
    async (commitmentHex: string) => {
      return getCredentialByCommitment(commitmentHex);
    },
    [],
  );

  const syncWithChain = useCallback(
    async (activeCommitments: string[], revokedCommitments: string[]) => {
      if (!contractAddress) return;
      await syncCredentialStatuses(activeCommitments, revokedCommitments, contractAddress);
      await refresh();
    },
    [contractAddress, refresh],
  );

  return {
    credentials,
    isLoading,
    refresh,
    add,
    remove,
    setStatus,
    findByCommitment,
    syncWithChain,
  };
}

// ─── Consent store hook ──────────────────────────────────────────

export function useConsentStore(contractAddress?: string) {
  const [consents, setConsents] = useState<StoredConsent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllConsents(contractAddress);
      setConsents(all.sort((a, b) => b.grantedAt - a.grantedAt));
    } catch (err) {
      console.error("Failed to load consents from IndexedDB:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (doctorHex: string, credentialId: string) => {
      if (!contractAddress) return;
      const id = consentKey(doctorHex, credentialId);
      await storeConsent({
        id,
        doctorHex,
        credentialId,
        grantedAt: Date.now(),
        contractAddress,
      });
      await refresh();
    },
    [contractAddress, refresh],
  );

  const remove = useCallback(
    async (doctorHex: string, credentialId: string) => {
      const id = consentKey(doctorHex, credentialId);
      await deleteConsent(id);
      await refresh();
    },
    [refresh],
  );

  return {
    consents,
    isLoading,
    refresh,
    add,
    remove,
  };
}
