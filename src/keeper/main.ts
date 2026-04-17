import "dotenv/config";
import { loadConfig } from "./config";
import { KeeperLoop } from "./services/keeper-loop";
import { CoboSolanaSigner } from "../../security/cobo/cobo-solana-signer";
import { CircuitBreaker } from "../../security/circuit-breaker/circuit-breaker";
import { loadSecurityConfig } from "../../security/config/security-config";

async function main() {
  console.log(`[keeper] Starting Ranger Keeper Bot at ${new Date().toISOString()}`);

  const config = loadConfig();
  const securityConfig = loadSecurityConfig();

  console.log(`[keeper] Vault: ${config.vaultPubkey}`);
  console.log(`[keeper] Manager: ${config.managerPubkey}`);
  console.log(`[keeper] Strategies: ${config.strategies.length} configured`);
  console.log(`[keeper] Interval: ${config.intervalMs / 60_000} min`);
  console.log(`[keeper] Drift threshold: ${config.driftThresholdPct}%`);

  const circuitBreaker = new CircuitBreaker(securityConfig);

  const signer = new CoboSolanaSigner(securityConfig.cobo, config.vaultPubkey);
  await signer.initialize();
  console.log("[keeper] Cobo MPC signer initialized");

  const keeper = new KeeperLoop(config, signer, circuitBreaker);

  process.on("SIGINT", async () => {
    console.log("\n[keeper] Received SIGINT, shutting down...");
    await keeper.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("[keeper] Received SIGTERM, shutting down...");
    await keeper.stop();
    process.exit(0);
  });

  await keeper.start();
}

main().catch((err) => {
  console.error(`[keeper] Fatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
