import { NextRequest, NextResponse } from "next/server";
import { ownerContext } from "@/lib/event-owner";
import { hasPlanFeature, usesPersonalizedRsvp, type Plan } from "@/lib/event-drafts";

const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const context = await ownerContext(request, (await params).eventId);
  if ("error" in context) return context.error;
  const plan = context.event.plan as Plan;
  if (!hasPlanFeature(plan, "csv-export")) return NextResponse.json({ error: "La exportación RSVP requiere Premium o Premium Plus+." }, { status: 403 });
  const rows = usesPersonalizedRsvp(plan)
    ? (await context.db.from("guest_groups").select("display_name,seats,confirmed_seats,status").eq("event_id", context.event.id)).data?.map(item => [item.display_name, item.seats, item.confirmed_seats ?? 0, item.status]) ?? []
    : (await context.db.from("public_rsvp_responses").select("first_name,last_name,companions,food_preference,song_request,created_at").eq("event_id", context.event.id).order("created_at", { ascending: false })).data?.map(item => [item.first_name, item.last_name, item.companions, item.food_preference, item.song_request, item.created_at]) ?? [];
  const headers = usesPersonalizedRsvp(plan) ? ["Invitado", "Cupos", "Confirmados", "Estado"] : ["Nombre", "Apellido", "Acompañantes", "Comida", "Canción", "Fecha"];
  return new NextResponse([headers, ...rows].map(row => row.map(csv).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="rsvp-${context.event.slug}.csv"` } });
}
