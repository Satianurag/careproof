/**
 * Non-interactive script to fund the CareProof wallet on localnet.
 * Uses the genesis master wallet (seed 0x00...001) to transfer NIGHT
 * and register DUST for the configured WALLET_SEED.
 *
 * Usage: npm run fund-local
 */
import "dotenv/config.js";
import chalk from "chalk";
import { Buffer } from "buffer";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { HDWallet, Roles } from "@midnight-ntwrk/wallet-sdk-hd";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import { getNetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js/network-id";
import * as Rx from "rxjs";
import { WebSocket } from "ws";

Reflect.set(globalThis, "WebSocket", WebSocket);

const GENESIS_SEED = "0000000000000000000000000000000000000000000000000000000000000001";
const NIGHT_AMOUNT = 50_000n * 10n ** 6n; // 50,000 NIGHT

const config = {
  indexer: "http://127.0.0.1:8088/api/v3/graphql",
  indexerWS: "ws://127.0.0.1:8088/api/v3/graphql/ws",
  node: "http://127.0.0.1:9944",
  proofServer: "http://127.0.0.1:6300",
  networkId: "undeployed",
};

function deriveKeys(seed: Buffer) {
  const hdWallet = HDWallet.fromSeed(seed);
  if (hdWallet.type !== "seedOk") throw new Error("HDWallet init failed");
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== "keysDerived") throw new Error("Key derivation failed");
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function buildWalletFromSeed(hexSeed: string) {
  const seed = Buffer.from(hexSeed, "hex");
  const keys = deriveKeys(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], config.networkId);

  const wallet = await WalletFacade.init({
    configuration: {
      networkId: config.networkId,
      indexerClientConnection: {
        indexerHttpUrl: config.indexer,
        indexerWsUrl: config.indexerWS,
      },
      provingServerUrl: new URL(config.proofServer),
      relayURL: new URL(config.node.replace(/^http/, "ws")),
      costParameters: {
        additionalFeeOverhead: 300_000_000_000_000n,
        feeBlocksMargin: 5,
      },
      txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    },
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) =>
      UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg) =>
      DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

async function waitForSync(wallet: WalletFacade) {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced),
    ),
  );
}

async function waitForFunds(wallet: WalletFacade) {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((s) => s.isSynced),
      Rx.map((s) => (s.unshielded?.balances[ledger.unshieldedToken().raw] ?? 0n)),
      Rx.filter((b) => b > 0n),
    ),
  );
}

