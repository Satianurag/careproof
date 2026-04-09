import "dotenv/config.js";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { deployContract } from "@midnight-ntwrk/midnight-js/contracts";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import {
  buildWallet,
  ensureDustReady,
  getWalletSnapshot,
  waitForFunds,
  waitForSync,
} from "./midnight-wallet.js";
import { MidnightProviders, type NetworkConfig } from "./providers/midnight-providers.js";
import { EnvironmentManager } from "./utils/environment.js";

const printFundingInstructions = (networkConfig: NetworkConfig) => {
  const instructions = EnvironmentManager.getFundingInstructions(networkConfig);

  console.log(chalk.magenta.bold("━".repeat(60)));
  console.log(chalk.magenta.bold(`📝 ${instructions.title}`));
  console.log(chalk.magenta.bold("━".repeat(60)));
  console.log();

  instructions.steps.forEach((step, index) => {
    console.log(chalk.white(`   ${index + 1}. `) + chalk.cyan(step));
  });

  console.log();
};

async function main() {
  console.log();
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log(chalk.blue.bold("🏥  CareProof Contract Deployment"));
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log();

  try {
    EnvironmentManager.validateEnvironment();

    const networkConfig = EnvironmentManager.getNetworkConfig();
    const contractName = process.env.CONTRACT_NAME || "careproof";
    const privateStatePassword = EnvironmentManager.getPrivateStatePassword();
    console.log(chalk.gray(`Network: ${networkConfig.name}`));
    console.log();

    if (!EnvironmentManager.checkContractCompiled(contractName)) {
      console.error("❌ Contract not compiled! Run: npm run compile");
      process.exit(1);
    }

    const walletSeed = process.env.WALLET_SEED!;
    console.log(chalk.gray("Building wallet..."));
    const walletContext = await buildWallet(networkConfig, walletSeed);

    try {
      await waitForSync(walletContext.wallet);
      let snapshot = await getWalletSnapshot(walletContext);

      console.log(chalk.cyan.bold("📍 Unshielded Address:"));
      console.log(chalk.white(`   ${snapshot.unshieldedAddress}`));
      console.log(chalk.cyan.bold("📍 Shielded Address:"));
      console.log(chalk.white(`   ${snapshot.shieldedAddress}`));
      console.log(chalk.cyan.bold("\u{1FA99} DUST Address:"));
      console.log(chalk.white(`   ${snapshot.dustAddress}`));
      console.log();

      if (snapshot.unshieldedBalance === 0n) {
        console.log(chalk.red.bold("❌ Wallet needs NIGHT funding before deployment."));
        console.log();
        printFundingInstructions(networkConfig);
        console.log(
          chalk.blue(
            "⏳ Waiting for wallet funding...",
          ),
        );
        await waitForFunds(walletContext.wallet);
        snapshot = await getWalletSnapshot(walletContext);
      }

      if (snapshot.dustBalance === 0n) {
        console.log(chalk.blue("🪙 Registering NIGHT for DUST generation..."));
        await ensureDustReady(walletContext);
        snapshot = await getWalletSnapshot(walletContext);
      }

      console.log(
        chalk.yellow.bold("💰 Unshielded NIGHT: ") +
          chalk.green.bold(snapshot.unshieldedBalance.toLocaleString()),
      );
      console.log(
        chalk.yellow.bold("🪙 DUST Balance: ") +
          chalk.green.bold(snapshot.dustBalance.toLocaleString()),
      );
      console.log();

      console.log(chalk.gray("📦 Loading contract..."));
      const contractPath = path.join(process.cwd(), "contracts");
      const managedContractPath = path.join(contractPath, "managed", contractName);
      const contractModulePath = path.join(managedContractPath, "contract", "index.js");
      const ContractModule = await import(contractModulePath);
      const compiledContract = CompiledContract.make(contractName, ContractModule.Contract as any).pipe(
        CompiledContract.withVacantWitnesses,
        CompiledContract.withCompiledFileAssets(managedContractPath),
      ) as any;

      console.log(chalk.gray("Setting up providers..."));
      const providers = await MidnightProviders.create({
        contractName,
        walletContext,
        networkConfig,
        privateStatePassword,
        privateStateStoreName: "careproof-private-state",
      });

      console.log(chalk.blue("🚀 Deploying contract (30-60 seconds)..."));
      console.log();

      const deployed = await deployContract(providers as any, {
        compiledContract,
      } as any);

      const contractAddress = deployed.deployTxData.public.contractAddress;

      console.log();
      console.log(chalk.green.bold("━".repeat(60)));
      console.log(chalk.green.bold("🎉 CONTRACT DEPLOYED SUCCESSFULLY!"));
      console.log(chalk.green.bold("━".repeat(60)));
      console.log();
      console.log(chalk.cyan.bold("📍 Contract Address:"));
      console.log(chalk.white(`   ${contractAddress}`));
      console.log();

      const info = {
        contractAddress,
        deployedAt: new Date().toISOString(),
        network: networkConfig.key,
        networkName: networkConfig.name,
        contractName,
      };

      fs.writeFileSync("deployment.json", JSON.stringify(info, null, 2));
      console.log(chalk.gray("✅ Saved to deployment.json"));
      console.log();
    } finally {
      await walletContext.wallet.stop();
    }
  } catch (error) {
    console.log();
    console.log(chalk.red.bold("❌ Deployment Failed:"));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
    console.log();
    process.exit(1);
  }
}

main().catch(console.error);
