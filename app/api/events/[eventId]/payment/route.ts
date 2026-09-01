import { NextResponse } from "next/server";

export const runtime = "nodejs";

const checkoutOnly = () => NextResponse.json(
  { error: "Los pagos autoservicio se realizan únicamente mediante Mercado Pago." },
  { status: 410 },
);

/** @deprecated Use /api/events/[eventId]/checkout. */
export async function GET() { return checkoutOnly(); }

/** @deprecated Use /api/events/[eventId]/checkout. */
export async function POST() { return checkoutOnly(); }
