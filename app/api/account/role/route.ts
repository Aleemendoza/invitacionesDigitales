import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/public-guest-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
  const db = getAdminSupabase();
  const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const { data: profile, error } = await db.from("profiles").select("role,full_name").eq("id", auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "No pudimos comprobar tu rol." }, { status: 500 });
  return NextResponse.json({
    userId: auth.user.id,
    role: profile?.role === "admin" ? "admin" : "organizer",
    fullName: profile?.full_name ?? auth.user.user_metadata.full_name ?? auth.user.email ?? "Organizador",
  });
}
