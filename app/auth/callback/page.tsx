"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Completando el ingreso con Google…");

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const code = params.get("code");
        const client = getBrowserSupabase();
        if (!code || !client) throw new Error("No pudimos completar el acceso.");
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
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
