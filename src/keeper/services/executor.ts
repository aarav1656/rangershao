import { Connection, VersionedTransaction } from "@solana/web3.js";
import {
  UnsignedTransaction,
  TransactionSigner,
  TransactionBroadcaster,
} from "../types";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;
const CONFIRM_TIMEOUT_MS = 60_000;

export class TransactionExecutor implements TransactionBroadcaster {
  private connection: Connection;
  private signer: TransactionSigner;

  constructor(connection: Connection, signer: TransactionSigner) {
    this.connection = connection;
    this.signer = signer;
  }

  async executeWithRetry(unsignedTx: UnsignedTransaction): Promise<{
    signature: string;
    confirmed: boolean;
    attempts: number;
  }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const signedTx = await this.signer.sign(unsignedTx);
        const signature = await this.send(signedTx);
        const confirmed = await this.confirm(signature, CONFIRM_TIMEOUT_MS);

        return { signature, confirmed, attempts: attempt };
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[executor] Attempt ${attempt}/${MAX_RETRIES} failed for ${unsignedTx.id}: ${lastError.message}`
        );

        if (attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Transaction ${unsignedTx.id} failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
    );
  }

  async send(signedTx: VersionedTransaction): Promise<string> {
    const rawTx = signedTx.serialize();
    const signature = await this.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      maxRetries: 2,
      preflightCommitment: "confirmed",
    });

    console.log(`[executor] Sent tx: ${signature}`);
    return signature;
  }

  async confirm(signature: string, timeoutMs: number = CONFIRM_TIMEOUT_MS): Promise<boolean> {
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash("confirmed");

    const result = await this.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    if (result.value.err) {
      throw new Error(
        `Transaction ${signature} confirmed with error: ${JSON.stringify(result.value.err)}`
      );
    }

    console.log(`[executor] Confirmed tx: ${signature}`);
    return true;
  }

  async executeRebalancePlan(txs: UnsignedTransaction[]): Promise<{
    results: Array<{
      id: string;
      signature?: string;
      confirmed: boolean;
      error?: string;
    }>;
    successCount: number;
    failureCount: number;
  }> {
    const results: Array<{
      id: string;
      signature?: string;
      confirmed: boolean;
      error?: string;
    }> = [];

    // Execute withdrawals first (sequentially for safety), then deposits
    const withdrawals = txs.filter((tx) => tx.id.startsWith("withdraw-"));
    const deposits = txs.filter((tx) => tx.id.startsWith("deposit-"));

    for (const tx of [...withdrawals, ...deposits]) {
      try {
        const result = await this.executeWithRetry(tx);
        results.push({
          id: tx.id,
          signature: result.signature,
          confirmed: result.confirmed,
        });
      } catch (error) {
        const err = error as Error;
        console.error(`[executor] Failed ${tx.id}: ${err.message}`);
        results.push({
          id: tx.id,
          confirmed: false,
          error: err.message,
        });

        // If a withdrawal fails, skip corresponding deposits to avoid imbalance
        if (tx.id.startsWith("withdraw-")) {
          console.warn(
            `[executor] Withdrawal failed, skipping remaining deposits for safety`
          );
          break;
        }
      }
    }

    return {
      results,
      successCount: results.filter((r) => r.confirmed).length,
      failureCount: results.filter((r) => !r.confirmed).length,
    };
  }
}
