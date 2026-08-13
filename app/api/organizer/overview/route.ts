import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/public-guest-server";
import { eventProgress, rsvpTotals } from "@/lib/panel-metrics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
  const db = getAdminSupabase(); const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const { data, error } = await db.from("events").select("id,slug,title,event_type,starts_at,status,template_slug,plan,payment_status,content,created_at,guest_groups(seats,confirmed_seats,status),event_payments(id,amount,status,admin_note,created_at),event_plan_upgrades(id,source_plan,target_plan,amount,status,admin_note,created_at)").eq("owner_id", auth.user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "No pudimos cargar tu panel." }, { status: 500 });
  const events = (data ?? []).map((event: any) => ({ ...event, progress: eventProgress(event), rsvp: rsvpTotals(event.guest_groups ?? []) }));
  return NextResponse.json({ events });
}
