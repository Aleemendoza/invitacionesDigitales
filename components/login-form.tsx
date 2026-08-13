"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allowedEmailHint, isAllowedEmail } from "@/lib/allowed-email";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import styles from "./login-form.module.css";

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.23-.19-1.77H12v3.34h5.38c-.11.83-.71 2.08-2.04 2.92l-.02.11 2.97 2.3.21.02c1.93-1.78 3.05-4.4 3.05-7.22Z" /><path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.07-2.43c-.82.57-1.92.97-3.38.97a5.86 5.86 0 0 1-5.53-4.04l-.1.01-3.09 2.39-.03.1A9.75 9.75 0 0 0 12 21.75Z" /><path fill="#FBBC05" d="M6.47 13.88A5.9 5.9 0 0 1 6.15 12c0-.65.12-1.28.31-1.88l-.01-.13-3.13-2.43-.1.05A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05.97 4.39l3.25-2.51Z" /><path fill="#EA4335" d="M12 6.08c1.84 0 3.08.8 3.79 1.46l2.77-2.7C16.83 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.78 5.36l3.24 2.51A5.88 5.88 0 0 1 12 6.08Z" /></svg>;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const next = params.get("next");
  const destination = next?.startsWith("/") ? next : "/mis-eventos";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (!isAllowedEmail(email)) throw new Error(allowedEmailHint);
      const client = getBrowserSupabase();
      if (!client) throw new Error("No encontramos la configuración de acceso.");
      const result = mode === "login"
        ? await client.auth.signInWithPassword({ email: email.trim(), password })
        : await client.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(destination) },
          });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("Cuenta creada. Confirmá el email para continuar.");
        return;
      }
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("No pudimos conservar tu sesión. Volvé a intentarlo.");
      router.replace(destination);
      router.refresh();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No pudimos iniciar sesión.");
    } finally {
      setSaving(false);
    }
  };

  const google = async () => {
    setSaving(true);
    setMessage("");
    try {
      const client = getBrowserSupabase();
      if (!client) throw new Error("No encontramos la configuración de acceso.");
      const redirectTo = window.location.origin + "/auth/callback?next=" + encodeURIComponent(destination);
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) throw error;
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No pudimos iniciar sesión con Google.");
      setSaving(false);
    }
  };

  return <main className="auth"><section><Link className="brand" href="/">Papeleta<span>✦</span></Link><p className="eyebrow">{mode === "login" ? "VOLVÉ A TU CELEBRACIÓN." : "EMPEZÁ A CREAR."}</p><h1>{mode === "login" ? "Qué lindo tenerte de vuelta." : "Tu próxima celebración empieza acá."}</h1><button className={styles.googleButton} type="button" disabled={saving} onClick={() => void google()}><GoogleIcon />Continuar con Google</button><div className={styles.authDivider}><span />o continuá con email<span /></div><form onSubmit={submit}><label>Email<input type="email" required autoComplete="email" placeholder="nombre@gmail.com" value={email} onChange={event => setEmail(event.currentTarget.value)} /></label><small className={styles.emailHint}>{allowedEmailHint}</small><label>Contraseña<input type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.currentTarget.value)} /></label>{message && <p className="formError" role="alert">{message}</p>}<button className="button dark" disabled={saving}>{saving ? "Ingresando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}</button></form><button className={"textButton " + styles.authModeSwitch} disabled={saving} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Crear una cuenta con email" : "Ya tengo cuenta"}</button></section><div /></main>;
}
