import { NextRequest, NextResponse } from "next/server";
import { ownerContext } from "@/lib/event-owner";
import { hashAccessCode, secureToken } from "@/lib/public-guest-server";
import { hasPlanFeature, type Plan } from "@/lib/event-drafts";

export const runtime = "nodejs";
export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string; guestId: string }> }) {
  try {
    const { eventId, guestId } = await params;
    const result = await ownerContext(request, eventId); if ("error" in result) return result.error;
    if(!hasPlanFeature(result.event.plan as Plan,"individual-links"))return NextResponse.json({error:"Los enlaces personales requieren el plan Invitación + Invitados."},{status:403});
    if (result.event.payment_status !== "approved") return NextResponse.json({ error: "Publicá la invitación para habilitar los enlaces." }, { status: 403 });
    const { data: guest } = await result.db.from("guest_groups").select("id").eq("id", guestId).eq("event_id", eventId).maybeSingle();
    if (!guest) return NextResponse.json({ error: "Invitado no encontrado." }, { status: 404 });
    const code = secureToken().replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
    const { error: codeError } = await result.db.from("guest_groups").update({ access_code_hash: hashAccessCode(code), access_code_version: 1, code_failed_attempts: 0, code_locked_until: null, updated_at: new Date().toISOString() }).eq("id", guestId).eq("event_id", eventId); if (codeError) throw codeError;
    // The URL is always safe to share: it opens the invitation, never an authenticated RSVP flow.
    // The guest identifies themselves only after selecting "Confirmar asistencia" on that invitation.
    return NextResponse.json({ url: `${request.nextUrl.origin}/e/${result.event.slug}`, code });
  } catch (error) { console.error("issue guest link", error); return NextResponse.json({ error: "No pudimos generar el enlace." }, { status: 500 }); }
}
