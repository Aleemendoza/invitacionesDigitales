import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "./public-guest-server";

export type RateLimitAction = "lookup" | "code" | "rsvp" | "general-rsvp" | "trivia" | "album" | "checkout";

const rules: Record<RateLimitAction, { max: number; windowSeconds: number }> = {
  lookup: { max: 10, windowSeconds: 60 },
  code: { max: 5, windowSeconds: 600 },
  rsvp: { max: 12, windowSeconds: 60 },
  "general-rsvp": { max: 8, windowSeconds: 600 },
  trivia: { max: 8, windowSeconds: 600 },
  album: { max: 12, windowSeconds: 600 },
  checkout: { max: 8, windowSeconds: 300 },
};

function clientIp(request: NextRequest) {
  // Vercel overwrites x-forwarded-for. Taking the first hop avoids attacker-
  // supplied suffixes; x-real-ip is the local-development fallback.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

export async function enforceSharedRateLimit(request: NextRequest, action: RateLimitAction, scope: string) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) {
    console.error("rate limit secret is not configured");
    return NextResponse.json({ error: "El servicio no está disponible temporalmente." }, { status: 503 });
  }
  const rule = rules[action];
  const scopeHash = createHmac("sha256", secret)
    .update(`${action}:${scope}:${clientIp(request)}`)
    .digest("hex");
  const { data, error } = await getAdminSupabase().rpc("consume_rate_limit", {
    p_action: action,
    p_scope_hash: scopeHash,
    p_max_requests: rule.max,
    p_window_seconds: rule.windowSeconds,
  });
  if (error) {
    console.error("shared rate limit failed", { action, code: error.code });
    return NextResponse.json({ error: "El servicio no está disponible temporalmente." }, { status: 503 });
  }
  const result = Array.isArray(data) ? data[0] : data;
  if (result?.allowed !== false) return null;
  const retryAfter = Math.max(1, Number(result.retry_after) || rule.windowSeconds);
  return NextResponse.json(
    { error: "Demasiados intentos. Esperá unos minutos e intentá nuevamente." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
