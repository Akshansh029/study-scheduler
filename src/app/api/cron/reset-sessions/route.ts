import resetRecurringStatuses from "@/utils/resetRecurringStatuses";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.CRON_SECRET;

async function handle(request: NextRequest) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Starting session status reset…");
  await resetRecurringStatuses();
  console.log("✅ Finished resetting session statuses");

  return NextResponse.json({
    success: true,
    message: "Session statuses reset successfully",
    timestamp: new Date().toISOString(),
  });
}

export const GET = handle;
export const POST = handle;

// (optional) ensure this route is treated as dynamic at build time
export const dynamic = "force-dynamic";
