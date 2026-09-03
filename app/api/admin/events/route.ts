import { NextRequest, NextResponse } from "next/server";
import { adminContext, isAdminContext } from "@/lib/admin-context";
import { normalizePlan, planDetails } from "@/lib/event-drafts";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await adminContext(request); if (!isAdminContext(context)) return context.error;
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status");
  let eventsQuery = context.db.from("events").select("id,slug,title,starts_at,status,plan,payment_status,created_at,profiles!events_owner_id_fkey(full_name)").order("created_at", { ascending: false }).limit(100);
  if (status && ["draft", "published", "finished"].includes(status)) eventsQuery = eventsQuery.eq("status", status);
  if (query) eventsQuery = eventsQuery.or(`title.ilike.%${query.replace(/[%,()]/g, "")}%,slug.ilike.%${query.replace(/[%,()]/g, "")}%`);
  const { data, error } = await eventsQuery;
  if (error) return NextResponse.json({ error: "No pudimos cargar los eventos." }, { status: 500 });
  return NextResponse.json({ events: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const context = await adminContext(request); if (!isAdminContext(context)) return context.error;
  const body = await request.json() as { eventId?: string; action?: string; note?: string };
  if (!body.eventId || body.action !== "publish") return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  const { data: event } = await context.db.from("events").select("id,title,plan,status,payment_status").eq("id", body.eventId).maybeSingle();
  if (!event) return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  if (event.status === "published" || event.payment_status === "approved") return NextResponse.json({ error: "El evento ya está publicado." }, { status: 409 });
  const now = new Date().toISOString();
  const normalizedPlan = normalizePlan(event.plan);
  const { error: paymentError } = await context.db.from("event_payments").insert({ event_id: event.id, plan: normalizedPlan, amount: planDetails[normalizedPlan].price, provider: "transfer", status: "approved", organizer_note: "Pago por transferencia aprobado desde administración.", admin_note: (body.note ?? "").slice(0, 500), reviewed_by: context.userId, reviewed_at: now, updated_at: now });
  if (paymentError) return NextResponse.json({ error: "No pudimos registrar el pago por transferencia." }, { status: 500 });
  const { error } = await context.db.from("events").update({ payment_status: "approved", status: "published", updated_at: now }).eq("id", event.id);
  if (error) return NextResponse.json({ error: "No pudimos publicar el evento." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