async function main() {
  console.log();
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log(chalk.blue.bold("💰  CareProof Localnet Wallet Funder"));
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log();

  setNetworkId("undeployed");

  const recipientSeed = process.env.WALLET_SEED;
  if (!recipientSeed) {
    console.error(chalk.red("❌ WALLET_SEED not set in .env"));
    process.exit(1);
  }

  // 1. Build genesis master wallet
  console.log(chalk.gray("Building genesis master wallet..."));
  const master = await buildWalletFromSeed(GENESIS_SEED);

  try {
    console.log(chalk.gray("Waiting for master wallet to sync..."));
    await waitForSync(master.wallet);

    const masterState = await Rx.firstValueFrom(master.wallet.state());
    const masterBalance = masterState.unshielded?.balances[ledger.unshieldedToken().raw] ?? 0n;
    console.log(chalk.green(`✅ Master wallet NIGHT balance: ${masterBalance.toLocaleString()}`));

    if (masterBalance === 0n) {
      console.log(chalk.yellow("⏳ Waiting for genesis funds to appear..."));
      await waitForFunds(master.wallet);
    }

    // Register DUST for master wallet if needed
    const masterDust = masterState.dust?.balance(new Date()) ?? 0n;
    if (masterDust === 0n) {
      console.log(chalk.gray("Registering DUST for master wallet..."));
      const nightUtxos = masterState.unshielded?.availableCoins.filter(
        (c: any) => c.meta?.registeredForDustGeneration !== true,
      ) ?? [];

      if (nightUtxos.length > 0) {
        const recipe = await master.wallet.registerNightUtxosForDustGeneration(
          nightUtxos,
          master.unshieldedKeystore.getPublicKey(),
          (payload) => master.unshieldedKeystore.signData(payload),
        );
        const finalized = await master.wallet.finalizeRecipe(recipe);
        await master.wallet.submitTransaction(finalized);

        await Rx.firstValueFrom(
          master.wallet.state().pipe(
            Rx.throttleTime(5_000),
            Rx.filter((s) => s.isSynced),
            Rx.filter((s) => (s.dust?.balance(new Date()) ?? 0n) > 0n),
          ),
        );
      }
      console.log(chalk.green("✅ Master DUST registered"));
    }

    // 2. Build recipient wallet to get its address
    console.log(chalk.gray("Building recipient wallet..."));
    const recipient = await buildWalletFromSeed(recipientSeed);

    try {
      await waitForSync(recipient.wallet);
      const recipientAddress = await recipient.wallet.unshielded.getAddress();
      console.log(chalk.cyan(`📍 Recipient address: ${recipient.unshieldedKeystore.getBech32Address()}`));

      // Check if already funded
      const recipientState = await Rx.firstValueFrom(recipient.wallet.state());
      const recipientBalance = recipientState.unshielded?.balances[ledger.unshieldedToken().raw] ?? 0n;

      if (recipientBalance > 0n) {
        console.log(chalk.green(`✅ Recipient already has ${recipientBalance.toLocaleString()} NIGHT`));
      } else {
        // 3. Transfer NIGHT from master to recipient
        console.log(chalk.blue(`🚀 Transferring ${NIGHT_AMOUNT.toLocaleString()} NIGHT...`));

        const ttl = new Date(Date.now() + 30 * 60 * 1000);
        const recipe = await master.wallet.transferTransaction(
          [{
            type: "unshielded",
            outputs: [{
              type: ledger.nativeToken().raw,
              receiverAddress: recipientAddress,
              amount: NIGHT_AMOUNT,
            }],
          }],
          {
            shieldedSecretKeys: master.shieldedSecretKeys,
            dustSecretKey: master.dustSecretKey,
          },
          { ttl },
        );

        const signed = await master.wallet.signRecipe(
          recipe,
          (payload) => master.unshieldedKeystore.signData(payload),
        );

        const finalized = await master.wallet.finalizeRecipe(signed);
        const txId = await master.wallet.submitTransaction(finalized);
        console.log(chalk.gray(`TX submitted: ${txId}`));

        // Wait for recipient to see funds
        console.log(chalk.gray("Waiting for funds to arrive..."));
        await waitForFunds(recipient.wallet);
        console.log(chalk.green("✅ NIGHT transfer complete!"));
      }

      // 4. Register DUST for recipient
      const recipientDust = (await Rx.firstValueFrom(
        recipient.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
      )).dust?.balance(new Date()) ?? 0n;

      if (recipientDust === 0n) {
        console.log(chalk.gray("Registering DUST for recipient..."));
        const rState = await Rx.firstValueFrom(
          recipient.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
        );
        const nightUtxos = rState.unshielded?.availableCoins.filter(
          (c: any) => c.meta?.registeredForDustGeneration !== true,
        ) ?? [];

        if (nightUtxos.length > 0) {
          const recipe = await recipient.wallet.registerNightUtxosForDustGeneration(
            nightUtxos,
            recipient.unshieldedKeystore.getPublicKey(),
            (payload) => recipient.unshieldedKeystore.signData(payload),
          );
          const finalized = await recipient.wallet.finalizeRecipe(recipe);
          await recipient.wallet.submitTransaction(finalized);

          await Rx.firstValueFrom(
            recipient.wallet.state().pipe(
              Rx.throttleTime(5_000),
              Rx.filter((s) => s.isSynced),
              Rx.filter((s) => (s.dust?.balance(new Date()) ?? 0n) > 0n),
            ),
          );
        }
        console.log(chalk.green("✅ Recipient DUST registered"));
      } else {
        console.log(chalk.green(`✅ Recipient already has DUST: ${recipientDust.toLocaleString()}`));
      }

      // Final balances
      const finalState = await Rx.firstValueFrom(
        recipient.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
      );
      const finalNight = finalState.unshielded?.balances[ledger.unshieldedToken().raw] ?? 0n;
      const finalDust = finalState.dust?.balance(new Date()) ?? 0n;

      console.log();
      console.log(chalk.green.bold("━".repeat(60)));
      console.log(chalk.green.bold("🎉 WALLET FUNDED SUCCESSFULLY!"));
      console.log(chalk.green.bold("━".repeat(60)));
      console.log(chalk.yellow.bold(`💰 NIGHT: ${finalNight.toLocaleString()}`));
      console.log(chalk.yellow.bold(`🪙 DUST:  ${finalDust.toLocaleString()}`));
      console.log();

      await recipient.wallet.stop();
    } catch (e) {
      await recipient.wallet.stop();
      throw e;
    }
  } finally {
    await master.wallet.stop();
  }
}

main().catch((error) => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
