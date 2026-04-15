import { createHmac, timingSafeEqual } from "crypto";
import {
  AlertManager,
  AlertSeverity,
  AlertType,
} from "./alert-manager";
import { SecurityConfig } from "../config/security-config";

export interface HeliusWebhookEvent {
  type: string;
  timestamp: number;
  signature: string;
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: any[];
  }>;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
  description?: string;
}

export class HeliusMonitor {
  private config: SecurityConfig["monitoring"];
  private circuitBreakerConfig: SecurityConfig["circuitBreaker"];
  private alertManager: AlertManager;
  private healthCheckIntervalHandle: ReturnType<typeof setInterval> | null =
    null;

  constructor(
    config: SecurityConfig["monitoring"],
    circuitBreakerConfig: SecurityConfig["circuitBreaker"],
    alertManager: AlertManager
  ) {
    this.config = config;
    this.circuitBreakerConfig = circuitBreakerConfig;
    this.alertManager = alertManager;
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const secret = this.config.heliusWebhookSecret;
      if (!secret) {
        return false;
      }

      const hmac = createHmac("sha256", secret);
      hmac.update(body);
      const computed = hmac.digest("hex");

      return timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
    } catch (error) {
      return false;
    }
  }

  async handleWebhookEvent(event: HeliusWebhookEvent): Promise<void> {
    const vaultAddress = this.config.vaultAddress.toLowerCase();
    const watchAddresses = this.config.watchAddresses.map((addr) =>
      addr.toLowerCase()
    );

    let largeWithdrawalDetected = false;
    let anomalousTransactionDetected = false;

    if (event.nativeTransfers && event.nativeTransfers.length > 0) {
      for (const transfer of event.nativeTransfers) {
        const fromAddr = transfer.fromUserAccount.toLowerCase();
        const toAddr = transfer.toUserAccount.toLowerCase();
        const solAmount = transfer.amount / 1e9;

        if (
          fromAddr === vaultAddress ||
          watchAddresses.includes(fromAddr)
        ) {
          if (solAmount > 1000) {
            await this.alertManager.sendAlert({
              type: AlertType.LARGE_WITHDRAWAL,
              severity: AlertSeverity.WARNING,
              title: "Large Withdrawal Detected",
              message: `Large SOL transfer detected: ${solAmount.toFixed(2)} SOL from ${fromAddr.slice(0, 8)}... to ${toAddr.slice(0, 8)}...`,
              data: {
                from: transfer.fromUserAccount,
                to: transfer.toUserAccount,
                amount: solAmount,
                amountLamports: transfer.amount,
              },
            });
            largeWithdrawalDetected = true;
          }

          if (!watchAddresses.includes(toAddr) && toAddr !== vaultAddress) {
            await this.alertManager.sendAlert({
              type: AlertType.ANOMALOUS_TX,
              severity: AlertSeverity.CRITICAL,
              title: "Anomalous Transaction Detected",
              message: `Transfer to unknown address detected: ${fromAddr.slice(0, 8)}... -> ${toAddr.slice(0, 8)}... (${solAmount} SOL)`,
              data: {
                from: transfer.fromUserAccount,
                to: transfer.toUserAccount,
                amount: solAmount,
                amountLamports: transfer.amount,
              },
            });
            anomalousTransactionDetected = true;
          }
        }
      }
    }

    if (event.tokenTransfers && event.tokenTransfers.length > 0) {
      for (const transfer of event.tokenTransfers) {
        const fromAddr = transfer.fromUserAccount.toLowerCase();
        const toAddr = transfer.toUserAccount.toLowerCase();

        const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v".toLowerCase();
        const isUsdc = transfer.mint.toLowerCase() === usdcMint;

        if (isUsdc) {
          const usdcAmount = transfer.tokenAmount / 1e6;
          const estimatedUsdValue = usdcAmount;

          if (estimatedUsdValue > 10000) {
            if (
              fromAddr === vaultAddress ||
              watchAddresses.includes(fromAddr)
            ) {
              await this.alertManager.sendAlert({
                type: AlertType.LARGE_WITHDRAWAL,
                severity: AlertSeverity.WARNING,
                title: "Large USDC Withdrawal",
                message: `Large USDC transfer detected: $${estimatedUsdValue.toFixed(2)} from vault`,
                data: {
                  from: transfer.fromUserAccount,
                  to: transfer.toUserAccount,
                  usdcAmount,
                  estimatedUsdValue,
                  mint: transfer.mint,
                },
              });
              largeWithdrawalDetected = true;
            }
          }
        }

        if (
          (fromAddr === vaultAddress ||
            watchAddresses.includes(fromAddr)) &&
          !watchAddresses.includes(toAddr) &&
          toAddr !== vaultAddress
        ) {
          await this.alertManager.sendAlert({
            type: AlertType.ANOMALOUS_TX,
            severity: AlertSeverity.CRITICAL,
            title: "Anomalous Token Transfer",
            message: `Token transfer to unknown address: ${transfer.mint.slice(0, 8)}... (${transfer.tokenAmount} units)`,
            data: {
              from: transfer.fromUserAccount,
              to: transfer.toUserAccount,
              mint: transfer.mint,
              amount: transfer.tokenAmount,
            },
          });
          anomalousTransactionDetected = true;
        }
      }
    }
  }

  async checkHealthFactor(currentHealthFactor: number): Promise<void> {
    const minimumThreshold = this.circuitBreakerConfig.healthFactorMinimum;
    const emergencyThreshold = this.circuitBreakerConfig.healthFactorEmergency;

    if (currentHealthFactor <= emergencyThreshold) {
      await this.alertManager.sendAlert({
        type: AlertType.HEALTH_CRITICAL,
        severity: AlertSeverity.EMERGENCY,
        title: "EMERGENCY: Health Factor Critical",
        message: `Health factor ${currentHealthFactor.toFixed(4)} has reached emergency threshold of ${emergencyThreshold}. Emergency pause triggered.`,
        data: {
          currentHealthFactor,
          emergencyThreshold,
        },
      });
    } else if (currentHealthFactor <= minimumThreshold) {
      await this.alertManager.sendAlert({
        type: AlertType.HEALTH_WARNING,
        severity: AlertSeverity.CRITICAL,
        title: "Health Factor Critical",
        message: `Health factor ${currentHealthFactor.toFixed(4)} has fallen below minimum threshold of ${minimumThreshold}`,
        data: {
          currentHealthFactor,
          minimumThreshold,
        },
      });
    }
  }

  startHealthMonitoring(
    getHealthFactor: () => Promise<number>
  ): void {
    if (this.healthCheckIntervalHandle) {
      return;
    }

    this.healthCheckIntervalHandle = setInterval(async () => {
      try {
        const healthFactor = await getHealthFactor();
        await this.checkHealthFactor(healthFactor);
      } catch (error) {
        await this.alertManager.sendAlert({
          type: AlertType.HEALTH_WARNING,
          severity: AlertSeverity.WARNING,
          title: "Health Factor Check Failed",
          message: `Failed to retrieve health factor: ${error instanceof Error ? error.message : String(error)}`,
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }, this.config.healthCheckIntervalMs);
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckIntervalHandle) {
      clearInterval(this.healthCheckIntervalHandle);
      this.healthCheckIntervalHandle = null;
    }
  }
}
