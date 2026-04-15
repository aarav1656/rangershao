import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";
import { Connection, PublicKey } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

import { loadConfig, KeeperBotConfig } from "./config";
import { ProtocolDataFetcher } from "./data/fetcher";
import { MLClient } from "./ml/client";
import { FallbackAllocator } from "./ml/fallback";
import { RebalanceEngine, RebalancePlan } from "./engine/rebalancer";
import { CurrentAllocation } from "./engine/types";
import {
  CoboTransactionSigner,
  TransactionSigner,
} from "./signing/cobo-adapter";
import { createLogger } from "./monitoring/logger";
import { createConnection } from "./utils/solana";

// Import from parent project
import { CoboMpcClient } from "../../security/cobo/cobo-mpc-client";
import { CoboSigningService } from "../../security/cobo/cobo-signing-service";
import { CircuitBreaker } from "../../security/circuit-breaker/circuit-breaker";
import { RateLimiter } from "../../security/circuit-breaker/rate-limiter";
import { loadSecurityConfig } from "../../security/config/security-config";
import { TransactionExecutor } from "../../src/keeper/services/executor";
import { TransactionBuilder } from "../../src/keeper/services/transaction-builder";

const logger = createLogger("info");

let isShuttingDown = false;

async function main() {
  logger.info("Ranger Keeper Bot starting...");

  // Load configuration
  const config = loadConfig();
  logger.info("Configuration loaded", {
    vault: config.vaultAddress.toBase58(),
    strategies: config.strategies.length,
    intervalMs: config.keeperIntervalMs,
  });

  // Initialize Solana connection
  const connection = createConnection(config.heliusRpcUrl);
  logger.info("Solana connection established", {
    rpcUrl: config.heliusRpcUrl.replace(/api-key=.*/, "api-key=***"),
  });

  // Initialize Voltr client
  // VoltrClient requires an AnchorProvider
  const dummyWallet = {
    publicKey: config.vaultAddress,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any) => txs,
  } as unknown as Wallet;

  const provider = new AnchorProvider(connection, dummyWallet, {
    commitment: "confirmed",
  });
  const voltrClient = new VoltrClient(provider);
  logger.info("Voltr client initialized");

  // Initialize data fetcher
  const dataFetcher = new ProtocolDataFetcher(
    connection,
    config.heliusApiKey
  );

  // Initialize ML client and fallback allocator
  const mlClient = new MLClient(config.mlModelUrl);
  const fallbackAllocator = new FallbackAllocator();

  // Initialize rebalance engine
  const rebalanceEngine = new RebalanceEngine(
    connection,
    config,
    voltrClient
  );

  // Initialize Cobo security stack
  const securityConfig = loadSecurityConfig();
  const coboClient = new CoboMpcClient(securityConfig.cobo);
  await coboClient.initialize();
  logger.info("Cobo MPC client initialized");

  const circuitBreaker = new CircuitBreaker(securityConfig);
  const rateLimiter = new RateLimiter();
  rateLimiter.addBucket("signing", 10, 60000); // 10 signs per minute
  rateLimiter.addBucket("rebalance", 2, 1800000); // 2 rebalances per 30 min

  const signingService = new CoboSigningService(
    securityConfig,
    coboClient,
    circuitBreaker
  );

  // Initialize transaction signer
  const signer: TransactionSigner = new CoboTransactionSigner(
    coboClient,
    signingService,
    circuitBreaker,
    rateLimiter
  );

  // Initialize transaction executor and builder
  const executor = new TransactionExecutor(connection, signer as any);
  const txBuilder = new TransactionBuilder(connection, {
    vaultPubkey: config.vaultAddress.toBase58(),
    heliusRpcUrl: config.heliusRpcUrl,
    heliusApiKey: config.heliusApiKey,
    intervalMs: config.keeperIntervalMs,
    driftThresholdPct: config.driftThresholdPct,
    apyChangeThresholdPct: config.apyChangeThresholdPct,
    maxSlippageBps: config.maxSlippageBps,
    strategies: config.strategies.map((s) => ({
      ...s,
      protocol: s.protocol as any,
    })),
  });

  // Define the keeper cycle
  async function runKeeperCycle(): Promise<void> {
    if (isShuttingDown) {
      logger.info("Shutdown in progress, skipping keeper cycle");
      return;
    }

    const cycleStart = Date.now();
    logger.info("=== Keeper cycle started ===");

    try {
      // Step 1: Fetch protocol data
      logger.info("Fetching protocol metrics...");
      const fetchResult = await dataFetcher.fetchAll();

      if (fetchResult.errors.length > 0) {
        logger.warn("Some protocol fetches failed", {
          errors: fetchResult.errors,
        });
      }

      if (fetchResult.metrics.length === 0) {
        logger.error("No protocol metrics available, skipping cycle");
        return;
      }

      logger.info("Protocol metrics fetched", {
        protocols: fetchResult.metrics.map((m) => ({
          protocol: m.protocol,
          apy: m.apy.toFixed(2),
          tvl: m.tvl.toFixed(0),
          utilization: m.utilizationRate.toFixed(1),
        })),
      });

      // Step 2: Get optimal weights (try ML, fallback to greedy)
      let weights;
      try {
        weights = await mlClient.getOptimalWeights(fetchResult.metrics);
        logger.info("ML model weights obtained", {
          source: weights.source,
          confidence: weights.confidence,
        });
      } catch (mlError) {
        logger.info("ML model unavailable, using fallback allocator", {
          reason: String(mlError),
        });

        const regime = fallbackAllocator.detectRegime(fetchResult.metrics);
        weights = fallbackAllocator.calculateWeights(
          fetchResult.metrics,
          regime
        );
        logger.info("Fallback allocator weights computed", {
          regime,
          source: weights.source,
          confidence: weights.confidence,
          weights: weights.weights,
        });
      }

      // Step 3: Get current allocations from on-chain vault state
      const currentAllocations = await getCurrentAllocations(
        connection,
        config,
        voltrClient
      );

      logger.info("Current allocations fetched", {
        allocations: currentAllocations.map((a) => ({
          strategy: a.strategyId,
          weight: (a.currentWeight * 100).toFixed(1) + "%",
          amount: a.currentAmountUsdc.toFixed(2),
        })),
      });

      // Step 4: Check if rebalance is needed
      const decision = rebalanceEngine.shouldRebalance(
        currentAllocations,
        weights.weights
      );

      if (!decision.should) {
        logger.info("No rebalance needed", {
          totalDrift: decision.totalDrift.toFixed(2),
          trigger: decision.trigger,
        });
        return;
      }

      logger.info("Rebalance triggered", {
        trigger: decision.trigger,
        totalDrift: decision.totalDrift.toFixed(2),
      });

      // Step 5: Compute rebalance plan
      const totalVaultValue = currentAllocations.reduce(
        (sum, a) => sum + a.currentAmountUsdc,
        0
      );

      const plan = await rebalanceEngine.computePlan(
        currentAllocations,
        weights.weights,
        totalVaultValue
      );

      logger.info("Rebalance plan computed", {
        withdrawals: plan.withdrawals.length,
        deposits: plan.deposits.length,
        totalDriftPct: plan.totalDriftPct.toFixed(2),
      });

      // Step 6: Build transactions
      const feePayer = config.vaultAddress; // The vault or manager is the fee payer
      const unsignedTxs = await txBuilder.buildRebalanceTransactions(
        plan as any,
        feePayer
      );

      logger.info(`Built ${unsignedTxs.length} transactions for rebalance`);

      // Step 7: Execute via TransactionExecutor
      const execResult = await executor.executeRebalancePlan(unsignedTxs);

      logger.info("Rebalance execution completed", {
        successCount: execResult.successCount,
        failureCount: execResult.failureCount,
        results: execResult.results.map((r) => ({
          id: r.id,
          confirmed: r.confirmed,
          signature: r.signature,
          error: r.error,
        })),
      });
    } catch (error) {
      logger.error("Keeper cycle failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      const duration = Date.now() - cycleStart;
      logger.info(`=== Keeper cycle completed in ${duration}ms ===`);
    }
  }

  // Run first cycle immediately
  logger.info("Running initial keeper cycle...");
  await runKeeperCycle();

  // Schedule recurring cycles with node-cron (every 30 minutes)
  const cronSchedule = "*/30 * * * *";
  const task = cron.schedule(cronSchedule, async () => {
    await runKeeperCycle();
  });

  logger.info(`Keeper bot scheduled: ${cronSchedule}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}, shutting down gracefully...`);
    task.stop();

    // Allow current cycle to finish (wait up to 30s)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    logger.info("Keeper bot stopped");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

async function getCurrentAllocations(
  connection: Connection,
  config: KeeperBotConfig,
  voltrClient: VoltrClient
): Promise<CurrentAllocation[]> {
  const allocations: CurrentAllocation[] = [];

  // Fetch vault state to get total value and per-strategy balances
  try {
    const vaultAccount = await connection.getAccountInfo(
      config.vaultAddress
    );
    if (!vaultAccount) {
      logger.warn("Vault account not found, returning empty allocations");
      return allocations;
    }

    // For each configured strategy, fetch its current balance in the vault
    let totalValue = 0;
    const strategyValues: { id: string; protocol: string; value: number }[] =
      [];

    for (const strategy of config.strategies) {
      if (!strategy.enabled) continue;

      try {
        const strategyPubkey = new PublicKey(strategy.pubkey);
        const strategyAccount =
          await connection.getAccountInfo(strategyPubkey);

        if (strategyAccount) {
          // The strategy account data contains the deposited amount
          // Parse based on Voltr strategy account layout
          // For now, read the token balance of the strategy's token account
          const tokenAccounts =
            await connection.getTokenAccountsByOwner(strategyPubkey, {
              mint: config.vaultAssetMint,
            });

          let value = 0;
          for (const ta of tokenAccounts.value) {
            const balance = await connection.getTokenAccountBalance(
              ta.pubkey
            );
            value += Number(balance.value.amount) / 1e6;
          }

          strategyValues.push({
            id: strategy.id,
            protocol: strategy.protocol,
            value,
          });
          totalValue += value;
        }
      } catch (err) {
        logger.warn(
          `Failed to fetch allocation for strategy ${strategy.id}`,
          { error: String(err) }
        );
      }
    }

    // Calculate weights
    for (const sv of strategyValues) {
      allocations.push({
        strategyId: sv.id,
        protocol: sv.protocol,
        currentWeight: totalValue > 0 ? sv.value / totalValue : 0,
        currentAmountUsdc: sv.value,
      });
    }
  } catch (err) {
    logger.error("Failed to fetch current allocations", {
      error: String(err),
    });
  }

  return allocations;
}

main().catch((err) => {
  logger.error("Fatal error in keeper bot", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});
