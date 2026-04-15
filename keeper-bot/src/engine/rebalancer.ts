import {
  Connection,
  PublicKey,
  TransactionInstruction,
  AccountMeta,
} from "@solana/web3.js";
import BN from "bn.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { PROTOCOL_CONSTANTS } from "../constants";
import { KeeperBotConfig } from "../config";
import { createLogger } from "../monitoring/logger";
import {
  CurrentAllocation,
  RebalanceDecision,
} from "./types";

const logger = createLogger("info");

// Import SEEDS and LENDING_ADAPTOR_PROGRAM_ID from Voltr SDK
// These are used for deriving strategy PDAs
let SEEDS: any;
let LENDING_ADAPTOR_PROGRAM_ID: PublicKey;

try {
  const voltrSdk = require("@voltr/vault-sdk");
  SEEDS = voltrSdk.SEEDS;
  LENDING_ADAPTOR_PROGRAM_ID = voltrSdk.LENDING_ADAPTOR_PROGRAM_ID;
} catch {
  // Fallback constants if SDK doesn't export them directly
  SEEDS = {
    STRATEGY: Buffer.from("strategy"),
    VAULT: Buffer.from("vault"),
  };
  LENDING_ADAPTOR_PROGRAM_ID = new PublicKey(
    "VLTRbgHhJVkgJSnNjBqzCyBacQjZL6i1Y9mEbNBqug6"
  );
}

export interface RebalancePlan {
  vaultPubkey: PublicKey;
  timestamp: number;
  withdrawals: RebalanceAction[];
  deposits: RebalanceAction[];
  totalDriftPct: number;
  trigger: "drift" | "apy_change" | "manual";
}

export interface RebalanceAction {
  strategyId: string;
  strategyPubkey: PublicKey;
  protocol: string;
  direction: "deposit" | "withdraw";
  amountUsdc: number;
  instructions: TransactionInstruction[];
}

export class RebalanceEngine {
  private connection: Connection;
  private config: KeeperBotConfig;
  private voltrClient: VoltrClient;

  constructor(
    connection: Connection,
    config: KeeperBotConfig,
    voltrClient: VoltrClient
  ) {
    this.connection = connection;
    this.config = config;
    this.voltrClient = voltrClient;
  }

  shouldRebalance(
    currentAllocations: CurrentAllocation[],
    targetWeights: Record<string, number>
  ): RebalanceDecision {
    let totalDrift = 0;
    let maxDrift = 0;

    for (const alloc of currentAllocations) {
      const target = targetWeights[alloc.strategyId] ?? 0;
      const drift = Math.abs(alloc.currentWeight - target) * 100;
      totalDrift += drift;
      maxDrift = Math.max(maxDrift, drift);
    }

    // Check for strategies in target but not in current
    for (const [stratId, targetWeight] of Object.entries(targetWeights)) {
      const exists = currentAllocations.find(
        (a) => a.strategyId === stratId
      );
      if (!exists && targetWeight > 0) {
        totalDrift += targetWeight * 100;
      }
    }

    if (maxDrift > this.config.driftThresholdPct) {
      return {
        should: true,
        trigger: `Max drift ${maxDrift.toFixed(2)}% exceeds threshold ${this.config.driftThresholdPct}%`,
        totalDrift,
      };
    }

    if (totalDrift > this.config.driftThresholdPct * 2) {
      return {
        should: true,
        trigger: `Total drift ${totalDrift.toFixed(2)}% exceeds threshold`,
        totalDrift,
      };
    }

    return {
      should: false,
      trigger: "No rebalance needed",
      totalDrift,
    };
  }

