import path from "path";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { createWalletAndMidnightProvider, type WalletContext } from "../midnight-wallet.js";

export interface NetworkConfig {
  key: string;
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  name: string;
}

export interface ProviderConfig {
  contractName: string;
  walletContext: WalletContext;
  networkConfig: NetworkConfig;
  privateStatePassword: string;
  privateStateStoreName?: string;
}

export class MidnightProviders {
  static async create(config: ProviderConfig) {
    const contractPath = path.join(process.cwd(), "contracts");
    const zkConfigPath = path.join(
      contractPath,
      "managed",
      config.contractName,
    );
    const walletAndMidnightProvider = await createWalletAndMidnightProvider(
      config.walletContext,
    );
    const accountId = walletAndMidnightProvider.getCoinPublicKey();
    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

    return {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName:
          config.privateStateStoreName || `${config.contractName}-state`,
        signingKeyStoreName: `${config.contractName}-signing-keys`,
        accountId,
        privateStoragePasswordProvider: () => config.privateStatePassword,
      }),
      publicDataProvider: indexerPublicDataProvider(
        config.networkConfig.indexer,
        config.networkConfig.indexerWS,
      ),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(config.networkConfig.proofServer, zkConfigProvider),
      walletProvider: walletAndMidnightProvider,
      midnightProvider: walletAndMidnightProvider,
    };
  }
}
