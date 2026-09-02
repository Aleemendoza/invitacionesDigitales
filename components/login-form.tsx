"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allowedEmailHint, isAllowedEmail } from "@/lib/allowed-email";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import styles from "./login-form.module.css";

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
  const isLogin = mode === "login";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (!isAllowedEmail(email)) throw new Error(allowedEmailHint);
      const client = getBrowserSupabase();
      if (!client) throw new Error("No encontramos la configuración de acceso.");
      const result = isLogin
        ? await client.auth.signInWithPassword({ email: email.trim(), password })
        : await client.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(destination) },
          });
      if (result.error) throw result.error;
      if (!isLogin && !result.data.session) {
        setMessage("Cuenta creada. Revisá tu email y confirmalo para continuar.");
        return;
      }
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("No pudimos conservar tu sesión. Volvé a intentarlo.");
      router.replace(destination);
      router.refresh();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No pudimos completar el acceso.");
    } finally {
      setSaving(false);
    }
  };

  const changeMode = () => {
    setMode(isLogin ? "signup" : "login");
    setMessage("");
    setPassword("");
  };

  return <main className="auth">
    <section className={styles.authPanel}>
      <Link className="brand" href="/">Papeleta<span>✦</span></Link>
      <div className={styles.heading}>
        <p className="eyebrow">{isLogin ? "VOLVÉ A TU CELEBRACIÓN." : "EMPEZÁ A CREAR."}</p>
        <h1>{isLogin ? "Ingresá a tu cuenta." : "Creá tu cuenta."}</h1>
        <p>{isLogin ? "Usá el email y la contraseña con los que te registraste." : "Sólo necesitás un email válido y una contraseña."}</p>
      </div>
      <form className={styles.emailForm} onSubmit={submit}>
        <label htmlFor="auth-email">Email</label>
        <input id="auth-email" type="email" required autoComplete="email" placeholder="nombre@ejemplo.com" value={email} onChange={event => setEmail(event.currentTarget.value)} />
        <small className={styles.emailHint}>{allowedEmailHint}</small>
        <label htmlFor="auth-password">Contraseña</label>
        <input id="auth-password" type="password" required minLength={6} autoComplete={isLogin ? "current-password" : "new-password"} placeholder={isLogin ? "Ingresá tu contraseña" : "Mínimo 6 caracteres"} value={password} onChange={event => setPassword(event.currentTarget.value)} />
        {message && <p className="formError" role="alert">{message}</p>}
        <button className="button dark" disabled={saving}>{saving ? "Procesando…" : isLogin ? "Ingresar" : "Crear cuenta"}</button>
      </form>
      {!isLogin && <p className={styles.legalNotice}>Al crear tu cuenta confirmás que leíste los <Link href="/terminos">Términos y condiciones</Link>, la <Link href="/privacidad">Política de privacidad</Link> y la <Link href="/politica-de-uso">Política de uso</Link>.</p>}
      <p className={styles.modePrompt}>{isLogin ? "¿Todavía no tenés una cuenta?" : "¿Ya tenés una cuenta?"}</p>
      <button className={styles.authModeSwitch} type="button" disabled={saving} onClick={changeMode}>{isLogin ? "Crear una cuenta" : "Iniciar sesión"}</button>
    </section>
    <div aria-hidden="true" />
  </main>;
}
