import { NextRequest, NextResponse } from "next/server";
import { createGuestSession, getAdminSupabase, sha256, unavailable } from "@/lib/public-guest-server";

/**
 * Compatibility bridge for /e/:slug/i/:token. The UI should call this once,
 * then replace the URL with the canonical /e/:slug address.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: { token?: unknown }; try { body = await request.json(); } catch { return NextResponse.json({ error: "Link inválido." }, { status: 400 }); }
  if (typeof body.token !== "string" || body.token.length < 20) return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  try {
    const db = getAdminSupabase();
    const { data: event } = await db.from("events").select("id").eq("slug", slug).maybeSingle();
    if (!event) return NextResponse.json({ error: "Link inválido o vencido." }, { status: 404 });
    const { data: invite } = await db.from("guest_invitation_tokens").select("guest_group_id,expires_at,revoked_at,guest_groups!inner(event_id)").eq("token_hash", sha256(body.token)).maybeSingle();
    const groupEventId = (invite?.guest_groups as unknown as { event_id: string } | null)?.event_id;
    if (!invite || groupEventId !== event.id || invite.revoked_at || (invite.expires_at && new Date(invite.expires_at) <= new Date())) return NextResponse.json({ error: "Link inválido o vencido." }, { status: 401 });
    const response = NextResponse.json({ ok: true, canonicalUrl: `/e/${slug}` }); await createGuestSession(response, event.id, invite.guest_group_id); return response;
  } catch (error) { console.error("legacy guest access", error); return unavailable(); }
}
