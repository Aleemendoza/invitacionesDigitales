type Environment = Readonly<Record<string, string | undefined>>;

export type RuntimeEnvironment = {
  appUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  guestAccessTokenSecret: string;
  rateLimitSecret: string;
  mercadoPagoAccessToken: string;
  mercadoPagoWebhookSecret: string;
  mercadoPagoUserId: string;
  mercadoPagoSandbox: boolean;
};

export class EnvironmentValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Configuración de entorno inválida: ${issues.join("; ")}`);
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

const required = (env: Environment, name: string, issues: string[]) => {
  const value = env[name]?.trim();
  if (!value) issues.push(`${name} es obligatoria`);
  return value ?? "";
};

const validUrl = (value: string, name: string, production: boolean, issues: string[]) => {
  if (!value) return;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) issues.push(`${name} debe usar HTTP o HTTPS`);
    if (production && url.protocol !== "https:") issues.push(`${name} debe usar HTTPS en producción`);
  } catch {
    issues.push(`${name} debe ser una URL válida`);
  }
};

export function validateRuntimeEnvironment(env: Environment = process.env): RuntimeEnvironment {
  const issues: string[] = [];
  const production = env.VERCEL_ENV === "production" || env.PAPELETA_ENV === "production";
  const appUrl = required(env, "APP_URL", issues);
  const supabaseUrl = required(env, "NEXT_PUBLIC_SUPABASE_URL", issues);
  const supabaseAnonKey = required(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY", issues);
  const supabaseServiceRoleKey = required(env, "SUPABASE_SERVICE_ROLE_KEY", issues);
  const guestAccessTokenSecret = required(env, "GUEST_ACCESS_TOKEN_SECRET", issues);
  const rateLimitSecret = required(env, "RATE_LIMIT_SECRET", issues);
  const mercadoPagoAccessToken = required(env, "MERCADOPAGO_ACCESS_TOKEN", issues);
  const mercadoPagoWebhookSecret = required(env, "MERCADOPAGO_WEBHOOK_SECRET", issues);
  const mercadoPagoUserId = required(env, "MERCADOPAGO_USER_ID", issues);
  const sandboxValue = required(env, "MERCADOPAGO_USE_SANDBOX", issues);

  validUrl(appUrl, "APP_URL", production, issues);
  validUrl(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL", production, issues);
  if (sandboxValue && !["true", "false"].includes(sandboxValue)) {
    issues.push("MERCADOPAGO_USE_SANDBOX debe ser true o false");
  }
  if (guestAccessTokenSecret && guestAccessTokenSecret.length < 32) {
    issues.push("GUEST_ACCESS_TOKEN_SECRET debe tener al menos 32 caracteres");
  }
  if (rateLimitSecret && rateLimitSecret.length < 32) {
    issues.push("RATE_LIMIT_SECRET debe tener al menos 32 caracteres");
  }
  if (mercadoPagoWebhookSecret && mercadoPagoWebhookSecret.length < 32) {
    issues.push("MERCADOPAGO_WEBHOOK_SECRET debe tener al menos 32 caracteres");
  }
  if (production && sandboxValue !== "false") {
    issues.push("MERCADOPAGO_USE_SANDBOX debe ser false en producción");
  }
  if (issues.length) throw new EnvironmentValidationError(issues);

  return {
    appUrl,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    guestAccessTokenSecret,
    rateLimitSecret,
    mercadoPagoAccessToken,
    mercadoPagoWebhookSecret,
    mercadoPagoUserId,
    mercadoPagoSandbox: sandboxValue === "true",
  };
}

export function shouldValidateEnvironmentAtStartup(env: Environment = process.env) {
  return env.VALIDATE_ENV_ON_START === "true" || env.VERCEL_ENV === "production" || env.PAPELETA_ENV === "production";
}
