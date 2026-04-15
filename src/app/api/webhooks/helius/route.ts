import { NextRequest, NextResponse } from "next/server";

let webhookManager: any = null;

async function getWebhookManager() {
  if (!webhookManager) {
    const { SecurityOrchestrator } = await import("../../../../../security");
    const orchestrator = await SecurityOrchestrator.create();
    webhookManager = orchestrator.webhookManager;
  }
  return webhookManager;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-helius-signature") || undefined;
    const payload = await request.json();

    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Invalid payload format" },
        { status: 400 }
      );
    }

    const manager = await getWebhookManager();
    manager.processWebhookPayload(payload, signature);

    return NextResponse.json({ received: true, events: payload.length });
  } catch (error) {
    console.error("[WEBHOOK] Error processing Helius webhook:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid webhook signature"
    ) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
