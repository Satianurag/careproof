/**
 * IndexedDB credential vault for CareProof.
 *
 * Stores issued credential artifacts (W3C VCs) client-side so the patient
 * can view, share, and present them without re-querying the network.
 *
 * Schema:
 *   - credentials: Issued VCs keyed by credentialId
 *   - consents:    Active consent grants keyed by composite key
 */

import type { CareProofVC } from "@/lib/credentials/vc-types";

// ─── Types ───────────────────────────────────────────────────────

export type CredentialStatus = "active" | "revoked" | "expired";

export interface StoredCredential {
  /** Unique credential ID (from contract) */
  credentialId: string;
  /** The W3C VC artifact */
  vc: CareProofVC;
  /** Commitment hash (hex) — used to cross-reference on-chain state */
  commitmentHex: string;
  /** Credential type: MedicalLeave, Vaccination, Eligibility */
  credentialType: "MedicalLeave" | "Vaccination" | "Eligibility";
  /** Issuer DID */
  issuerDid: string;
  /** Subject (patient) DID */
  subjectDid: string;
  /** Expiry as unix seconds */
  expiryUnix: number;
  /** Issued at as unix seconds */
  issuedAtUnix: number;
  /** Local status (updated when synced with on-chain state) */
  status: CredentialStatus;
  /** Contract address this credential belongs to */
  contractAddress: string;
  /** Timestamp when stored locally */
  storedAt: number;
}

export interface StoredConsent {
  /** Composite key: `${doctorHex}:${credentialId}` */
  id: string;
  /** Doctor public key (hex) */
  doctorHex: string;
  /** Credential ID */
  credentialId: string;
  /** When consent was granted (local timestamp) */
  grantedAt: number;
  /** Contract address */
  contractAddress: string;
}

// ─── Database ────────────────────────────────────────────────────

const DB_NAME = "careproof-vault";
const DB_VERSION = 1;
const CREDENTIAL_STORE = "credentials";
const CONSENT_STORE = "consents";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(CREDENTIAL_STORE)) {
        const credStore = db.createObjectStore(CREDENTIAL_STORE, { keyPath: "credentialId" });
        credStore.createIndex("by_commitment", "commitmentHex", { unique: false });
        credStore.createIndex("by_status", "status", { unique: false });
        credStore.createIndex("by_contract", "contractAddress", { unique: false });
      }

      if (!db.objectStoreNames.contains(CONSENT_STORE)) {
        const consentStore = db.createObjectStore(CONSENT_STORE, { keyPath: "id" });
        consentStore.createIndex("by_contract", "contractAddress", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Credential CRUD ─────────────────────────────────────────────

export async function storeCredential(credential: StoredCredential): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIAL_STORE, "readwrite");
    tx.objectStore(CREDENTIAL_STORE).put(credential);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCredential(credentialId: string): Promise<StoredCredential | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIAL_STORE, "readonly");
    const request = tx.objectStore(CREDENTIAL_STORE).get(credentialId);
    request.onsuccess = () => resolve(request.result ?? undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCredentials(contractAddress?: string): Promise<StoredCredential[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIAL_STORE, "readonly");
    const store = tx.objectStore(CREDENTIAL_STORE);

    let request: IDBRequest<StoredCredential[]>;
    if (contractAddress) {
      const index = store.index("by_contract");
      request = index.getAll(contractAddress);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function getCredentialByCommitment(commitmentHex: string): Promise<StoredCredential | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIAL_STORE, "readonly");
    const index = tx.objectStore(CREDENTIAL_STORE).index("by_commitment");
    const request = index.get(commitmentHex);
    request.onsuccess = () => resolve(request.result ?? undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function updateCredentialStatus(
  credentialId: string,
  status: CredentialStatus,
): Promise<void> {
  const existing = await getCredential(credentialId);
  if (!existing) return;
  await storeCredential({ ...existing, status });
}

export async function deleteCredential(credentialId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIAL_STORE, "readwrite");
    tx.objectStore(CREDENTIAL_STORE).delete(credentialId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Consent CRUD ────────────────────────────────────────────────

export function consentKey(doctorHex: string, credentialId: string): string {
  return `${doctorHex}:${credentialId}`;
}

export async function storeConsent(consent: StoredConsent): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONSENT_STORE, "readwrite");
    tx.objectStore(CONSENT_STORE).put(consent);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllConsents(contractAddress?: string): Promise<StoredConsent[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONSENT_STORE, "readonly");
    const store = tx.objectStore(CONSENT_STORE);

    let request: IDBRequest<StoredConsent[]>;
    if (contractAddress) {
      const index = store.index("by_contract");
      request = index.getAll(contractAddress);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteConsent(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONSENT_STORE, "readwrite");
    tx.objectStore(CONSENT_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Sync: Update local statuses from on-chain state ─────────────

export async function syncCredentialStatuses(
  activeCommitments: string[],
  revokedCommitments: string[],
  contractAddress: string,
): Promise<void> {
  const credentials = await getAllCredentials(contractAddress);
  const activeSet = new Set(activeCommitments);
  const revokedSet = new Set(revokedCommitments);
  const now = Math.floor(Date.now() / 1000);

  for (const cred of credentials) {
    let newStatus: CredentialStatus;
    if (revokedSet.has(cred.commitmentHex)) {
      newStatus = "revoked";
    } else if (cred.expiryUnix < now) {
      newStatus = "expired";
    } else if (activeSet.has(cred.commitmentHex)) {
      newStatus = "active";
    } else {
      // Not found on-chain — keep existing status
      continue;
    }

    if (cred.status !== newStatus) {
      await updateCredentialStatus(cred.credentialId, newStatus);
    }
  }
}
