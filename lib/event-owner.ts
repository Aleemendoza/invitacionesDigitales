import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/public-guest-server";

export async function ownerContext(request: NextRequest, eventId: string) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Iniciá sesión para continuar." }, { status: 401 }) } as const;
  const db = getAdminSupabase();
  const { data: { user } } = await db.auth.getUser(token);
  if (!user) return { error: NextResponse.json({ error: "Sesión vencida. Volvé a ingresar." }, { status: 401 }) } as const;
  const { data: event } = await db.from("events").select("id,slug,title,payment_status,status,plan").eq("id", eventId).eq("owner_id", user.id).maybeSingle();
  if (!event) return { error: NextResponse.json({ error: "Evento no encontrado." }, { status: 404 }) } as const;
  return { db, event, user } as const;
}
