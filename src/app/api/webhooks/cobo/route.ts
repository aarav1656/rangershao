import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

interface CoboCallbackPayload {
  transaction_id: string;
  status: string;
  failure_reason?: string;
  wallet_id: string;
  chain_id: string;
  created_timestamp: number;
}

function verifyCoboSignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.COBO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[COBO_CALLBACK] COBO_WEBHOOK_SECRET not configured, rejecting request");
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-cobo-signature") || request.headers.get("bizresp_signature") || "";

    if (!signature || !verifyCoboSignature(rawBody, signature, webhookSecret)) {
      console.error("[COBO_CALLBACK] Invalid or missing signature");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = JSON.parse(rawBody) as CoboCallbackPayload;
    const statusPrefix = `[COBO_CALLBACK] Transaction ${payload.transaction_id}`;

    if (payload.status === "Failed" || payload.status === "Rejected") {
      console.error(
        `${statusPrefix}: Status=${payload.status}, Reason=${payload.failure_reason || "N/A"}, Wallet=${payload.wallet_id}, Chain=${payload.chain_id}`
      );
    } else {
      console.log(
        `${statusPrefix}: Status=${payload.status}, Wallet=${payload.wallet_id}, Chain=${payload.chain_id}, Timestamp=${new Date(payload.created_timestamp).toISOString()}`
      );
    }

    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    console.error("[COBO_CALLBACK] Error processing callback:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
