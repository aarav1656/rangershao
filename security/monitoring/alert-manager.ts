import { randomUUID } from "crypto";

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
  EMERGENCY = "emergency",
}

export enum AlertType {
  HEALTH_WARNING = "health_warning",
  HEALTH_CRITICAL = "health_critical",
  ANOMALOUS_TX = "anomalous_tx",
  CIRCUIT_BREAKER_TRIP = "circuit_breaker_trip",
  EMERGENCY_PAUSE = "emergency_pause",
  LARGE_WITHDRAWAL = "large_withdrawal",
  REBALANCE_FAILED = "rebalance_failed",
  COBO_SIGNING_FAILED = "cobo_signing_failed",
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export class AlertManager {
  private webhookUrl: string;
  private enableConsole: boolean;
  private recentAlerts: Alert[] = [];
  private readonly MAX_ALERTS = 100;

  constructor(options: { webhookUrl?: string; enableConsole?: boolean } = {}) {
    this.webhookUrl = options.webhookUrl || "";
    this.enableConsole = options.enableConsole !== false;
  }

  async sendAlert(alert: Omit<Alert, "id" | "timestamp">): Promise<void> {
    const fullAlert: Alert = {
      ...alert,
      id: randomUUID(),
      timestamp: Date.now(),
    };

    this.recentAlerts.push(fullAlert);
    if (this.recentAlerts.length > this.MAX_ALERTS) {
      this.recentAlerts.shift();
    }

    if (this.enableConsole) {
      const severityEmoji = {
        [AlertSeverity.INFO]: "ℹ️",
        [AlertSeverity.WARNING]: "⚠️",
        [AlertSeverity.CRITICAL]: "🔴",
        [AlertSeverity.EMERGENCY]: "🚨",
      };

      console.log(
        `${severityEmoji[alert.severity]} [${alert.severity.toUpperCase()}] ${alert.title}`
      );
      console.log(`   Type: ${alert.type}`);
      console.log(`   Message: ${alert.message}`);
      if (alert.data) {
        console.log(`   Data:`, alert.data);
      }
    }

    if (this.webhookUrl) {
      this.sendWebhookAsync(fullAlert).catch((error) => {
        if (this.enableConsole) {
          console.error(`Failed to send alert webhook: ${error.message}`);
        }
      });
    }
  }

  private async sendWebhookAsync(alert: Alert): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        console.error(
          `Webhook returned ${response.status}: ${await response.text()}`
        );
      }
    } catch (error) {
      console.error(
        `Webhook request failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  getRecentAlerts(type?: AlertType): Alert[] {
    if (!type) {
      return [...this.recentAlerts];
    }

    return this.recentAlerts.filter((alert) => alert.type === type);
  }

  getAllAlerts(): Alert[] {
    return [...this.recentAlerts];
  }

  clearAlerts(): void {
    this.recentAlerts = [];
  }
}
