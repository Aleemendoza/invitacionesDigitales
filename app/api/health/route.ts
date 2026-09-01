import { NextResponse } from "next/server";
import { healthPayload } from "@/lib/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    healthPayload(),
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
