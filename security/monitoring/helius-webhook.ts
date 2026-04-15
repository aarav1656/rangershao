import { SecurityConfig } from "../config/security-config";
import { CircuitBreaker } from "../circuit-breaker/circuit-breaker";

export interface HeliusWebhookEvent {
  accountData: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: Array<{
      mint: string;
      rawTokenAmount: { tokenAmount: string; decimals: number };
      userAccount: string;
    }>;
  }>;
  description: string;
  events: Record<string, unknown>;
  fee: number;
  feePayer: string;
  nativeTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
  }>;
  type: string;
}

export interface WebhookRegistration {
  webhookId: string;
  webhookUrl: string;
  accountAddresses: string[];
  webhookType: string;
}

export class HeliusWebhookManager {
  private config: SecurityConfig["monitoring"];
  private circuitBreaker: CircuitBreaker;
  private eventHandlers: Array<(event: HeliusWebhookEvent) => void> = [];

  constructor(
    config: SecurityConfig["monitoring"],
    circuitBreaker: CircuitBreaker
  ) {
    this.config = config;
    this.circuitBreaker = circuitBreaker;
  }

  async registerWebhook(
    callbackUrl: string,
    addresses: string[]
  ): Promise<WebhookRegistration> {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks?api-key=${this.config.heliusApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookURL: callbackUrl,
          transactionTypes: ["Any"],
          accountAddresses: addresses,
          webhookType: "enhanced",
          encoding: "jsonParsed",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to register Helius webhook: ${response.status} ${await response.text()}`
      );
    }

    const data = await response.json();
    return {
      webhookId: data.webhookID,
      webhookUrl: callbackUrl,
      accountAddresses: addresses,
      webhookType: "enhanced",
    };
  }

  async listWebhooks(): Promise<WebhookRegistration[]> {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks?api-key=${this.config.heliusApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to list webhooks: ${response.status}`);
    }

    const data = await response.json();
    return data.map((w: any) => ({
      webhookId: w.webhookID,
      webhookUrl: w.webhookURL,
      accountAddresses: w.accountAddresses,
      webhookType: w.webhookType,
    }));
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.config.heliusApiKey}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.status}`);
    }
  }

  onEvent(handler: (event: HeliusWebhookEvent) => void): void {
    this.eventHandlers.push(handler);
  }

  processWebhookPayload(
    payload: HeliusWebhookEvent[],
    signature?: string
  ): void {
    if (this.config.heliusWebhookSecret && signature) {
      if (!this.verifySignature(payload, signature)) {
        throw new Error("Invalid webhook signature");
      }
    }

    for (const event of payload) {
      this.analyzeEvent(event);
      for (const handler of this.eventHandlers) {
        try {
          handler(event);
        } catch {}
      }
    }
  }

  private analyzeEvent(event: HeliusWebhookEvent): void {
    const vaultAddress = this.config.vaultAddress;

    const largeTransfers = event.nativeTransfers?.filter(
      (t) =>
        (t.fromUserAccount === vaultAddress ||
          t.toUserAccount === vaultAddress) &&
        t.amount > 1_000_000_000
    );

    if (largeTransfers && largeTransfers.length > 0) {
      const totalLamports = largeTransfers.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      const solAmount = totalLamports / 1e9;

      if (solAmount > 100) {
        this.circuitBreaker.emergencyPause(
          `Anomalous large transfer detected: ${solAmount} SOL in tx ${event.signature}`
        );
      }
    }

    const unknownSigners = event.nativeTransfers?.filter(
      (t) =>
        t.fromUserAccount === vaultAddress &&
        !this.config.watchAddresses.includes(t.toUserAccount)
    );

    if (unknownSigners && unknownSigners.length > 0) {
      console.warn(
        `[SECURITY] Transfer to unknown address detected in tx ${event.signature}`
      );
    }
  }

  private verifySignature(
    payload: HeliusWebhookEvent[],
    signature: string
  ): boolean {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", this.config.heliusWebhookSecret);
    hmac.update(JSON.stringify(payload));
    const expected = hmac.digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }
}
