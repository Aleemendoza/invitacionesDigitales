import { NextRequest, NextResponse } from "next/server";
import { adminContext, isAdminContext } from "@/lib/admin-context";

export const runtime = "nodejs";

function since(days: number) { return days === 0 ? null : new Date(Date.now() - days * 86_400_000).toISOString(); }

export async function GET(request: NextRequest) {
  const context = await adminContext(request); if (!isAdminContext(context)) return context.error;
  const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const days = [0, 7, 30, 90].includes(requestedDays) ? requestedDays : 30;
  const from = since(days);
  let eventsQuery = context.db.from("events").select("id,status,created_at,owner_id", { count: "exact" });
  let paymentsQuery = context.db.from("event_payments").select("amount,status,created_at");
  let upgradesQuery = context.db.from("event_plan_upgrades").select("id,status,created_at");
  if (from) { eventsQuery = eventsQuery.gte("created_at", from); paymentsQuery = paymentsQuery.gte("created_at", from); upgradesQuery = upgradesQuery.gte("created_at", from); }
  const [{ data: events, count: eventCount }, { data: payments }, { data: upgrades }] = await Promise.all([eventsQuery, paymentsQuery, upgradesQuery]);
  const activeOrganizerIds = new Set((events ?? []).map((event: any) => event.owner_id));
  const paymentTotals = (payments ?? []).reduce((result: Record<string, { count: number; amount: number }>, payment: any) => { const entry = result[payment.status] ?? { count: 0, amount: 0 }; entry.count += 1; entry.amount += payment.amount; result[payment.status] = entry; return result; }, {});
  return NextResponse.json({ days, metrics: { events: { total: eventCount ?? 0, published: (events ?? []).filter((event: any) => event.status === "published").length, pending: (events ?? []).filter((event: any) => event.status === "draft").length }, payments: paymentTotals, upgrades: { total: upgrades?.length ?? 0, pending: upgrades?.filter((upgrade: any) => upgrade.status === "pending").length ?? 0 }, activeOrganizers: activeOrganizerIds.size } });
}
