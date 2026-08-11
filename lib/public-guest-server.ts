import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const GUEST_SESSION_COOKIE = "celebra_guest_session";
const SESSION_DAYS = 30;
const tokenSecret = () => process.env.GUEST_ACCESS_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type RateLimitKey = "lookup" | "code" | "rsvp";
const limits: Record<RateLimitKey, { max: number; windowMs: number }> = {
  lookup: { max: 10, windowMs: 60_000 },
  code: { max: 5, windowMs: 10 * 60_000 },
  rsvp: { max: 12, windowMs: 60_000 },
};
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Process-local guard. Deployments should replace this with Redis/edge KV for shared throttling. */
export function enforceRateLimit(request: NextRequest, kind: RateLimitKey, scope: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${kind}:${scope}:${ip}`;
  const rule = limits[kind], now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }
  bucket.count++;
  if (bucket.count <= rule.max) return null;
  return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos e intentá nuevamente." }, { status: 429, headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) } });
}

export function sha256(value: string) { return createHash("sha256").update(value).digest("hex"); }
/** PINs have a tiny keyspace; a server-only pepper prevents offline guessing if the DB leaks. */
export function hashAccessCode(value: string) {
  const secret = tokenSecret();
  if (!secret) throw new Error("GUEST_ACCESS_TOKEN_SECRET is required.");
  return createHmac("sha256", secret).update(`celebra:guest-pin:v1:${value}`).digest("hex");
}
export function secureToken() { return randomBytes(32).toString("base64url"); }

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

type LookupPayload = { eventId: string; groupId: string; exp: number; purpose: "guest_lookup" };
export function signLookupToken(payload: Omit<LookupPayload, "exp" | "purpose">, lifetimeMs = 10 * 60_000) {
  const secret = tokenSecret(); if (!secret) throw new Error("GUEST_ACCESS_TOKEN_SECRET is required.");
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + lifetimeMs, purpose: "guest_lookup" satisfies LookupPayload["purpose"] })).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}
export function verifyLookupToken(token: string): LookupPayload | null {
  const secret = tokenSecret(); if (!secret || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { const value = JSON.parse(Buffer.from(encoded, "base64url").toString()) as LookupPayload; return value.purpose === "guest_lookup" && value.exp > Date.now() ? value : null; } catch { return null; }
}

export async function createGuestSession(response: NextResponse, eventId: string, groupId: string) {
  const rawToken = secureToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  const db = getAdminSupabase();
  const { error } = await db.from("guest_sessions").insert({ event_id: eventId, guest_group_id: groupId, session_token_hash: sha256(rawToken), expires_at: expiresAt });
  if (error) throw error;
  response.cookies.set(GUEST_SESSION_COOKIE, rawToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(expiresAt) });
}

export async function getGuestSession(eventId: string) {
  const rawToken = (await cookies()).get(GUEST_SESSION_COOKIE)?.value;
  if (!rawToken) return null;
  const db = getAdminSupabase();
  const { data, error } = await db.from("guest_sessions").select("id,event_id,guest_group_id,expires_at,revoked_at,guest_groups(id,event_id,display_name,seats,status,confirmed_seats)").eq("event_id", eventId).eq("session_token_hash", sha256(rawToken)).maybeSingle();
  if (error || !data || data.revoked_at || new Date(data.expires_at) <= new Date()) return null;
  await db.from("guest_sessions").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data;
}

export function badRequest(message: string) { return NextResponse.json({ error: message }, { status: 400 }); }
export function unavailable() { return NextResponse.json({ error: "El servicio de confirmaciones no está disponible todavía." }, { status: 503 }); }
