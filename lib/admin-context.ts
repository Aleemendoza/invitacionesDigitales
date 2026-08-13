import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/public-guest-server";

export type AdminContext = { db: ReturnType<typeof getAdminSupabase>; userId: string };

export async function adminContext(request: NextRequest): Promise<AdminContext | { error: NextResponse }> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Iniciá sesión." }, { status: 401 }) };
  const db = getAdminSupabase();
  const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return { error: NextResponse.json({ error: "Sesión vencida." }, { status: 401 }) };
  const { data: profile } = await db.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin") return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  return { db, userId: auth.user.id };
}

export function isAdminContext(value: AdminContext | { error: NextResponse }): value is AdminContext {
  return !("error" in value);
}
