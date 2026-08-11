import { NextRequest, NextResponse } from "next/server";
import { ownerContext } from "@/lib/event-owner";

export const runtime = "nodejs";
const MAX_SEATS = 50;
const fields = "id,display_name,seats,status,confirmed_seats,last_activity_at";
function validName(value: unknown): value is string { return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 120; }
function validSeats(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_SEATS; }
async function context(request: NextRequest, params: Promise<{ eventId: string }>) { return ownerContext(request, (await params).eventId); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const result = await context(request, params); if ("error" in result) return result.error;
  const { data, error } = await result.db.from("guest_groups").select(fields).eq("event_id", result.event.id).order("display_name");
  if (error) return NextResponse.json({ error: "No pudimos cargar los invitados." }, { status: 500 });
  return NextResponse.json({ guests: data ?? [], paymentStatus: result.event.payment_status, eventSlug: result.event.slug, eventTitle: result.event.title });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try { const result = await context(request, params); if ("error" in result) return result.error; const body = await request.json() as { name?: unknown; seats?: unknown }; if (!validName(body.name)) return NextResponse.json({ error: "Ingresá un nombre o grupo de entre 2 y 120 caracteres." }, { status: 400 }); if (!validSeats(body.seats)) return NextResponse.json({ error: `Los cupos deben estar entre 1 y ${MAX_SEATS}.` }, { status: 400 }); const name = body.name.trim(); const { data, error } = await result.db.from("guest_groups").insert({ event_id: result.event.id, name, display_name: name, lookup_name_normalized: name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), seats: body.seats }).select(fields).single(); if (error) throw error; return NextResponse.json({ guest: data }, { status: 201 }); }
  catch (error) { console.error("create guest group", error); return NextResponse.json({ error: "No pudimos agregar el invitado." }, { status: 500 }); }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try { const result = await context(request, params); if ("error" in result) return result.error; const body = await request.json() as { guestId?: unknown; name?: unknown; seats?: unknown }; if (typeof body.guestId !== "string" || !validName(body.name) || !validSeats(body.seats)) return NextResponse.json({ error: "Revisá el nombre y la cantidad de cupos." }, { status: 400 }); const name = body.name.trim(); const { data, error } = await result.db.from("guest_groups").update({ display_name: name, name, seats: body.seats, lookup_name_normalized: name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), updated_at: new Date().toISOString() }).eq("id", body.guestId).eq("event_id", result.event.id).select(fields).maybeSingle(); if (error) throw error; if (!data) return NextResponse.json({ error: "Invitado no encontrado." }, { status: 404 }); return NextResponse.json({ guest: data }); }
  catch (error) { console.error("update guest group", error); return NextResponse.json({ error: "No pudimos guardar el invitado." }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try { const result = await context(request, params); if ("error" in result) return result.error; const guestId = new URL(request.url).searchParams.get("guestId"); if (!guestId) return NextResponse.json({ error: "Invitado inválido." }, { status: 400 }); const { error } = await result.db.from("guest_groups").delete().eq("id", guestId).eq("event_id", result.event.id); if (error) throw error; return NextResponse.json({ ok: true }); }
  catch (error) { console.error("delete guest group", error); return NextResponse.json({ error: "No pudimos eliminar el invitado." }, { status: 500 }); }
}
