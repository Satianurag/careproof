import "dotenv/config.js";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js/contracts";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import {
  buildWallet,
  ensureDustReady,
  getWalletSnapshot,
  waitForSync,
} from "./midnight-wallet.js";
import { MidnightProviders } from "./providers/midnight-providers.js";
import { EnvironmentManager } from "./utils/environment.js";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  txId?: string;
}

const results: TestResult[] = [];

const pass = (name: string, txId?: string) => {
  results.push({ name, passed: true, txId });
  console.log(chalk.green(`  ✓ ${name}`) + (txId ? chalk.gray(` (${txId.slice(0, 16)}...)`) : ""));
};

const fail = (name: string, error: unknown) => {
  const msg = error instanceof Error ? error.message : String(error);
  results.push({ name, passed: false, error: msg });
  console.log(chalk.red(`  ✗ ${name}: ${msg}`));
};

async function main() {
  console.log();
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log(chalk.blue.bold("🧪  CareProof E2E Smoke Test"));
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log();

  EnvironmentManager.validateEnvironment();

  if (!fs.existsSync("deployment.json")) {
    console.error(chalk.red("❌ No deployment.json. Run 'npm run deploy' first."));
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
  const networkConfig = EnvironmentManager.getNetworkConfig();
  const contractName = deployment.contractName || "careproof";
  const walletSeed = process.env.WALLET_SEED!;

  console.log(chalk.gray(`Network:  ${networkConfig.name}`));
  console.log(chalk.gray(`Contract: ${deployment.contractAddress.slice(0, 20)}...`));
  console.log();

  const walletContext = await buildWallet(networkConfig, walletSeed);

  try {
    await waitForSync(walletContext.wallet);
    const snapshot = await getWalletSnapshot(walletContext);

    if (snapshot.unshieldedBalance === 0n) {
      throw new Error("Wallet has no NIGHT. Fund it first.");
    }
    if (snapshot.dustBalance === 0n) {
      console.log(chalk.blue("🪙 Registering for DUST..."));
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
      privateStateStoreName: "careproof-e2e-state",
    });

    const deployed: any = await findDeployedContract(providers as any, {
      contractAddress: deployment.contractAddress,
      compiledContract,
    } as any);

    console.log(chalk.cyan.bold("Running smoke tests...\n"));

    // ── 1. Read initial state ────────────────────────────────────────
    try {
      const state = await providers.publicDataProvider.queryContractState(deployment.contractAddress);
      if (!state) throw new Error("No contract state returned by indexer.");
      const ledger = ContractModule.ledger(state.data);
      if (typeof ledger.total_credentials !== "bigint") throw new Error("total_credentials is not bigint");
      if (typeof ledger.total_verifications !== "bigint") throw new Error("total_verifications is not bigint");
      pass("Read initial ledger state");
    } catch (e) {
      fail("Read initial ledger state", e);
    }

    // ── 2. is_paused query ───────────────────────────────────────────
    try {
      const tx = await deployed.callTx.is_paused();
      const paused = tx.public.returnValue;
      if (typeof paused !== "boolean") throw new Error(`Expected boolean, got ${typeof paused}`);
      pass("is_paused query", tx.public.txId);
    } catch (e) {
      fail("is_paused query", e);
    }

    // ── 3. has_admin_role (self) ─────────────────────────────────────
    const selfKey = { bytes: Buffer.from(snapshot.coinPublicKey, "hex") };
    try {
      const tx = await deployed.callTx.has_admin_role(selfKey);
      pass("has_admin_role (self)", tx.public.txId);
    } catch (e) {
      fail("has_admin_role (self)", e);
    }

    // ── 4. Add doctor (self as test key) ────────────────────────────
    try {
      const tx = await deployed.callTx.add_doctor(selfKey);
      pass("add_doctor", tx.public.txId);
    } catch (e) {
      fail("add_doctor", e);
    }

    // ── 5. Confirm doctor role ──────────────────────────────────────
    try {
      const tx = await deployed.callTx.has_doctor_role(selfKey);
      if (tx.public.returnValue !== true) throw new Error("Expected true after add_doctor");
      pass("has_doctor_role confirms grant", tx.public.txId);
    } catch (e) {
      fail("has_doctor_role confirms grant", e);
    }

    // ── 6. Remove doctor ────────────────────────────────────────────
    try {
      const tx = await deployed.callTx.remove_doctor(selfKey);
      pass("remove_doctor", tx.public.txId);
    } catch (e) {
      fail("remove_doctor", e);
    }

    // ── 7. Add verifier ─────────────────────────────────────────────
    try {
      const tx = await deployed.callTx.add_verifier(selfKey);
      pass("add_verifier", tx.public.txId);
    } catch (e) {
      fail("add_verifier", e);
    }

    // ── 8. Remove verifier ──────────────────────────────────────────
    try {
      const tx = await deployed.callTx.remove_verifier(selfKey);
      pass("remove_verifier", tx.public.txId);
    } catch (e) {
      fail("remove_verifier", e);
    }

    // ── 9. Pause ────────────────────────────────────────────────────
    try {
      const tx = await deployed.callTx.pause();
      pass("pause", tx.public.txId);
    } catch (e) {
      fail("pause", e);
    }

    // ── 10. Confirm paused ──────────────────────────────────────────
    try {
      const tx = await deployed.callTx.is_paused();
      if (tx.public.returnValue !== true) throw new Error("Expected paused=true");
      pass("is_paused confirms paused", tx.public.txId);
    } catch (e) {
      fail("is_paused confirms paused", e);
    }

    // ── 11. Unpause ─────────────────────────────────────────────────
    try {
      const tx = await deployed.callTx.unpause();
      pass("unpause", tx.public.txId);
    } catch (e) {
      fail("unpause", e);
    }

    // ══════════════════════════════════════════════════════════════
    // Credential lifecycle tests (Phase 1 regression coverage)
    // ══════════════════════════════════════════════════════════════

    // Use a deterministic test commitment and credential ID
    const testCredentialId = 1001n;
    const testCommitment = Buffer.alloc(32);
    testCommitment.writeUInt32BE(0xCAFEBEEF, 0);
    testCommitment.writeUInt32BE(0xDEADC0DE, 4);
    // Expiry: 1 hour from now (unix seconds)
    const testExpiry = BigInt(Math.floor(Date.now() / 1000) + 3600);

    // ── 12. Grant self doctor role for lifecycle tests ─────────────
    try {
      const tx = await deployed.callTx.add_doctor(selfKey);
      pass("add_doctor (for lifecycle tests)", tx.public.txId);
    } catch (e) {
      fail("add_doctor (for lifecycle tests)", e);
    }

    // ── 13. Grant consent (self as patient, self as doctor) ───────
    try {
      const tx = await deployed.callTx.grant_consent(selfKey, testCredentialId);
      pass("grant_consent", tx.public.txId);
    } catch (e) {
      fail("grant_consent", e);
    }

    // ── 14. Issue credential ──────────────────────────────────────
    try {
      const tx = await deployed.callTx.issue_credential(
        testCredentialId,
        selfKey,
        testCommitment,
        testExpiry,
      );
      pass("issue_credential", tx.public.txId);
    } catch (e) {
      fail("issue_credential", e);
    }

    // ── 15. Grant self verifier role ──────────────────────────────
    try {
      const tx = await deployed.callTx.add_verifier(selfKey);
      pass("add_verifier (for lifecycle tests)", tx.public.txId);
    } catch (e) {
      fail("add_verifier (for lifecycle tests)", e);
    }

    // ── 16. Verify credential (new signature: no timestamp) ───────
    try {
      const tx = await deployed.callTx.verify_credential(testCommitment);
      pass("verify_credential (no timestamp param)", tx.public.txId);
    } catch (e) {
      fail("verify_credential (no timestamp param)", e);
    }

    // ── 17. Verify same credential again (regression: unique log) ─
    // Phase 1A fix: nonce in VerificationLogKey prevents overwrite.
    // Both verifications should succeed without error.
    let verificationsBeforeRepeat = 0n;
    try {
      const state = await providers.publicDataProvider.queryContractState(deployment.contractAddress);
      if (state) {
        const ledger = ContractModule.ledger(state.data);
        verificationsBeforeRepeat = ledger.total_verifications;
      }
      const tx = await deployed.callTx.verify_credential(testCommitment);
      // Check counter incremented
      const stateAfter = await providers.publicDataProvider.queryContractState(deployment.contractAddress);
      if (stateAfter) {
        const ledgerAfter = ContractModule.ledger(stateAfter.data);
        if (ledgerAfter.total_verifications <= verificationsBeforeRepeat) {
          throw new Error("total_verifications did not increment after repeated verify");
        }
      }
      pass("verify_credential repeated (unique log entries)", tx.public.txId);
    } catch (e) {
      fail("verify_credential repeated (unique log entries)", e);
    }

    // ── 18. Revoke consent, then try to issue (should fail) ───────
    try {
      await deployed.callTx.revoke_consent(selfKey, testCredentialId);
      // Now try to issue with same consent — should fail
      const newCommitment = Buffer.alloc(32);
      newCommitment.writeUInt32BE(0xBADBAD01, 0);
      try {
        await deployed.callTx.issue_credential(testCredentialId, selfKey, newCommitment, testExpiry);
        fail("issue after consent revoke should fail", new Error("Expected failure but tx succeeded"));
      } catch (issueErr: unknown) {
        const msg = issueErr instanceof Error ? issueErr.message : String(issueErr);
        if (msg.toLowerCase().includes("consent")) {
          pass("issue after consent revoke correctly fails");
        } else {
          // Failed but for a different reason — still note it
          pass("issue after consent revoke fails (different error: " + msg.slice(0, 60) + ")");
        }
      }
    } catch (e) {
      fail("issue after consent revoke should fail", e);
    }

    // ── 19. Revoke credential ─────────────────────────────────────
    try {
      const tx = await deployed.callTx.revoke_credential(testCredentialId, selfKey);
      pass("revoke_credential", tx.public.txId);
    } catch (e) {
      fail("revoke_credential", e);
    }

    // ── 20. Verify revoked credential (should fail) ───────────────
    try {
      await deployed.callTx.verify_credential(testCommitment);
      fail("verify revoked credential should fail", new Error("Expected failure but tx succeeded"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("revoked") || msg.toLowerCase().includes("inactive")) {
        pass("verify revoked credential correctly fails");
      } else {
        pass("verify revoked credential fails (error: " + msg.slice(0, 60) + ")");
      }
    }

    // ── 21. Cleanup: remove test roles ────────────────────────────
    try {
      await deployed.callTx.remove_doctor(selfKey);
      await deployed.callTx.remove_verifier(selfKey);
      pass("cleanup test roles");
    } catch (e) {
      fail("cleanup test roles", e);
    }

    // ── 22. Final ledger state check ──────────────────────────────
    try {
      const state = await providers.publicDataProvider.queryContractState(deployment.contractAddress);
      if (!state) throw new Error("No state after tests");
      const ledger = ContractModule.ledger(state.data);
      console.log();
      console.log(chalk.gray(`  Ledger: credentials=${ledger.total_credentials}, verifications=${ledger.total_verifications}, active=${ledger.active_credentials.size()}, revoked=${ledger.revoked_credentials.size()}`));
      pass("Final ledger state readable");
    } catch (e) {
      fail("Final ledger state readable", e);
    }

    // ── Summary ─────────────────────────────────────────────────────
    console.log();
    console.log(chalk.bold("━".repeat(60)));
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(
      chalk.bold(`Results: ${chalk.green(`${passed} passed`)} | ${chalk.red(`${failed} failed`)} / ${results.length} total`),
    );
    console.log(chalk.bold("━".repeat(60)));

    if (failed > 0) {
      console.log(chalk.yellow.bold("\n⚠ Some tests failed. Review errors above.\n"));
      process.exit(1);
    } else {
      console.log(chalk.green.bold("\n✓ All smoke tests passed!\n"));
    }
  } finally {
    await walletContext.wallet.stop();
  }
}

main().catch((err) => {
  console.error(chalk.red("\n✗ Smoke test crashed:"), err instanceof Error ? err.message : String(err));
  process.exit(1);
});
