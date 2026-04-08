import fs from "fs";
import path from "path";
import { setNetworkId } from "@midnight-ntwrk/midnight-js/network-id";
import { NetworkConfig } from "../providers/midnight-providers.js";

export type SupportedMidnightNetwork = "undeployed" | "preview" | "preprod" | "mainnet";

const NETWORKS: Record<SupportedMidnightNetwork, NetworkConfig & { networkId: SupportedMidnightNetwork }> = {
  undeployed: {
    key: "undeployed",
    name: "Localnet",
    networkId: "undeployed",
    indexer: "http://127.0.0.1:8088/api/v3/graphql",
    indexerWS: "ws://127.0.0.1:8088/api/v3/graphql/ws",
    node: "http://127.0.0.1:9944",
    proofServer: "http://127.0.0.1:6300",
  },
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
  mainnet: {
    key: "mainnet",
    name: "Mainnet",
    networkId: "mainnet",
    indexer: "https://indexer.midnight.network/api/v3/graphql",
    indexerWS: "wss://indexer.midnight.network/api/v3/graphql/ws",
    node: "https://rpc.midnight.network",
    proofServer: "https://lace-proof-pub.midnight.network",
  },
};

export interface FundingInstruction {
  title: string;
  steps: string[];
}

export class EnvironmentManager {
  static getRequestedNetwork(): SupportedMidnightNetwork {
    const env = process.env.MIDNIGHT_NETWORK as SupportedMidnightNetwork | undefined;
    return env && env in NETWORKS ? env : "undeployed";
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

  static isLocalNetwork(config: NetworkConfig): boolean {
    return config.key === "undeployed";
  }

  static getFundingInstructions(config: NetworkConfig): FundingInstruction {
    if (config.key === "undeployed") {
      return {
        title: "How to fund your localnet wallet",
        steps: [
          "Start the local services with 'npm run localnet:up'.",
          "Use the official local funding flow from midnight-local-dev.",
          "Wait for the wallet to sync and accumulate DUST, then rerun this command.",
        ],
      };
    }
    return {
      title: `How to fund your ${config.name} wallet`,
      steps: [
        `Navigate to the faucet: https://faucet.${config.key}.midnight.network/`,
        "Enter your wallet address and request tNIGHT tokens.",
        `Register for DUST at: https://dust.${config.key}.midnight.network/`,
        "Wait for the wallet to sync and accumulate DUST, then rerun this command.",
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

  static checkContractCompiled(contractName: string): boolean {
    const contractPath = path.join(
      process.cwd(),
      "contracts",
      "managed",
      contractName,
    );
    const keysPath = path.join(contractPath, "keys");
    const contractModulePath = path.join(contractPath, "contract", "index.js");

    return fs.existsSync(keysPath) && fs.existsSync(contractModulePath);
  }
}
