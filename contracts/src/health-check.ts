#!/usr/bin/env node
import "dotenv/config.js";
import { execSync } from "child_process";
import fs from "fs";
import chalk from "chalk";
import { EnvironmentManager } from "./utils/environment.js";

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  message: string;
  error?: string;
}

const checks: HealthCheck[] = [
  {
    name: "Node.js Version",
    message: "Checking Node.js version (>= 22.0.0)...",
    check: async () => {
      const major = parseInt(process.version.slice(1).split(".")[0]);
      return major >= 22;
    },
    error: "Node.js 22 or higher is required. Please upgrade Node.js.",
  },
  {
    name: "Compact Compiler",
    message: "Checking Compact compiler...",
    check: async () => {
      try {
        execSync("compact --version", { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    },
    error: "Compact compiler not found. Install from https://docs.midnight.network",
  },
  {
    name: "Docker",
    message: "Checking Docker availability...",
    check: async () => {
      try {
        execSync("docker --version", { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    },
    error: "Docker is not installed or not running. Install Docker to use the proof server.",
  },
  {
    name: "Environment File",
    message: "Checking .env configuration...",
    check: async () => fs.existsSync(".env"),
    error: ".env file not found. Copy .env.example to .env and set WALLET_SEED.",
  },
  {
    name: "Wallet Seed",
    message: "Checking wallet configuration...",
    check: async () => {
      if (!fs.existsSync(".env")) return false;
      const envContent = fs.readFileSync(".env", "utf-8");
      return envContent.includes("WALLET_SEED=") &&
        !envContent.includes("WALLET_SEED=your_");
    },
    error: "WALLET_SEED not configured in .env. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  },
  {
    name: "Dependencies",
    message: "Checking node_modules...",
    check: async () => fs.existsSync("node_modules"),
    error: "Dependencies not installed. Run 'npm install' first.",
  },
  {
    name: "Contract Compilation",
    message: "Checking compiled contracts...",
    check: async () => {
      return (
        fs.existsSync("contracts/managed/careproof/contract/index.js") &&
        fs.existsSync("contracts/managed/careproof/keys")
      );
    },
    error: "Contract not compiled or keys missing. Run 'npm run compile' first.",
  },
  {
    name: "TypeScript Build",
    message: "Checking TypeScript build...",
    check: async () => fs.existsSync("dist"),
    error: "Project not built. Run 'npm run build'.",
  },
  {
    name: "Deployment File",
    message: "Checking deployment.json...",
    check: async () => {
      if (!fs.existsSync("deployment.json")) return false;
      const d = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
      return typeof d.contractAddress === "string" && d.contractAddress.length > 0;
    },
    error: "No valid deployment.json. Run 'npm run deploy' to deploy the contract.",
  },
  {
    name: "Network Connectivity",
    message: "Checking indexer connectivity...",
    check: async () => {
      try {
        const config = EnvironmentManager.getNetworkConfig();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(config.indexer, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "{ __typename }" }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return res.ok || res.status === 400;
      } catch {
        return false;
      }
    },
    error: "Cannot reach the indexer. Check MIDNIGHT_NETWORK / INDEXER_URL and your internet connection.",
  },
  {
    name: "Node RPC Connectivity",
    message: "Checking node RPC connectivity...",
    check: async () => {
      try {
        const config = EnvironmentManager.getNetworkConfig();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(config.node, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "system_health", params: [] }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return res.ok;
      } catch {
        return false;
      }
    },
    error: "Cannot reach the node RPC endpoint. Check NODE_URL.",
  },
];

async function runHealthCheck() {
  console.log(chalk.blue.bold("\n🏥 CareProof Health Check\n"));

  const networkConfig = (() => {
    try {
      return EnvironmentManager.getNetworkConfig();
    } catch {
      return null;
    }
  })();
  if (networkConfig) {
    console.log(chalk.gray(`Network: ${networkConfig.name} (${networkConfig.key})`));
    console.log(chalk.gray(`Indexer: ${networkConfig.indexer}`));
    console.log(chalk.gray(`Node:    ${networkConfig.node}`));
    console.log();
  }

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    process.stdout.write(chalk.gray(`⏳ ${check.message} `));

    try {
      const result = await check.check();

      if (result) {
        console.log(chalk.green("✓ Passed"));
        passed++;
      } else {
        console.log(chalk.red("✗ Failed"));
        if (check.error) {
          console.log(chalk.yellow(`   ${check.error}`));
        }
        failed++;
      }
    } catch {
      console.log(chalk.red("✗ Error"));
      console.log(chalk.yellow(`   ${check.error || "Unknown error"}`));
      failed++;
    }
  }

  console.log();
  console.log(chalk.bold("━".repeat(60)));
  console.log(
    chalk.bold(
      `Results: ${chalk.green(`${passed} passed`)} | ${chalk.red(`${failed} failed`)} / ${checks.length} total`,
    ),
  );
  console.log(chalk.bold("━".repeat(60)));

  if (failed === 0) {
    console.log(chalk.green.bold("\n✓ All checks passed! Your environment is ready.\n"));
    process.exit(0);
  } else {
    console.log(
      chalk.yellow.bold(
        "\n⚠ Some checks failed. Please fix the issues above before continuing.\n",
      ),
    );
    process.exit(1);
  }
}

runHealthCheck().catch((error) => {
  console.error(chalk.red("\n✗ Health check failed:"), error instanceof Error ? error.message : String(error));
  process.exit(1);
});
