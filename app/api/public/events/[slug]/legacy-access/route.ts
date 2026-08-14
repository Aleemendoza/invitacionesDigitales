import { NextRequest, NextResponse } from "next/server";
import { createGuestSession, enforceRateLimit, getAdminSupabase, hashAccessCode, sha256, unavailable } from "@/lib/public-guest-server";

/** Compatibility bridge for legacy personal links. It never bypasses the configured access mode. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: { token?: unknown; code?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Link inválido." }, { status: 400 }); }
  if (typeof body.token !== "string" || body.token.length < 20) return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  try {
    const db = getAdminSupabase();
    const { data: event } = await db.from("events").select("id,guest_access_mode,status,rsvp_enabled").eq("slug", slug).maybeSingle();
    if (!event || event.status !== "published" || !event.rsvp_enabled) return NextResponse.json({ error: "Link inválido o vencido." }, { status: 404 });
    const { data: invite } = await db.from("guest_invitation_tokens").select("guest_group_id,expires_at,revoked_at,guest_groups!inner(event_id,access_code_hash,code_failed_attempts,code_locked_until)").eq("token_hash", sha256(body.token)).maybeSingle();
    const group = invite?.guest_groups as unknown as { event_id: string; access_code_hash: string | null; code_failed_attempts: number; code_locked_until: string | null } | undefined;
    if (!invite || !group || group.event_id !== event.id || invite.revoked_at || (invite.expires_at && new Date(invite.expires_at) <= new Date())) return NextResponse.json({ error: "Link inválido o vencido." }, { status: 401 });
    if (event.guest_access_mode === "name_and_code") {
      if (group.code_locked_until && new Date(group.code_locked_until) > new Date()) return NextResponse.json({ error: "Esperá unos minutos antes de volver a intentar.", requiresCode: true }, { status: 429 });
      if (typeof body.code !== "string") return NextResponse.json({ error: "Ingresá el código de acceso.", requiresCode: true }, { status: 401 });
      const throttled = enforceRateLimit(request, "code", `${slug}:${invite.guest_group_id}`); if (throttled) return throttled;
      if (!/^[A-Za-z0-9]{4,12}$/.test(body.code) || !group.access_code_hash || hashAccessCode(body.code) !== group.access_code_hash) {
        const attempts = group.code_failed_attempts + 1;
        await db.from("guest_groups").update({ code_failed_attempts: attempts, code_locked_until: attempts >= 5 ? new Date(Date.now() + 10 * 60_000).toISOString() : null }).eq("id", invite.guest_group_id);
        return NextResponse.json({ error: attempts >= 5 ? "Esperá unos minutos antes de volver a intentar." : "El código no coincide con esta invitación.", requiresCode: true }, { status: attempts >= 5 ? 429 : 401 });
      }
      await db.from("guest_groups").update({ code_failed_attempts: 0, code_locked_until: null }).eq("id", invite.guest_group_id);
    }
    const response = NextResponse.json({ ok: true, canonicalUrl: `/e/${slug}` });
    await createGuestSession(response, event.id, invite.guest_group_id);
    return response;
  } catch (error) { console.error("legacy guest access", error); return unavailable(); }
}
