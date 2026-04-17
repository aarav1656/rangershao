import { Connection, PublicKey } from "@solana/web3.js";
import {
  KeeperConfig,
  StrategyAllocation,
  TransactionSigner,
  StrategyConfig,
} from "../types";
import { ProtocolDataFetcher } from "./protocol-data-fetcher";
import { AllocationEngine } from "./allocation-engine";
import { RebalanceEngine } from "./rebalance-engine";
import { TransactionBuilder } from "./transaction-builder";
import { TransactionExecutor } from "./executor";
import { CircuitBreaker } from "../../../security/circuit-breaker/circuit-breaker";

export class KeeperLoop {
  private readonly config: KeeperConfig;
  private readonly connection: Connection;
  private readonly signer: TransactionSigner;
  private readonly protocolDataFetcher: ProtocolDataFetcher;
  private readonly allocationEngine: AllocationEngine;
  private readonly rebalanceEngine: RebalanceEngine;
  private readonly transactionBuilder: TransactionBuilder;
  private readonly transactionExecutor: TransactionExecutor;
  private readonly previousApys: Map<string, number>;
  private isRunning: boolean;
  private intervalHandle: ReturnType<typeof setInterval> | null;
  private readonly circuitBreaker: CircuitBreaker | null;

  constructor(config: KeeperConfig, signer: TransactionSigner, circuitBreaker?: CircuitBreaker) {
    this.config = config;
    this.signer = signer;
    this.isRunning = false;
    this.intervalHandle = null;
    this.previousApys = new Map();
    this.circuitBreaker = circuitBreaker ?? null;

    this.connection = new Connection(config.heliusRpcUrl, {
      commitment: "confirmed",
    });

    this.protocolDataFetcher = new ProtocolDataFetcher(config);
    this.allocationEngine = new AllocationEngine(config);
    this.rebalanceEngine = new RebalanceEngine(
      config,
      this.connection,
      new PublicKey(config.managerPubkey)
    );
    this.transactionBuilder = new TransactionBuilder(this.connection, config);
    this.transactionExecutor = new TransactionExecutor(
      this.connection,
      signer
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.log("Keeper loop is already running");
      return;
    }

    this.isRunning = true;
    const intervalMs = this.config.intervalMs || 1_800_000;

    this.log(
      `Starting keeper loop for vault ${this.config.vaultPubkey} with interval ${intervalMs}ms (${intervalMs / 60_000} min)`
    );

    // Run one cycle immediately
    await this.runCycle();

    // Set up recurring interval
    this.intervalHandle = setInterval(() => {
      this.runCycle();
    }, intervalMs);

    this.log("Keeper loop started successfully");
  }

  async stop(): Promise<void> {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    this.isRunning = false;
    this.log("Keeper loop stopped");
  }

