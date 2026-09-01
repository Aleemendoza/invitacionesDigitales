const SENSITIVE_KEY = /(authorization|cookie|email|phone|token|secret|password|passcode|answer|bank|alias|service.?role|api.?key)/i;
const BEARER_TOKEN = /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

export type LogLevel = "info" | "warn" | "error";
export type LogFields = Readonly<Record<string, unknown>>;

function redactString(value: string) {
  return value.replace(BEARER_TOKEN, "Bearer [REDACTED]").replace(EMAIL, "[REDACTED_EMAIL]");
}

export function redact(value: unknown, key = "", seen = new WeakSet<object>()): unknown {
  if (SENSITIVE_KEY.test(key)) return "[REDACTED]";
  if (typeof value === "string") return redactString(value);
  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message) };
  }
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => redact(item, key, seen));
  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey, seen)]));
}

export function createLogEntry(level: LogLevel, event: string, fields: LogFields = {}) {
  return {
    ...redact(fields) as Record<string, unknown>,
    timestamp: new Date().toISOString(),
    level,
    event,
  };
}

export function log(level: LogLevel, event: string, fields: LogFields = {}) {
  const entry = createLogEntry(level, event, fields);
  const output = JSON.stringify(entry);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.info(output);
}

export function correlationId(headers: Headers) {
  const incoming = headers.get("x-correlation-id")?.trim();
  return incoming && /^[A-Za-z0-9_-]{8,128}$/.test(incoming) ? incoming : crypto.randomUUID();
}
