import { NextRequest, NextResponse } from "next/server";
import { adminContext, isAdminContext } from "@/lib/admin-context";

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
