import { NextRequest, NextResponse } from "next/server";

interface CoboCallbackPayload {
  transaction_id: string;
  status: string;
  failure_reason?: string;
  wallet_id: string;
  chain_id: string;
  created_timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = body as CoboCallbackPayload;

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
    console.error(
      "[COBO_CALLBACK] Error processing callback:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
