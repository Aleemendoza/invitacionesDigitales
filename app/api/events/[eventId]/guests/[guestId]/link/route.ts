import { NextRequest, NextResponse } from "next/server";
import { ownerContext } from "@/lib/event-owner";
import { secureToken, sha256 } from "@/lib/public-guest-server";
export const runtime = "nodejs";
export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string; guestId: string }> }) { try { const { eventId, guestId } = await params; const result = await ownerContext(request, eventId); if ("error" in result) return result.error; if (result.event.payment_status !== "approved") return NextResponse.json({ error: "Publicá la invitación para habilitar los enlaces." }, { status: 403 }); const { data: guest } = await result.db.from("guest_groups").select("id").eq("id", guestId).eq("event_id", eventId).maybeSingle(); if (!guest) return NextResponse.json({ error: "Invitado no encontrado." }, { status: 404 });
  // guest_group_id is unique: deleting the prior hash makes its URL immediately unusable.
  const { error: revokeError } = await result.db.from("guest_invitation_tokens").delete().eq("guest_group_id", guestId); if (revokeError) throw revokeError;
  const token = secureToken(); const { error } = await result.db.from("guest_invitation_tokens").insert({ guest_group_id: guestId, token_hash: sha256(token) }); if (error) throw error; return NextResponse.json({ url: `${request.nextUrl.origin}/e/${result.event.slug}/i/${token}` }); } catch (error) { console.error("issue guest link", error); return NextResponse.json({ error: "No pudimos generar el enlace." }, { status: 500 }); } }
