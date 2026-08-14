"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function IndividualInvitation({ slug, token }: { slug: string; token: string }) {
  const router = useRouter(); const [message, setMessage] = useState("Verificando tu invitación…"); const [code, setCode] = useState(""); const [requiresCode, setRequiresCode] = useState(false);
  const access = async (submittedCode?: string) => {
    setMessage("Verificando tu invitación…");
    const response = await fetch(`/api/public/events/${encodeURIComponent(slug)}/legacy-access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, code: submittedCode }) });
    const body = await response.json();
    if (!response.ok) { setRequiresCode(Boolean(body.requiresCode)); setMessage(body.error ?? "No pudimos verificar tu invitación."); return; }
    router.replace(`${body.canonicalUrl}/rsvp`);
  };
  useEffect(() => { void access(); }, [slug, token]);
  return <main className="publicUnavailable"><h1>Tu invitación</h1>{requiresCode ? <form onSubmit={(event) => { event.preventDefault(); void access(code); }}><label>Código de acceso<input autoFocus value={code} onChange={(event) => setCode(event.currentTarget.value)} maxLength={12} required /></label><button className="button dark">Continuar</button></form> : <p>{message}</p>}{requiresCode && <p>{message}</p>}</main>;
}
