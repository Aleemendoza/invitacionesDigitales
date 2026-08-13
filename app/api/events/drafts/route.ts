import { NextRequest, NextResponse } from "next/server";
import { defaultFeatures, nextAvailableSlug, planDetails, slugify, startsAt, validateDraft, validatePlanFeatures, type EventDraftInput } from "@/lib/event-drafts";
import { getAdminSupabase } from "@/lib/public-guest-server";
import { templates } from "@/lib/templates";
export const runtime = "nodejs";
async function currentUser(request: NextRequest) { const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); if (!token) return null; const db = getAdminSupabase(); const { data } = await db.auth.getUser(token); return data.user ?? null; }
export async function POST(request: NextRequest) { try {
  const user = await currentUser(request); if (!user) return NextResponse.json({ error: "Iniciá sesión para crear tu invitación." }, { status: 401 });
  const input = await request.json() as EventDraftInput; const validation = validateDraft(input); if (validation) return NextResponse.json({ error: validation }, { status: 400 });
  if (!templates.some(item => item.slug === input.templateSlug && item.plan === input.plan) || !validatePlanFeatures(input.plan, input.features)) return NextResponse.json({ error: "La plantilla o las funciones elegidas no corresponden al plan." }, { status: 400 });
  const db = getAdminSupabase(); await db.from("profiles").upsert({ id: user.id, full_name: user.user_metadata.full_name ?? user.email ?? "Organizador" });
  const base = slugify(input.title) || "mi-evento"; const [{ data: exact }, { data: related }] = await Promise.all([db.from("events").select("slug").eq("slug", base), db.from("events").select("slug").like("slug", `${base}-%`)]);
  const slug = nextAvailableSlug(base, [...(exact ?? []), ...(related ?? [])].map(event => event.slug));
  const rsvpEnabled = input.plan !== "standard" && (input.rsvp?.enabled ?? true);
  const { data, error } = await db.from("events").insert({ owner_id: user.id, slug, title: input.title.trim(), event_type: input.eventType, starts_at: startsAt(input.date, input.time), template_slug: input.templateSlug, plan: input.plan, payment_status: "unpaid", guest_access_mode: input.rsvp?.accessMode ?? "name_lookup", rsvp_enabled: rsvpEnabled, rsvp_deadline: rsvpEnabled ? input.rsvp?.deadline || null : null, content: { venue: input.venue, venueAddress: input.venueAddress ?? "", mapUrl: input.mapUrl ?? "", closingMessage: input.closingMessage ?? "", wizard_step: 8, features: input.features.length ? input.features : defaultFeatures(input.plan), agenda: input.agenda, message: input.message ?? "", dressCode: input.dressCode ?? "", musicUrl: input.musicUrl ?? "", theme: input.theme, rsvp: input.rsvp } }).select("id,slug,plan,payment_status").single();
  if (error) { if (error.code === "23505") return NextResponse.json({ error: "Esa URL se acaba de ocupar. Intentá crear el evento nuevamente." }, { status: 409 }); throw error; }
  return NextResponse.json({ event: data, payment: { amount: planDetails[input.plan].price } }, { status: 201 });
} catch (error) { console.error("create event draft", error); return NextResponse.json({ error: "No pudimos crear el evento." }, { status: 500 }); } }
