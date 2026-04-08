import { Buffer } from "buffer";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { unshieldedToken } from "@midnight-ntwrk/ledger-v8";
import { getNetworkId } from "@midnight-ntwrk/midnight-js/network-id";
import type { MidnightProvider, WalletProvider } from "@midnight-ntwrk/midnight-js/types";
import {
  MidnightBech32m,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from "@midnight-ntwrk/wallet-sdk-address-format";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { HDWallet, Roles } from "@midnight-ntwrk/wallet-sdk-hd";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import * as Rx from "rxjs";
import { WebSocket } from "ws";
import type { NetworkConfig } from "./providers/midnight-providers.js";

Reflect.set(globalThis, "WebSocket", WebSocket);

export interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

export interface WalletSnapshot {
  shieldedAddress: string;
  unshieldedAddress: string;
  dustAddress: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
  unshieldedBalance: bigint;
  dustBalance: bigint;
}

const buildShieldedConfig = ({ indexer, indexerWS, node, proofServer }: NetworkConfig) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, "ws")),
});

const buildUnshieldedConfig = ({ indexer, indexerWS }: NetworkConfig) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  txHistoryStorage: new InMemoryTransactionHistoryStorage(),
});

const buildDustConfig = ({ indexer, indexerWS, node, proofServer }: NetworkConfig) => ({
  networkId: getNetworkId(),
  costParameters: {
    additionalFeeOverhead: 300_000_000_000_000n,
    feeBlocksMargin: 5,
  },
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, "ws")),
});

const deriveKeysFromSeed = (seed: string) => {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hdWallet.type !== "seedOk") {
    throw new Error("Failed to initialize HD wallet from seed.");
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== "keysDerived") {
    throw new Error("Failed to derive Midnight wallet keys.");
  }

  hdWallet.hdWallet.clear();
  return derivationResult.keys;
};

const registerForDustGeneration = async (
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<void> => {
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  if (state.dust.balance(new Date()) > 0n) {
    return;
  }

  const nightUtxos = state.unshielded.availableCoins.filter(
    (coin: { meta?: { registeredForDustGeneration?: boolean } }) =>
      coin.meta?.registeredForDustGeneration !== true,
  );

  if (nightUtxos.length > 0) {
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      nightUtxos,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );
    const finalized = await wallet.finalizeRecipe(recipe);
    await wallet.submitTransaction(finalized);
  }

  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced),
      Rx.filter((s) => s.dust.balance(new Date()) > 0n),
    ),
  );
};

export const waitForSync = (wallet: WalletFacade) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((state) => state.isSynced),
    ),
  );

export const waitForFunds = (wallet: WalletFacade): Promise<bigint> =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((state) => state.isSynced),
      Rx.map((state) => state.unshielded.balances[unshieldedToken().raw] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

export const buildWallet = async (
  networkConfig: NetworkConfig,
  seed: string,
): Promise<WalletContext> => {
  const keys = deriveKeysFromSeed(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const walletConfig = {
    ...buildShieldedConfig(networkConfig),
    ...buildUnshieldedConfig(networkConfig),
    ...buildDustConfig(networkConfig),
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) =>
      UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg) =>
      DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return {
    wallet,
    shieldedSecretKeys,
    dustSecretKey,
    unshieldedKeystore,
  };
};

export const ensureDustReady = async (context: WalletContext): Promise<void> => {
  await registerForDustGeneration(context.wallet, context.unshieldedKeystore);
};

export const buildWalletAndWaitForFunds = async (
  networkConfig: NetworkConfig,
  seed: string,
): Promise<WalletContext> => {
  const walletContext = await buildWallet(networkConfig, seed);
  const syncedState = await waitForSync(walletContext.wallet);
  const balance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;

  if (balance === 0n) {
    await waitForFunds(walletContext.wallet);
  }

  await ensureDustReady(walletContext);

  return walletContext;
};

export const signTransactionIntents = (
  tx: { intents?: Map<number, unknown> },
  signFn: (payload: Uint8Array) => ledger.Signature,
  proofMarker: "proof" | "pre-proof",
): void => {
  if (!tx.intents || tx.intents.size === 0) {
    return;
  }

  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent || !(intent instanceof Object) || !("serialize" in intent)) {
      continue;
    }

    const cloned = ledger.Intent.deserialize<ledger.SignatureEnabled, ledger.Proofish, ledger.PreBinding>(
      "signature",
      proofMarker,
      "pre-binding",
      (intent as { serialize: () => Uint8Array }).serialize(),
    );

    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);

    if (cloned.fallibleUnshieldedOffer) {
      const signatures = cloned.fallibleUnshieldedOffer.inputs.map(
        (_input, index) => cloned.fallibleUnshieldedOffer!.signatures.at(index) ?? signature,
      );
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(signatures);
    }

    if (cloned.guaranteedUnshieldedOffer) {
      const signatures = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_input, index) => cloned.guaranteedUnshieldedOffer!.signatures.at(index) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(signatures);
    }

    tx.intents.set(segment, cloned);
  }
};

export const createWalletAndMidnightProvider = async (
  context: WalletContext,
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(context.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  return {
    getCoinPublicKey() {
      return state.shielded.coinPublicKey.toHexString();
    },
    getEncryptionPublicKey() {
      return state.shielded.encryptionPublicKey.toHexString();
    },
    async balanceTx(tx, ttl?) {
      const recipe = await context.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: context.shieldedSecretKeys,
          dustSecretKey: context.dustSecretKey,
        },
        {
          ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000),
        },
      );

      const signFn = (payload: Uint8Array) => context.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, "proof");
      if (recipe.balancingTransaction) {
        signTransactionIntents(recipe.balancingTransaction, signFn, "pre-proof");
      }

      return context.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) {
      return context.wallet.submitTransaction(tx) as never;
    },
  };
};

export const getWalletSnapshot = async (context: WalletContext): Promise<WalletSnapshot> => {
  const state = await Rx.firstValueFrom(context.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const networkId = getNetworkId();
  const coinPublicKey = state.shielded.coinPublicKey.toHexString();
  const encryptionPublicKey = state.shielded.encryptionPublicKey.toHexString();
  const shieldedAddress = MidnightBech32m.encode(
    networkId,
    new ShieldedAddress(
      ShieldedCoinPublicKey.fromHexString(coinPublicKey),
      ShieldedEncryptionPublicKey.fromHexString(encryptionPublicKey),
    ),
  ).toString();

  return {
    shieldedAddress,
    unshieldedAddress: context.unshieldedKeystore.getBech32Address().toString(),
    dustAddress: MidnightBech32m.encode(networkId, state.dust.address).toString(),
    coinPublicKey,
    encryptionPublicKey,
    unshieldedBalance: state.unshielded.balances[unshieldedToken().raw] ?? 0n,
    dustBalance: state.dust.balance(new Date()),
  };
};
