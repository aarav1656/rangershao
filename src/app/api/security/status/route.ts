import { NextResponse } from "next/server";

let orchestrator: any = null;

async function getOrchestrator() {
  if (!orchestrator) {
    const { SecurityOrchestrator } = await import("../../../../../security");
    orchestrator = await SecurityOrchestrator.create();
  }
  return orchestrator;
}

export async function GET() {
  try {
    const orch = await getOrchestrator();
    const status = orch.getSecurityStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get security status",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
