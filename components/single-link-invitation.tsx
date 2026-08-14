"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/papeleta";
import { PublicInvitation } from "@/components/public-invitation";
import styles from "@/components/unavailable-invitation.module.css";
import type { StoredEvent } from "@/lib/event-types";

export function UnavailableInvitation({ rsvp = false }: { rsvp?: boolean }) {
  const title = rsvp ? ["No encontramos esta", "confirmación."] : ["Esta invitación aún", "no está publicada."];
  const message = rsvp
    ? "Verificá que el enlace esté completo o pedile a quien organiza el evento que te lo reenvíe."
    : "El anfitrión todavía no activó el enlace. ¡Pero la cuenta regresiva para algo increíble ya empezó!";

  return <>
    <Header />
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="unavailable-title">
        <img className={styles.artwork} src="/images/ui/unavailable-envelope.png" alt="Sobre de invitación cerrado" />
        <p className={styles.eyebrow}>{rsvp ? "CONFIRMACIÓN NO DISPONIBLE" : "INVITACIÓN NO DISPONIBLE"}</p>
        <h1 id="unavailable-title">{title.map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1>
        <div className={styles.divider} aria-hidden="true"><span /></div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Link className="button dark" href="/">Ir al inicio</Link>
          <Link className="button outline" href="/plantillas">Ver plantillas</Link>
        </div>
        <p className={styles.help}>Si recibiste este enlace por WhatsApp, abrí nuevamente el mensaje original o solicitá uno nuevo a quien organiza el evento.</p>
      </section>
    </main>
  </>;
}

export function SingleLinkInvitation({ slug }: { slug: string }) {
  const [event, setEvent] = useState<StoredEvent>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch(`/api/public/events/${encodeURIComponent(slug)}`)
      .then(async response => {
        const body = await response.json().catch(() => null) as { event?: StoredEvent } | null;
        if (!response.ok || !body?.event) throw new Error("Invitation unavailable");
        if (active) setEvent(body.event);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => { active = false; };
  }, [slug]);

  if (error) return <UnavailableInvitation />;
  return event ? <PublicInvitation event={event} /> : <main className="publicUnavailable publicUnavailableLoading"><p>Cargando invitación…</p></main>;
}
