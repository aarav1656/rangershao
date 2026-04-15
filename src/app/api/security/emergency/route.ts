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
