import fs from "fs";
import path from "path";
import { setNetworkId } from "@midnight-ntwrk/midnight-js/network-id";
import { NetworkConfig } from "../providers/midnight-providers.js";

const LOCALNET_CONFIG: NetworkConfig = {
  key: "undeployed",
  name: "Localnet",
  indexer: "http://127.0.0.1:8088/api/v3/graphql",
  indexerWS: "ws://127.0.0.1:8088/api/v3/graphql/ws",
  node: "http://127.0.0.1:9944",
  proofServer: "http://127.0.0.1:6300",
};

export interface FundingInstruction {
  title: string;
  steps: string[];
}

export class EnvironmentManager {
  static getNetworkConfig(): NetworkConfig {
    setNetworkId("undeployed");

    return {
      ...LOCALNET_CONFIG,
      indexer: process.env.INDEXER_URL || LOCALNET_CONFIG.indexer,
      indexerWS: process.env.INDEXER_WS_URL || LOCALNET_CONFIG.indexerWS,
      node: process.env.NODE_URL || LOCALNET_CONFIG.node,
      proofServer: process.env.PROOF_SERVER_URL || LOCALNET_CONFIG.proofServer,
    };
  }

  static getFundingInstructions(config: NetworkConfig): FundingInstruction {
    return {
      title: `How to fund your ${config.name} wallet`,
      steps: [
        "Start the local Midnight network: clone midnight-local-dev and run 'npm start'.",
        "Choose option [1] to fund accounts from config file, or use 'npm run fund-local'.",
        "Wait for the wallet to sync after the transfer lands.",
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