  private async runCycle(): Promise<void> {
    const cycleStart = Date.now();
    this.log("Starting rebalance cycle");

    try {
      // Step 1: Fetch protocol data
      this.log("Fetching protocol data...");
      const protocolData = await this.protocolDataFetcher.fetchAll();
      this.log(`Fetched data for ${protocolData.length} protocols`);

      if (protocolData.length === 0) {
        this.log("No protocol data available, skipping cycle");
        return;
      }

      // Step 2: Build current APY map from fetched data
      const currentApys = new Map<string, number>();
      for (const data of protocolData) {
        currentApys.set(data.strategyId, data.apy);
      }

      // Step 3: Get current on-chain allocations
      const currentAllocations = await this.getCurrentAllocations();

      // Step 4: Check if rebalance is needed
      const rebalanceCheck = this.rebalanceEngine.shouldRebalance(
        currentAllocations,
        this.previousApys,
        currentApys
      );

      if (!rebalanceCheck.should) {
        this.log("No rebalance needed, drift within threshold");
        this.updatePreviousApys(currentApys);
        return;
      }

      this.log(
        `Rebalance triggered by ${rebalanceCheck.trigger}`
      );

      // Step 5: Get target allocation weights
      const targetWeights =
        await this.allocationEngine.getWeights(protocolData);
      this.log(
        `Computed target weights (source: ${targetWeights.source}, confidence: ${targetWeights.confidence.toFixed(3)}): ${JSON.stringify(targetWeights.weights)}`
      );

      // Step 6: Compute rebalance plan
      const totalVaultUsdc = await this.getTotalVaultUsdc();
      const plan = await this.rebalanceEngine.computeRebalancePlan(
        currentAllocations,
        targetWeights,
        totalVaultUsdc,
        rebalanceCheck.trigger
      );

      if (!plan) {
        this.log("Rebalance plan is null (drift below threshold after weight computation), skipping");
        this.updatePreviousApys(currentApys);
        return;
      }

      this.log(
        `Rebalance plan: ${plan.withdrawals.length} withdrawals, ${plan.deposits.length} deposits, total drift ${plan.totalDriftPct.toFixed(2)}%`
      );

      // Step 6.5: Circuit breaker gate
      if (this.circuitBreaker) {
        const avgHealthFactor =
          protocolData.reduce((sum, d) => {
            return sum + (d.healthFactor ?? 1.5);
          }, 0) / Math.max(protocolData.length, 1);
        const totalAmountUsd = plan.withdrawals.reduce((sum, w) => sum + w.amountUsdc, 0) +
          plan.deposits.reduce((sum, d) => sum + d.amountUsdc, 0);
        const check = this.circuitBreaker.checkCanExecute({
          amountUsd: totalAmountUsd,
          healthFactor: avgHealthFactor,
          isRebalance: true,
        });

        if (!check.allowed) {
          this.log(`Circuit breaker BLOCKED rebalance: ${check.reason}`);
          if (check.warnings.length > 0) {
            this.log(`Circuit breaker warnings: ${check.warnings.join(', ')}`);
          }
          this.updatePreviousApys(currentApys);
          return;
        }

        if (check.warnings.length > 0) {
          this.log(`Circuit breaker warnings: ${check.warnings.join(', ')}`);
        }
      }

      // Step 7: Build transactions
      const feePayer = new PublicKey(this.config.vaultPubkey);
      const unsignedTxs =
        await this.transactionBuilder.buildRebalanceTransactions(
          plan,
          feePayer
        );
      this.log(`Built ${unsignedTxs.length} transactions`);

      if (unsignedTxs.length === 0) {
        this.log("No transactions to execute");
        this.updatePreviousApys(currentApys);
        return;
      }

      // Step 8: Execute transactions
      this.log("Executing rebalance plan...");
      const executionResult =
        await this.transactionExecutor.executeRebalancePlan(unsignedTxs);

      this.log(
        `Execution complete: ${executionResult.successCount} succeeded, ${executionResult.failureCount} failed`
      );

      for (const result of executionResult.results) {
        if (result.confirmed) {
          this.log(`  OK ${result.id}: ${result.signature}`);
        } else {
          this.logError(`  FAIL ${result.id}: ${result.error}`);
        }
      }

      // Record transaction in circuit breaker
      if (this.circuitBreaker && executionResult.successCount > 0) {
        const totalAmountUsd = plan.withdrawals.reduce((sum, w) => sum + w.amountUsdc, 0) +
          plan.deposits.reduce((sum, d) => sum + d.amountUsdc, 0);
        this.circuitBreaker.recordTransaction(totalAmountUsd, true);
      }

      // Step 9: Update previous APYs
      this.updatePreviousApys(currentApys);

      const elapsed = Date.now() - cycleStart;
      this.log(`Rebalance cycle completed in ${elapsed}ms`);
    } catch (error) {
      const err = error as Error;
      this.logError(`Rebalance cycle failed: ${err.message}`);
      this.logError(err.stack ?? "");
    }
  }

  private async getCurrentAllocations(): Promise<StrategyAllocation[]> {
    const enabledStrategies = this.config.strategies.filter((s) => s.enabled);
    const allocations: StrategyAllocation[] = [];
    let totalBalance = 0;

    // First pass: fetch all balances
    const balances: Array<{ strategy: StrategyConfig; balance: number }> = [];

    for (const strategy of enabledStrategies) {
      try {
        const pubkey = new PublicKey(strategy.pubkey);
        const accountInfo = await this.connection.getAccountInfo(pubkey);

        let balance = 0;
        if (accountInfo) {
          // Try to read as a token account (SPL Token layout: first 32 bytes mint, next 32 owner, then 8 bytes amount at offset 64)
          if (accountInfo.data.length >= 72) {
            const amountBytes = accountInfo.data.subarray(64, 72);
            const rawAmount = new DataView(
              amountBytes.buffer,
              amountBytes.byteOffset,
              8
            ).getBigUint64(0, true);
            // USDC has 6 decimals
            balance = Number(rawAmount) / 1e6;
          } else {
            // Fallback: use lamports converted at a nominal rate
            balance = accountInfo.lamports / 1e9;
          }
        }

        balances.push({ strategy, balance });
        totalBalance += balance;
      } catch (error) {
        const err = error as Error;
        this.logError(
          `Failed to fetch balance for strategy ${strategy.id}: ${err.message}`
        );
        balances.push({ strategy, balance: 0 });
      }
    }

    // Second pass: compute weights from balances
    for (const { strategy, balance } of balances) {
      const currentWeight = totalBalance > 0 ? balance / totalBalance : 0;

      allocations.push({
        strategyId: strategy.id,
        strategyPubkey: new PublicKey(strategy.pubkey),
        protocol: strategy.protocol,
        currentWeight,
        targetWeight: currentWeight, // Will be overwritten by rebalance engine
        currentAmountUsdc: balance,
        targetAmountUsdc: balance, // Will be overwritten by rebalance engine
      });
    }

    return allocations;
  }

  private async getTotalVaultUsdc(): Promise<number> {
    const allocations = await this.getCurrentAllocations();
    return allocations.reduce(
      (sum, alloc) => sum + alloc.currentAmountUsdc,
      0
    );
  }

  private updatePreviousApys(currentApys: Map<string, number>): void {
    this.previousApys.clear();
    for (const [key, value] of currentApys) {
      this.previousApys.set(key, value);
    }
  }

  private log(message: string): void {
    console.log(`[keeper] [${new Date().toISOString()}] ${message}`);
  }

  private logError(message: string): void {
    console.error(`[keeper] [${new Date().toISOString()}] ${message}`);
  }
}
