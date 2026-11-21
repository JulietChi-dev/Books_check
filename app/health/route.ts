import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Uptime check endpoint (PRD 8.10 operations row)
 * Responds with HTTP 200 and JSON status payload.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
