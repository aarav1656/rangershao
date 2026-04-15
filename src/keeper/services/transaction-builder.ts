import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  RebalancePlan,
  RebalanceAction,
  UnsignedTransaction,
  KeeperConfig,
} from "../types";

export class TransactionBuilder {
  private connection: Connection;
  private config: KeeperConfig;

  constructor(connection: Connection, config: KeeperConfig) {
    this.connection = connection;
    this.config = config;
  }

  async buildRebalanceTransactions(
    plan: RebalancePlan,
    feePayer: PublicKey
  ): Promise<UnsignedTransaction[]> {
    const txs: UnsignedTransaction[] = [];

    for (const withdrawal of plan.withdrawals) {
      const tx = await this.buildActionTransaction(withdrawal, feePayer);
      txs.push({
        id: `withdraw-${withdrawal.strategyId}-${Date.now()}`,
        description: `Withdraw ${withdrawal.amountUsdc} USDC from ${withdrawal.protocol}:${withdrawal.strategyId}`,
        transaction: tx,
        rebalancePlan: plan,
        createdAt: Date.now(),
      });
    }

    for (const deposit of plan.deposits) {
      const tx = await this.buildActionTransaction(deposit, feePayer);
      txs.push({
        id: `deposit-${deposit.strategyId}-${Date.now()}`,
        description: `Deposit ${deposit.amountUsdc} USDC to ${deposit.protocol}:${deposit.strategyId}`,
        transaction: tx,
        rebalancePlan: plan,
        createdAt: Date.now(),
      });
    }

    return txs;
  }

  private async buildActionTransaction(
    action: RebalanceAction,
    feePayer: PublicKey
  ): Promise<VersionedTransaction> {
    const instructions: TransactionInstruction[] = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
      ...action.instructions,
    ];

    const { blockhash } = await this.connection.getLatestBlockhash("confirmed");

    const lookupTables = await this.fetchRelevantLookupTables(action);

    const messageV0 = new TransactionMessage({
      payerKey: feePayer,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(lookupTables);

    return new VersionedTransaction(messageV0);
  }

  private async fetchRelevantLookupTables(
    action: RebalanceAction
  ): Promise<AddressLookupTableAccount[]> {
    // Voltr and protocol-specific ALTs will be fetched here
    // Each protocol has known ALT addresses for their programs
    const altAddresses = this.getAltAddressesForProtocol(action.protocol);

    const tables: AddressLookupTableAccount[] = [];
    for (const addr of altAddresses) {
      const result = await this.connection.getAddressLookupTable(
        new PublicKey(addr)
      );
      if (result.value) {
        tables.push(result.value);
      }
    }
    return tables;
  }

  private getAltAddressesForProtocol(_protocol: string): string[] {
    // Known ALT addresses per protocol - populated during integration
    return [];
  }

  async simulateTransaction(tx: VersionedTransaction): Promise<{
    success: boolean;
    unitsConsumed?: number;
    error?: string;
  }> {
    const result = await this.connection.simulateTransaction(tx, {
      sigVerify: false,
      replaceRecentBlockhash: true,
    });

    if (result.value.err) {
      return {
        success: false,
        error: JSON.stringify(result.value.err),
      };
    }

    return {
      success: true,
      unitsConsumed: result.value.unitsConsumed ?? undefined,
    };
  }
}
