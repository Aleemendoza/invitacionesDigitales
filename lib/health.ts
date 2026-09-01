export function healthPayload(environment: Readonly<Record<string, string | undefined>> = process.env) {
  return {
    status: "ok" as const,
    service: "papeleta-web" as const,
    version: environment.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
  };
}
