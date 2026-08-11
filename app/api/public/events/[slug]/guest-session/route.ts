import { NextRequest, NextResponse } from "next/server";
import { GUEST_SESSION_COOKIE, getAdminSupabase, getGuestSession, sha256, unavailable } from "@/lib/public-guest-server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try { const db = getAdminSupabase(); const { data: event } = await db.from("events").select("id").eq("slug", slug).maybeSingle(); if (!event) return NextResponse.json({ group: null }, { status: 404 }); const session = await getGuestSession(event.id); return NextResponse.json({ group: session?.guest_groups ?? null }); } catch { return unavailable(); }
}
export async function DELETE(request: NextRequest) {
  try { const raw = request.cookies.get(GUEST_SESSION_COOKIE)?.value; if (raw) await getAdminSupabase().from("guest_sessions").update({ revoked_at: new Date().toISOString() }).eq("session_token_hash", sha256(raw)); const response = NextResponse.json({ ok: true }); response.cookies.set(GUEST_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 }); return response; } catch { return unavailable(); }
}
