"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/papeleta";

export function IndividualInvitation({ slug, token }: { slug: string; token: string }) {
  const router = useRouter(); const [message, setMessage] = useState("Estamos preparando tu invitación…"); const [code, setCode] = useState(""); const [requiresCode, setRequiresCode] = useState(false);
  const access = async (submittedCode?: string) => {
    setMessage("Verificando tu acceso…");
    const response = await fetch(`/api/public/events/${encodeURIComponent(slug)}/legacy-access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, code: submittedCode }) });
    const body = await response.json();
    if (!response.ok) { setRequiresCode(Boolean(body.requiresCode)); setMessage(body.error ?? "No pudimos verificar esta invitación."); return; }
    router.replace(`${body.canonicalUrl}/rsvp`);
  };
  useEffect(() => { void access(); }, [slug, token]);
  return <><Header /><main className="publicUnavailable publicAccess"><section className="publicAccessCard"><p className="eyebrow">INVITACIÓN PERSONAL</p><h1>Tu lugar ya está reservado.</h1>{requiresCode ? <><p>Ingresá el código que recibiste junto al enlace para confirmar tu asistencia.</p><form onSubmit={(event) => { event.preventDefault(); void access(code); }}><label>Código de acceso<input autoFocus value={code} onChange={(event) => setCode(event.currentTarget.value.toUpperCase())} maxLength={12} autoComplete="one-time-code" required /></label><button className="button dark">Continuar</button></form></> : <p className="publicAccessStatus">{message}</p>}{requiresCode && <p className="publicAccessNotice" role="status">{message}</p>}</section></main></>;
}
