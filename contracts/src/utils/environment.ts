import fs from "fs";
import path from "path";
import { setNetworkId } from "@midnight-ntwrk/midnight-js/network-id";
import { NetworkConfig } from "../providers/midnight-providers.js";

export type SupportedMidnightNetwork = "preview" | "preprod";

const NETWORKS: Record<SupportedMidnightNetwork, NetworkConfig & { networkId: SupportedMidnightNetwork }> = {
  preview: {
    key: "preview",
    name: "Preview Testnet",
    networkId: "preview",
    indexer: "https://indexer.preview.midnight.network/api/v3/graphql",
    indexerWS: "wss://indexer.preview.midnight.network/api/v3/graphql/ws",
    node: "https://rpc.preview.midnight.network",
    proofServer: "https://lace-proof-pub.preview.midnight.network",
  },
  preprod: {
    key: "preprod",
    name: "Preprod",
    networkId: "preprod",
    indexer: "https://indexer.preprod.midnight.network/api/v3/graphql",
    indexerWS: "wss://indexer.preprod.midnight.network/api/v3/graphql/ws",
    node: "https://rpc.preprod.midnight.network",
    proofServer: "https://lace-proof-pub.preprod.midnight.network",
  },
};

export interface FundingInstruction {
  title: string;
  steps: string[];
}

export class EnvironmentManager {
  static getRequestedNetwork(): SupportedMidnightNetwork {
    const env = process.env.MIDNIGHT_NETWORK as SupportedMidnightNetwork | undefined;
    return env && env in NETWORKS ? env : "preprod";
  }

  static getNetworkConfig(): NetworkConfig {
    const requestedNetwork = EnvironmentManager.getRequestedNetwork();
    const config = NETWORKS[requestedNetwork];

    setNetworkId(config.networkId);

    return {
      ...config,
      indexer: process.env.INDEXER_URL || config.indexer,
      indexerWS: process.env.INDEXER_WS_URL || config.indexerWS,
      node: process.env.NODE_URL || config.node,
      proofServer: process.env.PROOF_SERVER_URL || config.proofServer,
    };
  }

  static getFundingInstructions(config: NetworkConfig): FundingInstruction {
    return {
      title: `How to fund your ${config.name} wallet`,
      steps: [
        `Navigate to the faucet: https://faucet.${config.key}.midnight.network/`,
        "Enter your wallet address and request tNIGHT tokens.",
        "Wait for the wallet to sync after the faucet transfer lands.",
        "Deploy and CLI flows will register DUST automatically when the wallet is ready.",
      ],
    };
  }

  static validateEnvironment(): void {
    const required = ["WALLET_SEED"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }

    const walletSeed = process.env.WALLET_SEED!;
    if (!/^[a-fA-F0-9]{64}$/.test(walletSeed)) {
      throw new Error("WALLET_SEED must be a 64-character hexadecimal string");
    }
  }

  static getPrivateStatePassword(): string {
    const password = process.env.PRIVATE_STATE_PASSWORD;

    if (!password) {
      throw new Error("Missing required environment variable: PRIVATE_STATE_PASSWORD");
    }

    if (password.length < 16) {
      throw new Error("PRIVATE_STATE_PASSWORD must be at least 16 characters long");
    }

    return password;
  }

  static checkContractCompiled(contractName: string): boolean {
    const contractPath = path.join(
      process.cwd(),
      "contracts",
      "managed",
      contractName,
    );
    const keysPath = path.join(contractPath, "keys");
    const cjsContractModulePath = path.join(contractPath, "contract", "index.cjs");
    const esmContractModulePath = path.join(contractPath, "contract", "index.js");

    return (
      fs.existsSync(keysPath) &&
      (fs.existsSync(cjsContractModulePath) || fs.existsSync(esmContractModulePath))
    );
  }
}
