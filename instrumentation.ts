import { shouldValidateEnvironmentAtStartup, validateRuntimeEnvironment } from "@/lib/env";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (shouldValidateEnvironmentAtStartup()) validateRuntimeEnvironment();
}
