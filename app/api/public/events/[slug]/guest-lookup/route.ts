import { NextRequest, NextResponse } from "next/server";
import { badRequest, enforceRateLimit, getAdminSupabase, signLookupToken, unavailable } from "@/lib/public-guest-server";
import { validateLookup } from "@/lib/guest-access";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const throttled = enforceRateLimit(request, "lookup", slug); if (throttled) return throttled;
  let body: { query?: unknown }; try { body = await request.json(); } catch { return badRequest("Ingresá un nombre o apellido."); }
  if (typeof body.query !== "string") return badRequest("Ingresá un nombre o apellido.");
  const query = validateLookup(body.query); if (!query) return badRequest("Usá entre 2 y 80 caracteres para buscar.");
  try {
    const db = getAdminSupabase();
    const { data: event } = await db.from("events").select("id,guest_access_mode,guest_lookup_enabled,rsvp_enabled,status").eq("slug", slug).maybeSingle();
    if (!event || event.status !== "published" || !event.rsvp_enabled) return NextResponse.json({ error: "No encontramos esta invitación." }, { status: 404 });
    if (event.guest_access_mode === "open") return NextResponse.json({ matches: [], accessMode: "open" });
    if (!event.guest_lookup_enabled) return NextResponse.json({ error: "La búsqueda de invitados no está habilitada." }, { status: 403 });
    const { data, error } = await db.from("guest_groups").select("id,display_name,lookup_hint").eq("event_id", event.id).ilike("lookup_name_normalized", `%${query.replace(/[\\%_]/g, "\\$&")}%`).limit(5);
    if (error) throw error;
    return NextResponse.json({ accessMode: event.guest_access_mode, matches: (data ?? []).map((group) => ({ displayName: group.display_name, lookupHint: group.lookup_hint, lookupToken: signLookupToken({ eventId: event.id, groupId: group.id }) })) });
  } catch (error) { console.error("guest lookup", error); return unavailable(); }
}