  async computePlan(
    currentAllocations: CurrentAllocation[],
    targetWeights: Record<string, number>,
    totalVaultValue: number
  ): Promise<RebalancePlan> {
    const withdrawals: RebalanceAction[] = [];
    const deposits: RebalanceAction[] = [];

    // Calculate target amounts
    const targetAmounts: Record<string, number> = {};
    for (const [stratId, weight] of Object.entries(targetWeights)) {
      targetAmounts[stratId] = weight * totalVaultValue;
    }

    // Calculate deltas
    const deltas: { strategyId: string; delta: number; protocol: string }[] =
      [];

    for (const alloc of currentAllocations) {
      const targetAmount = targetAmounts[alloc.strategyId] ?? 0;
      const delta = targetAmount - alloc.currentAmountUsdc;
      const strategy = this.config.strategies.find(
        (s) => s.id === alloc.strategyId
      );
      deltas.push({
        strategyId: alloc.strategyId,
        delta,
        protocol: strategy?.protocol ?? alloc.protocol,
      });
    }

    // Add new strategies not in current allocations
    for (const [stratId, targetAmount] of Object.entries(targetAmounts)) {
      const exists = currentAllocations.find(
        (a) => a.strategyId === stratId
      );
      if (!exists && targetAmount > 0) {
        const strategy = this.config.strategies.find(
          (s) => s.id === stratId
        );
        deltas.push({
          strategyId: stratId,
          delta: targetAmount,
          protocol: strategy?.protocol ?? "unknown",
        });
      }
    }

    // Sort: withdrawals first (negative delta), then deposits (positive delta)
    deltas.sort((a, b) => a.delta - b.delta);

    for (const d of deltas) {
      const strategy = this.config.strategies.find(
        (s) => s.id === d.strategyId
      );
      if (!strategy || !strategy.enabled) continue;

      const strategyPubkey = new PublicKey(strategy.pubkey);
      const amountUsdc = Math.abs(d.delta);

      // Skip tiny rebalances (less than $1)
      if (amountUsdc < 1) continue;

      if (d.delta < 0) {
        // Withdrawal
        const instructions = await this.buildWithdrawInstructions(
          strategy,
          amountUsdc,
          strategyPubkey
        );
        withdrawals.push({
          strategyId: d.strategyId,
          strategyPubkey,
          protocol: d.protocol,
          direction: "withdraw",
          amountUsdc,
          instructions,
        });
      } else if (d.delta > 0) {
        // Deposit
        const instructions = await this.buildDepositInstructions(
          strategy,
          amountUsdc,
          strategyPubkey
        );
        deposits.push({
          strategyId: d.strategyId,
          strategyPubkey,
          protocol: d.protocol,
          direction: "deposit",
          amountUsdc,
          instructions,
        });
      }
    }

    const totalDrift = deltas.reduce(
      (s, d) => s + Math.abs(d.delta),
      0
    );
    const totalDriftPct =
      totalVaultValue > 0 ? (totalDrift / totalVaultValue) * 100 : 0;

    return {
      vaultPubkey: this.config.vaultAddress,
      timestamp: Date.now(),
      withdrawals,
      deposits,
      totalDriftPct,
      trigger: "drift",
    };
  }

  private async buildDepositInstructions(
    strategy: { id: string; pubkey: string; protocol: string },
    amountUsdc: number,
    strategyPubkey: PublicKey
  ): Promise<TransactionInstruction[]> {
    const depositAmount = new BN(Math.floor(amountUsdc * 1e6));
    const remainingAccounts = this.buildRemainingAccounts(strategy.protocol);

    // Derive strategy PDA from counterparty token account
    const counterPartyTa = this.getCounterPartyTa(strategy.protocol);
    const [strategyPda] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
      LENDING_ADAPTOR_PROGRAM_ID
    );

    const ix = await this.voltrClient.createDepositStrategyIx(
      {
        depositAmount,
        additionalArgs: Buffer.alloc(0),
      },
      {
        manager: strategyPubkey, // The manager/authority
        vault: this.config.vaultAddress,
        vaultAssetMint: this.config.vaultAssetMint,
        assetTokenProgram: this.config.assetTokenProgram,
        strategy: strategyPda,
        remainingAccounts,
      }
    );

