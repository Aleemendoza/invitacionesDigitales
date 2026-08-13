"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/papeleta";
import { PublicInvitation } from "@/components/public-invitation";
import styles from "@/components/unavailable-invitation.module.css";
import type { StoredEvent } from "@/lib/event-types";

function UnavailableInvitation() {
  return <main className={styles.page}>
    <Header />
    <section className={styles.content} aria-labelledby="unavailable-title">
      <img className={styles.artwork} src="/images/ui/unavailable-envelope.png" alt="Sobre de invitación cerrado" />
      <p className={styles.eyebrow}>INVITACIÓN NO DISPONIBLE</p>
      <h1 id="unavailable-title">Esta invitación aún<br />no está publicada.</h1>
      <div className={styles.divider} aria-hidden="true"><span /></div>
      <p className={styles.message}>El anfitrión todavía no activó el enlace.<br />¡Pero la cuenta regresiva para algo increíble ya empezó!</p>
    </section>
  </main>;
}

export function SingleLinkInvitation({ slug }: { slug: string }) {
  const [event, setEvent] = useState<StoredEvent>();
  const [error, setError] = useState("");
  useEffect(() => { void fetch(`/api/public/events/${encodeURIComponent(slug)}`).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setEvent(body.event); }).catch(reason => setError(reason instanceof Error ? reason.message : "No pudimos cargar la invitación.")); }, [slug]);
  if (error) return <UnavailableInvitation />;
  return event ? <PublicInvitation event={event} /> : <main className="publicUnavailable publicUnavailableLoading"><p>Cargando invitación…</p></main>;
}
