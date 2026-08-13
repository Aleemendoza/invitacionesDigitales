"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Completando el ingreso…");

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const client = getBrowserSupabase();
        if (!client) throw new Error("No encontramos la configuración de acceso.");
        const callbackError = params.get("error_description") ?? params.get("error");
        if (callbackError) throw new Error(callbackError);
        const code = params.get("code");
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Email confirmation can return the Supabase session in the URL hash.
          // The browser client consumes that hash during initialization.
          const { data: { session } } = await client.auth.getSession();
          if (!session) throw new Error("El enlace de confirmación venció o ya fue utilizado. Solicitá uno nuevo.");
        }
        const next = params.get("next");
        router.replace(next?.startsWith("/") ? next : "/mis-eventos");
        router.refresh();
      } catch (reason) {
        setMessage(reason instanceof Error ? reason.message : "No pudimos completar el acceso.");
      }
    };
    void completeLogin();
  }, [params, router]);

  return <main className="auth"><section><p className="eyebrow">INGRESO SEGURO</p><h1>{message}</h1></section><div /></main>;
}

export default function AuthCallbackPage() {
  return <Suspense fallback={<main className="auth"><section><p>Completando el ingreso…</p></section><div /></main>}><CallbackContent /></Suspense>;
}
