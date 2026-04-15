import { NextRequest, NextResponse } from "next/server";
import { loadSecurityConfig } from "../../../../../security/config/security-config";
import { HeliusMonitor } from "../../../../../security/monitoring/helius-monitor";
import { AlertManager } from "../../../../../security/monitoring/alert-manager";

let monitor: HeliusMonitor | null = null;

function getMonitor(): HeliusMonitor {
  if (!monitor) {
    const config = loadSecurityConfig();
    const alertManager = new AlertManager({
      webhookUrl: config.monitoring.alertWebhookUrl,
      enableConsole: true,
    });
    monitor = new HeliusMonitor(
      config.monitoring,
      config.circuitBreaker,
      alertManager
    );
  }
  return monitor;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-helius-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-helius-signature header" },
        { status: 401 }
      );
    }

    const body = await request.text();
    const monitor = getMonitor();

    if (!monitor.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    let events;
    try {
      events = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Payload must be an array of events" },
        { status: 400 }
      );
    }

    for (const event of events) {
      await monitor.handleWebhookEvent(event);
    }

    return NextResponse.json({ received: true, events: events.length });
  } catch (error) {
    console.error("[HELIUS_WEBHOOK] Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
