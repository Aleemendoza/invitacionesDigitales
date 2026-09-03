import { NextRequest, NextResponse } from "next/server";
import { ownerContext } from "@/lib/event-owner";
import { canManageGuests, type Plan } from "@/lib/event-drafts";
import { memberFoodPreference } from "@/lib/member-food-preference";

export const runtime = "nodejs";
const MAX_SEATS = 50;
const fields = "id,display_name,seats,status,confirmed_seats,last_activity_at";
function validName(value: unknown): value is string { return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 120; }
function validSeats(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_SEATS; }
async function context(request: NextRequest, params: Promise<{ eventId: string }>) { return ownerContext(request, (await params).eventId); }
function allowed(event: { plan: string }) { return canManageGuests(event.plan as Plan); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const result = await context(request, params); if ("error" in result) return result.error; if (!allowed(result.event)) return NextResponse.json({ error: "La lista de invitados requiere el plan Invitación + Invitados." }, { status: 403 });
  const { data, error } = await result.db.from("guest_groups").select(`${fields},guest_members(id,name,attending,guest_member_food_preferences(food_preference))`).eq("event_id", result.event.id).order("display_name");
  if (error) return NextResponse.json({ error: "No pudimos cargar los invitados." }, { status: 500 });
  const guests = (data ?? []).map((guest: any) => ({ ...guest, members: (guest.guest_members ?? []).map((member: any) => ({ id: member.id, name: member.name, attending: member.attending, foodPreference: memberFoodPreference(member.guest_member_food_preferences) })) }));
  return NextResponse.json({ guests, paymentStatus: result.event.payment_status, eventSlug: result.event.slug, eventTitle: result.event.title, eventType: result.event.event_type, plan: result.event.plan });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try { const result = await context(request, params); if ("error" in result) return result.error; if (!allowed(result.event)) return NextResponse.json({ error: "La lista de invitados requiere el plan Invitación + Invitados." }, { status: 403 }); const body = await request.json() as { name?: unknown; seats?: unknown }; if (!validName(body.name)) return NextResponse.json({ error: "Ingresá un nombre o grupo de entre 2 y 120 caracteres." }, { status: 400 }); if (!validSeats(body.seats)) return NextResponse.json({ error: `Los cupos deben estar entre 1 y ${MAX_SEATS}.` }, { status: 400 }); const name = body.name.trim(); const { data, error } = await result.db.from("guest_groups").insert({ event_id: result.event.id, name, display_name: name, lookup_name_normalized: name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), seats: body.seats }).select(fields).single(); if (error) throw error; const { error: membersError } = await result.db.from("guest_members").insert(Array.from({ length: body.seats }, (_, index) => ({ guest_group_id: data.id, name: `Invitado ${index + 1}` }))); if (membersError) { await result.db.from("guest_groups").delete().eq("id", data.id); throw membersError; } return NextResponse.json({ guest: data }, { status: 201 }); }
  catch (error) { console.error("create guest group", error); return NextResponse.json({ error: "No pudimos agregar el invitado." }, { status: 500 }); }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try { const result = await context(request, params); if ("error" in result) return result.error; if (!allowed(result.event)) return NextResponse.json({ error: "La lista de invitados requiere el plan Invitación + Invitados." }, { status: 403 }); const body = await request.json() as { guestId?: unknown; name?: unknown; seats?: unknown }; if (typeof body.guestId !== "string" || !validName(body.name) || !validSeats(body.seats)) return NextResponse.json({ error: "Revisá el nombre y la cantidad de cupos." }, { status: 400 }); const name = body.name.trim(); const { data, error } = await result.db.from("guest_groups").update({ display_name: name, name, seats: body.seats, lookup_name_normalized: name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), updated_at: new Date().toISOString() }).eq("id", body.guestId).eq("event_id", result.event.id).select(fields).maybeSingle(); if (error) throw error; if (!data) return NextResponse.json({ error: "Invitado no encontrado." }, { status: 404 }); return NextResponse.json({ guest: data }); }
  catch (error) { console.error("update guest group", error); return NextResponse.json({ error: "No pudimos guardar el invitado." }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try { const result = await context(request, params); if ("error" in result) return result.error; if (!allowed(result.event)) return NextResponse.json({ error: "La lista de invitados requiere el plan Invitación + Invitados." }, { status: 403 }); const guestId = new URL(request.url).searchParams.get("guestId"); if (!guestId) return NextResponse.json({ error: "Invitado inválido." }, { status: 400 }); const { error } = await result.db.from("guest_groups").delete().eq("id", guestId).eq("event_id", result.event.id); if (error) throw error; return NextResponse.json({ ok: true }); }
  catch (error) { console.error("delete guest group", error); return NextResponse.json({ error: "No pudimos eliminar el invitado." }, { status: 500 }); }
}
