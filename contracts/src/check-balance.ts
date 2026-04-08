import "dotenv/config.js";
import chalk from "chalk";
import { buildWallet, getWalletSnapshot, waitForSync } from "./midnight-wallet.js";
import { type NetworkConfig } from "./providers/midnight-providers.js";
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

async function checkBalance() {
  try {
    console.log();
    console.log(chalk.blue.bold("━".repeat(60)));
    console.log(chalk.blue.bold("🏥  CareProof Wallet Balance Checker"));
    console.log(chalk.blue.bold("━".repeat(60)));
    console.log();

    const seed = process.env.WALLET_SEED;
    if (!seed) {
      throw new Error("WALLET_SEED not found in .env file");
    }

    console.log(chalk.gray("Building wallet..."));
    console.log();

    const networkConfig = EnvironmentManager.getNetworkConfig();

    console.log(chalk.gray(`Network: ${networkConfig.name}`));
    console.log();

    const walletContext = await buildWallet(networkConfig, seed);

    try {
      await waitForSync(walletContext.wallet);
      const snapshot = await getWalletSnapshot(walletContext);

      console.log(chalk.cyan.bold("📍 Shielded Address:"));
      console.log(chalk.white(`   ${snapshot.shieldedAddress}`));
      console.log(chalk.cyan.bold("📍 Unshielded Address:"));
      console.log(chalk.white(`   ${snapshot.unshieldedAddress}`));
      console.log(chalk.cyan.bold("📍 DUST Address:"));
      console.log(chalk.white(`   ${snapshot.dustAddress}`));
      console.log();

      const nightBalance = snapshot.unshieldedBalance;
      const dustBalance = snapshot.dustBalance;

      console.log(
        chalk.yellow.bold("💰 Unshielded NIGHT: ") +
          (nightBalance > 0n
            ? chalk.green.bold(nightBalance.toLocaleString())
            : chalk.red.bold("0")),
      );
      console.log(
        chalk.yellow.bold("🪙 DUST Balance: ") +
          (dustBalance > 0n
            ? chalk.green.bold(dustBalance.toLocaleString())
            : chalk.red.bold("0")),
      );
      console.log();

      if (nightBalance === 0n) {
        console.log(chalk.red("❌ No NIGHT funds detected."));
        console.log();
        printFundingInstructions(networkConfig);
      } else if (dustBalance === 0n) {
        console.log(chalk.yellow("⏳ Wallet has NIGHT but no spendable DUST yet."));
        console.log(
          chalk.cyan(
            "Run 'npm run deploy' to let the runtime register NIGHT UTXOs for DUST generation and wait for readiness.",
          ),
        );
        console.log();
      } else {
        console.log(chalk.green.bold("✅ Wallet is funded and ready!"));
        console.log();
        console.log(chalk.cyan("   Deploy your contract with:"));
        console.log(chalk.yellow.bold("   npm run deploy"));
        console.log();
      }
    } finally {
      await walletContext.wallet.stop();
    }

    process.exit(0);
  } catch (error) {
    console.log();
    console.log(chalk.red.bold("❌ Error checking balance:"));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
    console.log();
    process.exit(1);
  }
}

checkBalance();
