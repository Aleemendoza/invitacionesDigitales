import { NextRequest, NextResponse } from "next/server";
import { badRequest, createGuestSession, getAdminSupabase, hashAccessCode, unavailable, verifyLookupToken } from "@/lib/public-guest-server";
import { enforceSharedRateLimit } from "@/lib/server-rate-limit";

export const runtime = "nodejs";
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: { lookupToken?: unknown; code?: unknown }; try { body = await request.json(); } catch { return badRequest("Solicitud inválida."); }
  if (typeof body.lookupToken !== "string") return badRequest("Elegí una invitación para continuar.");
  const lookup = verifyLookupToken(body.lookupToken); if (!lookup) return NextResponse.json({ error: "La búsqueda venció. Volvé a buscar tu invitación." }, { status: 401 });
  const throttled = await enforceSharedRateLimit(request, "code", `${slug}:${lookup.groupId}`); if (throttled) return throttled;
  try {
    const db = getAdminSupabase();
    const { data: event } = await db.from("events").select("id,guest_access_mode,status,rsvp_enabled").eq("slug", slug).maybeSingle();
    if (!event || event.id !== lookup.eventId || event.status !== "published" || !event.rsvp_enabled) return NextResponse.json({ error: "No encontramos esta invitación." }, { status: 404 });
    const { data: group } = await db.from("guest_groups").select("id,access_code_hash,code_failed_attempts,code_locked_until").eq("id", lookup.groupId).eq("event_id", event.id).maybeSingle();
    if (!group) return NextResponse.json({ error: "La invitación ya no está disponible." }, { status: 404 });
    if (event.guest_access_mode === "name_and_code") {
      if (group.code_locked_until && new Date(group.code_locked_until) > new Date()) return NextResponse.json({ error: "Esperá unos minutos antes de volver a intentar." }, { status: 429 });
      if (typeof body.code !== "string" || !/^[A-Za-z0-9]{4,12}$/.test(body.code) || !group.access_code_hash || hashAccessCode(body.code) !== group.access_code_hash) {
        const attempts = group.code_failed_attempts + 1;
        await db.rpc("record_guest_code_attempt", { p_group_id: group.id, p_success: false });
        return NextResponse.json({ error: attempts >= 5 ? "Esperá unos minutos antes de volver a intentar." : "El código no coincide con esta invitación." }, { status: attempts >= 5 ? 429 : 401 });
      }
      await db.rpc("record_guest_code_attempt", { p_group_id: group.id, p_success: true });
    } else if (event.guest_access_mode !== "name_lookup") return badRequest("Este método de acceso no corresponde al evento.");
    const response = NextResponse.json({ ok: true }); await createGuestSession(response, event.id, group.id); return response;
  } catch (error) { console.error("guest access", error); return unavailable(); }
}