    return [ix];
  }

  private async buildWithdrawInstructions(
    strategy: { id: string; pubkey: string; protocol: string },
    amountUsdc: number,
    strategyPubkey: PublicKey
  ): Promise<TransactionInstruction[]> {
    const withdrawAmount = new BN(Math.floor(amountUsdc * 1e6));
    const remainingAccounts = this.buildRemainingAccounts(strategy.protocol);

    const counterPartyTa = this.getCounterPartyTa(strategy.protocol);
    const [strategyPda] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
      LENDING_ADAPTOR_PROGRAM_ID
    );

    const ix = await this.voltrClient.createWithdrawStrategyIx(
      {
        withdrawAmount,
        additionalArgs: Buffer.alloc(0),
      },
      {
        manager: strategyPubkey,
        vault: this.config.vaultAddress,
        vaultAssetMint: this.config.vaultAssetMint,
        assetTokenProgram: this.config.assetTokenProgram,
        strategy: strategyPda,
        remainingAccounts,
      }
    );

    return [ix];
  }

  private getCounterPartyTa(protocol: string): PublicKey {
    switch (protocol) {
      case "solend":
        return PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.COUNTERPARTY_TA;
      case "marginfi":
        return PROTOCOL_CONSTANTS.MARGINFI.MAIN_MARKET.USDC.BANK;
      case "klend":
        return PROTOCOL_CONSTANTS.KLEND.MAIN_MARKET.USDC.RESERVE;
      case "drift": {
        const [spotMarketVault] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("spot_market_vault"),
            Buffer.from(
              new Uint8Array(
                new Uint16Array([
                  PROTOCOL_CONSTANTS.DRIFT.SPOT.USDC.MARKET_INDEX,
                ]).buffer
              )
            ),
          ],
          PROTOCOL_CONSTANTS.DRIFT.PROGRAM_ID
        );
        return spotMarketVault;
      }
      default:
        throw new Error(`Unknown protocol: ${protocol}`);
    }
  }

  private buildRemainingAccounts(protocol: string): AccountMeta[] {
    switch (protocol) {
      case "solend":
        return this.buildSolendRemainingAccounts();
      case "marginfi":
        return this.buildMarginfiRemainingAccounts();
      case "klend":
        return this.buildKlendRemainingAccounts();
      case "drift":
        return this.buildDriftRemainingAccounts();
      default:
        throw new Error(
          `No remaining accounts builder for protocol: ${protocol}`
        );
    }
  }

  private buildSolendRemainingAccounts(): AccountMeta[] {
    const solend = PROTOCOL_CONSTANTS.SOLEND;
    return [
      {
        pubkey: solend.MAIN_MARKET.USDC.COUNTERPARTY_TA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solend.MAIN_MARKET.USDC.RESERVE,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solend.MAIN_MARKET.LENDING_MARKET,
        isSigner: false,
        isWritable: false,
      },
      // Lending market authority PDA
      {
        pubkey: PublicKey.findProgramAddressSync(
          [solend.MAIN_MARKET.LENDING_MARKET.toBuffer()],
          solend.PROGRAM_ID
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: solend.MAIN_MARKET.USDC.COLLATERAL_MINT,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solend.MAIN_MARKET.USDC.PYTH_ORACLE,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: solend.MAIN_MARKET.USDC.SWITCHBOARD_ORACLE,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: solend.PROGRAM_ID, isSigner: false, isWritable: false },
    ];
  }

  private buildMarginfiRemainingAccounts(): AccountMeta[] {
    const marginfi = PROTOCOL_CONSTANTS.MARGINFI;
    return [
      {
        pubkey: marginfi.MAIN_MARKET.GROUP,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: marginfi.MAIN_MARKET.USDC.BANK,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: marginfi.MAIN_MARKET.USDC.ORACLE,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: marginfi.PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ];
  }

  private buildKlendRemainingAccounts(): AccountMeta[] {
    const klend = PROTOCOL_CONSTANTS.KLEND;
    return [
      {
        pubkey: klend.MAIN_MARKET.LENDING_MARKET,
        isSigner: false,
        isWritable: false,
      },
      // Lending market authority PDA
      {
        pubkey: PublicKey.findProgramAddressSync(
          [
            Buffer.from("lma"),
            klend.MAIN_MARKET.LENDING_MARKET.toBuffer(),
          ],
          klend.PROGRAM_ID
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: klend.MAIN_MARKET.USDC.RESERVE,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: klend.SCOPE_ORACLE,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: klend.PROGRAM_ID, isSigner: false, isWritable: false },
    ];
  }

  private buildDriftRemainingAccounts(): AccountMeta[] {
    const drift = PROTOCOL_CONSTANTS.DRIFT;
    const marketIndex = drift.SPOT.USDC.MARKET_INDEX;

    // Derive spot market PDA
    const [spotMarket] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("spot_market"),
        Buffer.from(
          new Uint8Array(new Uint16Array([marketIndex]).buffer)
        ),
      ],
      drift.PROGRAM_ID
    );

    // Derive spot market vault PDA
    const [spotMarketVault] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("spot_market_vault"),
        Buffer.from(
          new Uint8Array(new Uint16Array([marketIndex]).buffer)
        ),
      ],
      drift.PROGRAM_ID
    );

    return [
      { pubkey: drift.SPOT.STATE, isSigner: false, isWritable: false },
      { pubkey: spotMarket, isSigner: false, isWritable: true },
      { pubkey: spotMarketVault, isSigner: false, isWritable: true },
      {
        pubkey: drift.SPOT.USDC.ORACLE,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: drift.PROGRAM_ID, isSigner: false, isWritable: false },
    ];
  }
}
