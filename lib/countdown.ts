export type CountdownState =
  | { kind: "pending"; days: number; hours: number; minutes: number; seconds: number }
  | { kind: "live" }
  | { kind: "missing" };

export function getCountdown(startsAt: string | null, privatePreview: boolean, now = Date.now()): CountdownState {
  if (!startsAt) return privatePreview ? { kind: "missing" } : { kind: "live" };
  const startsAtMs = new Date(startsAt).getTime();
  if (Number.isNaN(startsAtMs) || startsAtMs <= now) return { kind: "live" };
  const delta = startsAtMs - now;
  return { kind: "pending", days: Math.floor(delta / 86_400_000), hours: Math.floor(delta / 3_600_000) % 24, minutes: Math.floor(delta / 60_000) % 60, seconds: Math.floor(delta / 1_000) % 60 };
}
