import { NextRequest, NextResponse } from "next/server";
import { adminContext, isAdminContext } from "@/lib/admin-context";
import { canChangeRole } from "@/lib/panel-metrics";

export const runtime = "nodejs";
const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const context = await adminContext(request); if (!isAdminContext(context)) return context.error;
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const { data: authUsers, error: authError } = await context.db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authError) return NextResponse.json({ error: "No pudimos cargar los usuarios." }, { status: 500 });
  const ids = authUsers.users.map((user) => user.id);
  const [{ data: profiles }, { data: events }] = await Promise.all([
    ids.length ? context.db.from("profiles").select("id,full_name,role,created_at").in("id", ids) : Promise.resolve({ data: [] }),
    ids.length ? context.db.from("events").select("owner_id,created_at").in("owner_id", ids) : Promise.resolve({ data: [] }),
  ]);
  const profileById = new Map((profiles ?? []).map((profile: any) => [profile.id, profile]));
  const eventByOwner = new Map<string, { count: number; lastActivity: string | null }>();
  (events ?? []).forEach((event: any) => { const current = eventByOwner.get(event.owner_id) ?? { count: 0, lastActivity: null }; current.count += 1; if (!current.lastActivity || event.created_at > current.lastActivity) current.lastActivity = event.created_at; eventByOwner.set(event.owner_id, current); });
  const matching = authUsers.users.map((user) => { const profile: any = profileById.get(user.id); const activity = eventByOwner.get(user.id); return { id: user.id, email: user.email ?? "", fullName: profile?.full_name ?? user.user_metadata.full_name ?? "Sin nombre", role: profile?.role === "admin" ? "admin" : "organizer", createdAt: profile?.created_at ?? user.created_at, eventCount: activity?.count ?? 0, lastActivity: activity?.lastActivity }; }).filter((user) => !query || `${user.fullName} ${user.email}`.toLowerCase().includes(query));
  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  return NextResponse.json({ users: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), page: Math.min(page, totalPages), totalPages });
}

export async function PATCH(request: NextRequest) {
  const context = await adminContext(request); if (!isAdminContext(context)) return context.error;
  const body = await request.json() as { userId?: string; role?: string };
  if (!body.userId || !body.role) return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  const [{ data: target }, { count: adminCount }] = await Promise.all([
    context.db.from("profiles").select("id,role").eq("id", body.userId).maybeSingle(),
    context.db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
  ]);
  const { data: authTarget } = await context.db.auth.admin.getUserById(body.userId);
  if (!authTarget.user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  const currentRole = target?.role === "admin" ? "admin" : "organizer";
  const reason = canChangeRole(context.userId, body.userId, body.role, currentRole, adminCount ?? 0);
  if (reason) return NextResponse.json({ error: reason }, { status: 409 });
  const { error } = await context.db.from("profiles").upsert({ id: body.userId, full_name: authTarget.user.user_metadata.full_name ?? authTarget.user.email ?? "Organizador", role: body.role });
  if (error) return NextResponse.json({ error: "No pudimos actualizar el rol." }, { status: 500 });
  await context.db.from("role_audit_log").insert({ actor_id: context.userId, target_id: body.userId, previous_role: currentRole, next_role: body.role });
  return NextResponse.json({ ok: true });
}
