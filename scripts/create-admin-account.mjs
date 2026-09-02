import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

for (const filename of [".env.local", ".env"]) {
  const envPath = resolve(projectRoot, filename);
  if (existsSync(envPath)) process.loadEnvFile(envPath);
}

function requiredEnvironmentVariable(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable ${name}.`);
  return value;
}

const supabaseUrl = requiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requiredEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");
const email = requiredEnvironmentVariable("ACCOUNT_EMAIL").toLowerCase();
const password = requiredEnvironmentVariable("ACCOUNT_PASSWORD");
const fullName = process.env.ACCOUNT_FULL_NAME?.trim() || "Administrador";

if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ACCOUNT_EMAIL no es válido.");
if (password.length < 12) throw new Error("ACCOUNT_PASSWORD debe tener al menos 12 caracteres.");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (createError || !data.user) {
  throw new Error(`No se pudo crear la cuenta: ${createError?.message ?? "respuesta vacía"}`);
}

const userId = data.user.id;
const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin", full_name: fullName })
  .eq("id", userId)
  .select("id")
  .single();

if (profileError) {
  const { error: rollbackError } = await supabase.auth.admin.deleteUser(userId);
  const rollbackMessage = rollbackError
    ? ` También falló el rollback: ${rollbackError.message}. El usuario afectado es ${userId}.`
    : " La cuenta de Auth fue eliminada automáticamente.";
  throw new Error(`No se pudo asignar el rol admin: ${profileError.message}.${rollbackMessage}`);
}

console.log(`Cuenta administradora creada y confirmada: ${email} (${userId})`);
