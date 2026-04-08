import { mnemonicToSeedSync } from "bip39";
import fs from "node:fs";
import path from "node:path";

interface WalletSdkHdModule {
  HDWallet: {
    fromSeed(seed: Uint8Array):
      | {
          type: "seedOk";
          hdWallet: {
            selectAccount(account: number): {
              selectRole(role: number): {
                deriveKeyAt(index: number):
                  | { type: "keyDerived"; key: Uint8Array }
                  | { type: "keyOutOfBounds" };
              };
            };
          };
        }
      | {
          type: "seedError";
          error: unknown;
        };
  };
  Roles: {
    Zswap: number;
  };
  generateMnemonicWords(strength?: number): string[];
  joinMnemonicWords(words: string[]): string;
}

const loadWalletSdkHd = async (): Promise<WalletSdkHdModule> =>
  (await import("@midnight-ntwrk/wallet-sdk-hd")) as WalletSdkHdModule;

const deriveWalletSeed = async (mnemonic: string): Promise<string> => {
  const { HDWallet, Roles } = await loadWalletSdkHd();
  const rootSeed = mnemonicToSeedSync(mnemonic);
  const generatedWallet = HDWallet.fromSeed(rootSeed);

  if (generatedWallet.type !== "seedOk") {
    throw new Error("Failed to initialize HD wallet from mnemonic seed.");
  }

  const derivedKey = generatedWallet.hdWallet
    .selectAccount(0)
    .selectRole(Roles.Zswap)
    .deriveKeyAt(0);

  if (derivedKey.type !== "keyDerived") {
    throw new Error("Failed to derive the default Midnight Zswap wallet seed.");
  }

  const key = derivedKey.key as unknown;
  const walletSeed =
    typeof key === "string"
      ? key
      : Buffer.isBuffer(key)
        ? key.toString("hex")
        : ArrayBuffer.isView(key)
          ? Buffer.from(key.buffer, key.byteOffset, key.byteLength).toString("hex")
          : String(key);

  if (!/^[a-fA-F0-9]{64}$/.test(walletSeed)) {
    throw new Error(`Derived wallet seed is not a 64-character hex string: ${walletSeed}`);
  }

  return walletSeed.toLowerCase();
};

const writeLocalWalletFiles = (walletSeed: string, mnemonic: string) => {
  const envPath = path.resolve(process.cwd(), ".env");
  const accountsPath = path.resolve(process.cwd(), "accounts.json");
  const envContent = [
    `WALLET_SEED=${walletSeed}`,
    "PROOF_SERVER_URL=http://127.0.0.1:6300",
    "CONTRACT_NAME=careproof",
  ].join("\n");
  const accountsContent = JSON.stringify(
    {
      accounts: [
        {
          name: "CareProof Local Wallet",
          mnemonic,
        },
      ],
    },
    null,
    2,
  );

  fs.writeFileSync(envPath, `${envContent}\n`);
  fs.writeFileSync(accountsPath, `${accountsContent}\n`);

  return { envPath, accountsPath };
};

async function main() {
  const { generateMnemonicWords, joinMnemonicWords } = await loadWalletSdkHd();
  const mnemonic = joinMnemonicWords(generateMnemonicWords(256));
  const walletSeed = await deriveWalletSeed(mnemonic);
  const { envPath, accountsPath } = writeLocalWalletFiles(walletSeed, mnemonic);

  console.log();
  console.log("CareProof local wallet bootstrap complete.");
  console.log();
  console.log(`.env: ${envPath}`);
  console.log(`accounts.json: ${accountsPath}`);
  console.log();
  console.log("Next steps:");
  console.log("1. Start midnight-local-dev and choose option [1] Fund accounts from config file.");
  console.log(`2. Provide this file when prompted: ${accountsPath}`);
  console.log("3. After funding completes, rerun 'npm run check-balance' and then 'npm run deploy'.");
  console.log();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
