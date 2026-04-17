import { NextRequest, NextResponse } from "next/server";

let orchestrator: any = null;

async function getOrchestrator() {
  if (!orchestrator) {
    const { SecurityOrchestrator } = await import("../../../../../security");
    orchestrator = await SecurityOrchestrator.create();
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {
    const { action, reason } = await request.json();
    const authToken = process.env.EMERGENCY_AUTH_TOKEN;

    if (!authToken) {
      return NextResponse.json(
        { error: "Emergency endpoint is not configured" },
        { status: 503 }
      );
    }

    const authorization = request.headers.get("authorization");
    const expectedAuthorization = `Bearer ${authToken}`;

    if (authorization !== expectedAuthorization) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orch = await getOrchestrator();

    if (action === "pause") {
      orch.emergencyPause(reason || "Manual emergency pause");
      return NextResponse.json({
        success: true,
        action: "paused",
        status: orch.getSecurityStatus(),
      });
    }

    if (action === "resume") {
      orch.resumeOperations();
      return NextResponse.json({
        success: true,
        action: "resumed",
        status: orch.getSecurityStatus(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "pause" or "resume".' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Emergency action failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
