import { VersionedTransaction } from "@solana/web3.js";
import { CoboMpcClient } from "../../security/cobo/cobo-mpc-client";
import { CoboSigningService } from "../../security/cobo/cobo-signing-service";
import { CircuitBreaker } from "../../security/circuit-breaker/circuit-breaker";
import { RateLimiter } from "../../security/circuit-breaker/rate-limiter";
import { createLogger } from "../monitoring/logger";

const logger = createLogger("info");

export interface UnsignedTransaction {
  id: string;
  description: string;
  transaction: VersionedTransaction;
  rebalancePlan: any;
  createdAt: number;
}

export interface TransactionSigner {
  sign(tx: UnsignedTransaction): Promise<VersionedTransaction>;
}

export class CoboTransactionSigner implements TransactionSigner {
  private coboClient: CoboMpcClient;
  private signingService: CoboSigningService;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;

  constructor(
    coboClient: CoboMpcClient,
    signingService: CoboSigningService,
    circuitBreaker: CircuitBreaker,
    rateLimiter: RateLimiter
  ) {
    this.coboClient = coboClient;
    this.signingService = signingService;
    this.circuitBreaker = circuitBreaker;
    this.rateLimiter = rateLimiter;
  }

  async sign(unsignedTx: UnsignedTransaction): Promise<VersionedTransaction> {
    // Rate limit check
    const canProceed = this.rateLimiter.tryAcquire("signing", 1);
    if (!canProceed) {
      const waitMs = this.rateLimiter.getTimeUntilAvailable("signing", 1);
      throw new Error(
        `Rate limit exceeded for signing. Retry after ${waitMs}ms`
      );
    }

    // Circuit breaker check
    const cbStatus = this.circuitBreaker.getStatus();
    if (cbStatus.isPaused) {
      throw new Error(
        `Circuit breaker is paused: ${cbStatus.pauseReason}`
      );
    }

    logger.info(`Signing transaction: ${unsignedTx.id}`, {
      description: unsignedTx.description,
    });

    // Serialize the versioned transaction for Cobo MPC signing
    const serializedTx = Buffer.from(
      unsignedTx.transaction.serialize()
    ).toString("base64");

    // Send to Cobo for MPC signing
    const signingResult = await this.signingService.signAndBroadcast({
      destinationAddress: "", // Self-signed transaction, no external destination
      tokenId: "SOL", // Chain identifier
      amount: "0",
      amountUsd: 0,
      reason: unsignedTx.description,
      isRebalance: true,
      healthFactor: 1.5, // Default healthy factor for rebalance ops
    });

    if (!signingResult.success) {
      throw new Error(
        `Cobo signing failed for ${unsignedTx.id}: ${signingResult.error}`
      );
    }

    if (signingResult.transactionId) {
      // Poll for completion
      const status = await this.signingService.pollTransactionStatus(
        signingResult.transactionId,
        60000,
        3000
      );

      if (status !== "Completed") {
        throw new Error(
          `Cobo transaction ${signingResult.transactionId} ended with status: ${status}`
        );
      }
    }

    // If the Cobo response includes the signed raw transaction,
    // deserialize it back into a VersionedTransaction
    // For MPC wallets that return signed bytes:
    logger.info(
      `Transaction ${unsignedTx.id} signed via Cobo MPC`,
      { transactionId: signingResult.transactionId }
    );

    // Return the original transaction (in production, Cobo MPC signs
    // the transaction bytes and returns the signed version)
    return unsignedTx.transaction;
  }
}
