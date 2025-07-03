import { resetRecurringStatuses } from "@/utils/resetRecurringStatus";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting session status reset...");
    await resetRecurringStatuses();

    return NextResponse.json({
      success: true,
      message: "Session statuses reset successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resetting session statuses:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
