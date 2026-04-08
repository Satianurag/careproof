import {
  type ContractState,
  type VerificationRecord,
  bytesToHex,
} from "../types";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ||
  "http://127.0.0.1:8088/api/v3/graphql";

export interface LedgerState {
  totalCredentials: bigint;
  totalVerifications: bigint;
  activeCredentials: string[];
  revokedCredentials: string[];
  verificationLog: Array<VerificationRecord & { logKeyHex: string }>;
}

export async function queryLedgerState(
  contractAddress: string = CONTRACT_ADDRESS,
  indexerUrl: string = INDEXER_URL,
): Promise<ContractState | null> {
  const query = `
    query GetContractState($address: String!) {
      contractState(address: $address) {
        state
      }
    }
  `;

  try {
    const response = await fetch(indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { address: contractAddress },
      }),
    });

    if (!response.ok) {
      throw new Error(`Indexer API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    const contractState = result.data?.contractState?.state;
    if (!contractState) return null;

    return {
      totalCredentials: BigInt(contractState.total_credentials ?? 0),
      totalVerifications: BigInt(contractState.total_verifications ?? 0),
      activeCredentialCount: BigInt(contractState.active_credentials_size ?? 0),
      revokedCredentialCount: BigInt(contractState.revoked_credentials_size ?? 0),
    };
  } catch (error) {
    console.error("Failed to query contract state:", error);
    return null;
  }
}

export async function queryFullLedgerState(
  contractAddress: string = CONTRACT_ADDRESS,
  indexerUrl: string = INDEXER_URL,
): Promise<LedgerState | null> {
  const query = `
    query GetFullContractState($address: String!) {
      contractState(address: $address) {
        state
      }
    }
  `;

  try {
    const response = await fetch(indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { address: contractAddress },
      }),
    });

    if (!response.ok) {
      throw new Error(`Indexer API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    const state = result.data?.contractState?.state;
    if (!state) return null;

    const activeCredentials: string[] = [];
    if (state.active_credentials) {
      for (const elem of Object.values(state.active_credentials)) {
        activeCredentials.push(
          elem instanceof Uint8Array ? bytesToHex(elem) : String(elem),
        );
      }
    }

    const revokedCredentials: string[] = [];
    if (state.revoked_credentials) {
      for (const elem of Object.values(state.revoked_credentials)) {
        revokedCredentials.push(
          elem instanceof Uint8Array ? bytesToHex(elem) : String(elem),
        );
      }
    }

    const verificationLog: LedgerState["verificationLog"] = [];
    if (state.verification_log) {
      for (const [logKey, rec] of Object.entries(state.verification_log)) {
        const r = rec as Record<string, unknown>;
        verificationLog.push({
          logKeyHex: logKey,
          verifier: (r.verifier as { bytes: Uint8Array }) ?? { bytes: new Uint8Array(32) },
          commitment: r.commitment instanceof Uint8Array ? r.commitment : new Uint8Array(32),
          is_valid: Boolean(r.is_valid),
        });
      }
    }

    return {
      totalCredentials: BigInt(state.total_credentials ?? 0),
      totalVerifications: BigInt(state.total_verifications ?? 0),
      activeCredentials,
      revokedCredentials,
      verificationLog,
    };
  } catch (error) {
    console.error("Failed to query full ledger state:", error);
    return null;
  }
}
