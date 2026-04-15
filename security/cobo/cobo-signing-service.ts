import { CoboMpcClient } from "./cobo-mpc-client";
import { CircuitBreaker } from "../circuit-breaker/circuit-breaker";
import { SecurityConfig } from "../config/security-config";
import { randomUUID } from "crypto";

export interface SigningRequest {
  destinationAddress: string;
  tokenId: string;
  amount: string;
  amountUsd: number;
  memo?: string;
  reason: string;
  isRebalance: boolean;
  healthFactor: number;
}

export interface SigningResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  warnings?: string[];
  requestId: string;
  timestamp: number;
}

export class CoboSigningService {
  private coboClient: CoboMpcClient;
  private circuitBreaker: CircuitBreaker;
  private config: SecurityConfig;
  private signingLog: SigningResult[] = [];

  constructor(
    config: SecurityConfig,
    coboClient: CoboMpcClient,
    circuitBreaker: CircuitBreaker
  ) {
    this.config = config;
    this.coboClient = coboClient;
    this.circuitBreaker = circuitBreaker;
  }

  async signAndBroadcast(request: SigningRequest): Promise<SigningResult> {
    const requestId = randomUUID();
    const timestamp = Date.now();

    const check = this.circuitBreaker.checkCanExecute({
      amountUsd: request.amountUsd,
      healthFactor: request.healthFactor,
      isRebalance: request.isRebalance,
    });

    if (!check.allowed) {
      const result: SigningResult = {
        success: false,
        error: check.reason,
        warnings: check.warnings,
        requestId,
        timestamp,
      };
      this.signingLog.push(result);
      return result;
    }

    try {
      const txResult = await this.coboClient.createTransferTransaction({
        requestId,
        sourceWalletId: this.config.cobo.walletId,
        tokenId: request.tokenId,
        destinationAddress: request.destinationAddress,
        amount: request.amount,
        memo: request.memo,
      });

      this.circuitBreaker.recordTransaction(request.amountUsd, request.isRebalance);

      const result: SigningResult = {
        success: true,
        transactionId: txResult.transactionId,
        warnings: check.warnings.length > 0 ? check.warnings : undefined,
        requestId,
        timestamp,
      };
      this.signingLog.push(result);
      return result;
    } catch (error) {
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
