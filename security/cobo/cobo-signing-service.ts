import { CoboMpcClient } from "./cobo-mpc-client";
import { CircuitBreaker } from "../circuit-breaker/circuit-breaker";
import { RateLimiter } from "../circuit-breaker/rate-limiter";
import { SecurityConfig } from "../config/security-config";
import { randomUUID } from "crypto";

export interface SigningRequest {
  destinationAddress: string;
  tokenId: string;
  amount: string;
  memo?: string;
  reason: string;
}

export interface SigningResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requestId: string;
  timestamp: number;
}

export class CoboSigningService {
  private coboClient: CoboMpcClient;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private config: SecurityConfig;
  private signingLog: SigningResult[] = [];

  constructor(
    config: SecurityConfig,
    coboClient: CoboMpcClient,
    circuitBreaker: CircuitBreaker,
    rateLimiter: RateLimiter
  ) {
    this.config = config;
    this.coboClient = coboClient;
    this.circuitBreaker = circuitBreaker;
    this.rateLimiter = rateLimiter;
  }

  async signAndBroadcast(request: SigningRequest): Promise<SigningResult> {
    const requestId = randomUUID();
    const timestamp = Date.now();

    if (!this.circuitBreaker.isOperational()) {
      const result: SigningResult = {
        success: false,
        error: `Circuit breaker OPEN: ${this.circuitBreaker.getTripReason()}`,
        requestId,
        timestamp,
      };
      this.signingLog.push(result);
      return result;
    }

    if (!this.rateLimiter.tryAcquire("rebalance")) {
      const result: SigningResult = {
        success: false,
        error: "Rate limit exceeded for rebalance operations",
        requestId,
        timestamp,
      };
      this.signingLog.push(result);
      return result;
    }

    try {
      this.circuitBreaker.recordAttempt();

      const txResult = await this.coboClient.createTransferTransaction({
        requestId,
        sourceWalletId: this.config.cobo.walletId,
        tokenId: request.tokenId,
        destinationAddress: request.destinationAddress,
        amount: request.amount,
        memo: request.memo,
      });

      this.circuitBreaker.recordSuccess();

      const result: SigningResult = {
        success: true,
        transactionId: txResult.transactionId,
        requestId,
        timestamp,
      };
      this.signingLog.push(result);
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure(
        error instanceof Error ? error.message : String(error)
      );

      const result: SigningResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        requestId,
        timestamp,
      };
      this.signingLog.push(result);
      return result;
    }
  }

  async pollTransactionStatus(
    transactionId: string,
    timeoutMs: number = 120000,
    intervalMs: number = 5000
  ): Promise<string> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const status = await this.coboClient.getTransactionStatus(transactionId);

      if (
        status === "Completed" ||
        status === "Failed" ||
        status === "Rejected"
      ) {
        return status;
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return "Timeout";
  }

  getSigningLog(limit: number = 50): SigningResult[] {
    return this.signingLog.slice(-limit);
  }

  getStats(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const total = this.signingLog.length;
    const successful = this.signingLog.filter((r) => r.success).length;
    return {
      total,
      successful,
      failed: total - successful,
      successRate: total > 0 ? successful / total : 0,
    };
  }
}
