import "dotenv/config.js";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js/contracts";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import chalk from "chalk";
import {
  buildWallet,
  ensureDustReady,
  getWalletSnapshot,
  waitForSync,
} from "./midnight-wallet.js";
import { MidnightProviders } from "./providers/midnight-providers.js";
import { EnvironmentManager } from "./utils/environment.js";

const readHexKey = async (rl: readline.Interface, prompt: string): Promise<{ bytes: Uint8Array }> => {
  const raw = await rl.question(prompt);
  const hex = raw.trim().replace(/^0x/, "");
  if (!/^[a-fA-F0-9]+$/.test(hex) || hex.length === 0) {
    throw new Error("Invalid hex string.");
  }
  return { bytes: Buffer.from(hex, "hex") };
};

const readBigInt = async (rl: readline.Interface, prompt: string): Promise<bigint> => {
  const raw = await rl.question(prompt);
  return BigInt(raw.trim());
};

const readBytes32 = async (rl: readline.Interface, prompt: string): Promise<Uint8Array> => {
  const raw = await rl.question(prompt);
  const hex = raw.trim().replace(/^0x/, "");
  if (hex.length !== 64) {
    throw new Error("Expected 32-byte (64-char hex) value.");
  }
  return Buffer.from(hex, "hex");
};

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(chalk.blue.bold("\n🏥 CareProof Admin CLI\n"));

  try {
    EnvironmentManager.validateEnvironment();

    if (!fs.existsSync("deployment.json")) {
      console.error("❌ No deployment.json found! Run npm run deploy first.");
      process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
    console.log(`Contract: ${deployment.contractAddress}\n`);

    const networkConfig = EnvironmentManager.getNetworkConfig();
    const contractName =
      deployment.contractName || process.env.CONTRACT_NAME || "careproof";
    const walletSeed = process.env.WALLET_SEED!;

    console.log("Connecting to Midnight network...");
    console.log(chalk.gray(`Network: ${networkConfig.name}`));
    console.log();

    const walletContext = await buildWallet(networkConfig, walletSeed);

    try {
      await waitForSync(walletContext.wallet);
      const snapshot = await getWalletSnapshot(walletContext);

      if (snapshot.unshieldedBalance === 0n) {
        throw new Error("Wallet has no unshielded NIGHT. Fund it before using the admin CLI.");
      }

      if (snapshot.dustBalance === 0n) {
        console.log(chalk.blue("🪙 Registering NIGHT for DUST generation..."));
        await ensureDustReady(walletContext);
      }

      const contractPath = path.join(process.cwd(), "contracts");
      const managedContractPath = path.join(contractPath, "managed", contractName);
      const contractModulePath = path.join(managedContractPath, "contract", "index.js");
      const ContractModule = await import(contractModulePath);
      const compiledContract = CompiledContract.make(contractName, ContractModule.Contract as any).pipe(
        CompiledContract.withVacantWitnesses,
        CompiledContract.withCompiledFileAssets(managedContractPath),
      ) as any;

      const providers = await MidnightProviders.create({
        contractName,
        walletContext,
        networkConfig,
        privateStateStoreName: "careproof-private-state",
      });

      const deployed: any = await findDeployedContract(providers as any, {
        contractAddress: deployment.contractAddress,
        compiledContract,
      } as any);

      console.log("✅ Connected to contract\n");

      let running = true;
      while (running) {
        console.log(chalk.cyan("─── CareProof Admin Menu ───"));
        console.log(chalk.white(" [Role Management]"));
        console.log("  1.  Add doctor");
        console.log("  2.  Remove doctor");
        console.log("  3.  Add verifier");
        console.log("  4.  Remove verifier");
        console.log("  5.  Transfer admin");
        console.log(chalk.white(" [Contract Control]"));
        console.log("  6.  Pause contract");
        console.log("  7.  Unpause contract");
        console.log("  8.  Check paused state");
        console.log(chalk.white(" [Credentials]"));
        console.log("  9.  Issue credential");
        console.log("  10. Revoke credential");
        console.log(chalk.white(" [Verification]"));
        console.log("  11. Verify credential");
        console.log(chalk.white(" [Consent]"));
        console.log("  12. Grant consent");
        console.log("  13. Revoke consent");
        console.log(chalk.white(" [Queries]"));
        console.log("  14. Check doctor role");
        console.log("  15. Check verifier role");
        console.log("  16. Check admin role");
        console.log("  17. Read contract state");
        console.log("  18. Exit");

        const choice = (await rl.question("\nYour choice: ")).trim();

        try {
          switch (choice) {
            case "1": {
              const doctor = await readHexKey(rl, "Doctor public key (hex): ");
              const tx = await deployed.callTx.add_doctor(doctor);
              console.log(chalk.green(`✅ Doctor added. TX: ${tx.public.txId}\n`));
              break;
            }
            case "2": {
              const doctor = await readHexKey(rl, "Doctor public key (hex): ");
              const tx = await deployed.callTx.remove_doctor(doctor);
              console.log(chalk.green(`✅ Doctor removed. TX: ${tx.public.txId}\n`));
              break;
            }
            case "3": {
              const verifier = await readHexKey(rl, "Verifier public key (hex): ");
              const tx = await deployed.callTx.add_verifier(verifier);
              console.log(chalk.green(`✅ Verifier added. TX: ${tx.public.txId}\n`));
              break;
            }
            case "4": {
              const verifier = await readHexKey(rl, "Verifier public key (hex): ");
              const tx = await deployed.callTx.remove_verifier(verifier);
              console.log(chalk.green(`✅ Verifier removed. TX: ${tx.public.txId}\n`));
              break;
            }
            case "5": {
              const newAdmin = await readHexKey(rl, "New admin public key (hex): ");
              const tx = await deployed.callTx.transfer_admin(newAdmin);
              console.log(chalk.green(`✅ Admin transferred. TX: ${tx.public.txId}\n`));
              break;
            }
            case "6": {
              const tx = await deployed.callTx.pause();
              console.log(chalk.green(`✅ Contract paused. TX: ${tx.public.txId}\n`));
              break;
            }
            case "7": {
              const tx = await deployed.callTx.unpause();
              console.log(chalk.green(`✅ Contract unpaused. TX: ${tx.public.txId}\n`));
              break;
            }
            case "8": {
              const result = await deployed.callTx.is_paused();
              console.log(chalk.white(`  Paused: ${result.public.returnValue}\n`));
              break;
            }
            case "9": {
              const credentialId = await readBigInt(rl, "Credential ID: ");
              const client = await readHexKey(rl, "Client public key (hex): ");
              const commitment = await readBytes32(rl, "Commitment hash (32-byte hex): ");
              const expiry = await readBigInt(rl, "Expiry (unix timestamp): ");
              const tx = await deployed.callTx.issue_credential(credentialId, client, commitment, expiry);
              console.log(chalk.green(`✅ Credential issued. TX: ${tx.public.txId}\n`));
              break;
            }
            case "10": {
              const credentialId = await readBigInt(rl, "Credential ID: ");
              const client = await readHexKey(rl, "Client public key (hex): ");
              const tx = await deployed.callTx.revoke_credential(credentialId, client);
              console.log(chalk.green(`✅ Credential revoked. TX: ${tx.public.txId}\n`));
              break;
            }
            case "11": {
              const commitment = await readBytes32(rl, "Commitment hash (32-byte hex): ");
              const tx = await deployed.callTx.verify_credential(commitment);
              console.log(chalk.green(`✅ Verification recorded. TX: ${tx.public.txId}\n`));
              break;
            }
            case "12": {
              const doctor = await readHexKey(rl, "Doctor public key (hex): ");
              const credentialId = await readBigInt(rl, "Credential ID: ");
              const tx = await deployed.callTx.grant_consent(doctor, credentialId);
              console.log(chalk.green(`✅ Consent granted. TX: ${tx.public.txId}\n`));
              break;
            }
            case "13": {
              const doctor = await readHexKey(rl, "Doctor public key (hex): ");
              const credentialId = await readBigInt(rl, "Credential ID: ");
              const tx = await deployed.callTx.revoke_consent(doctor, credentialId);
              console.log(chalk.green(`✅ Consent revoked. TX: ${tx.public.txId}\n`));
              break;
            }
            case "14": {
              const doctor = await readHexKey(rl, "Doctor public key (hex): ");
              const result = await deployed.callTx.has_doctor_role(doctor);
              console.log(chalk.white(`  Has doctor role: ${result.public.returnValue}\n`));
              break;
            }
            case "15": {
              const verifier = await readHexKey(rl, "Verifier public key (hex): ");
              const result = await deployed.callTx.has_verifier_role(verifier);
              console.log(chalk.white(`  Has verifier role: ${result.public.returnValue}\n`));
              break;
            }
            case "16": {
              const account = await readHexKey(rl, "Account public key (hex): ");
              const result = await deployed.callTx.has_admin_role(account);
              console.log(chalk.white(`  Has admin role: ${result.public.returnValue}\n`));
              break;
            }
            case "17": {
              console.log(chalk.cyan("\nReading contract state..."));
              const state = await providers.publicDataProvider.queryContractState(
                deployment.contractAddress,
              );
              if (state) {
                const ledgerState = ContractModule.ledger(state.data);
                console.log(chalk.white(`  Total Credentials:   ${ledgerState.total_credentials}`));
                console.log(chalk.white(`  Total Verifications: ${ledgerState.total_verifications}`));
                console.log(chalk.white(`  Active Credentials:  ${ledgerState.active_credentials.size()}`));
                console.log(chalk.white(`  Revoked Credentials: ${ledgerState.revoked_credentials.size()}`));
                console.log(chalk.white(`  Consent Entries:     ${ledgerState.consent_registry.size()}`));
                console.log(chalk.white(`  Verification Log:    ${ledgerState.verification_log.size()}`));
                console.log();
              } else {
                console.log("📋 No state found\n");
              }
              break;
            }
            case "18":
              running = false;
              console.log("\n👋 Goodbye!");
              break;
            default:
              console.log(chalk.red("❌ Invalid choice.\n"));
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`❌ Failed: ${message}\n`));
        }
      }
    } finally {
      await walletContext.wallet.stop();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red("\n❌ Error:"), message);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
