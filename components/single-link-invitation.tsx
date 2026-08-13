"use client";
import { useEffect, useState } from "react";
import { RoleBadge } from "@/components/account-role";
import { PublicInvitation } from "@/components/public-invitation";
import type { StoredEvent } from "@/lib/event-types";

export function SingleLinkInvitation({ slug }: { slug: string }) {
  const [event, setEvent] = useState<StoredEvent>();
  const [error, setError] = useState("");
  useEffect(() => { void fetch(`/api/public/events/${encodeURIComponent(slug)}`).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setEvent(body.event); }).catch(reason => setError(reason instanceof Error ? reason.message : "No pudimos cargar la invitación.")); }, [slug]);
  if (error) return <main className="publicUnavailable"><h1>Invitación no disponible</h1><p>{error}</p></main>;
  return event ? <><div className="guestRole"><RoleBadge role="guest" /></div><PublicInvitation event={event} /></> : <main className="publicUnavailable"><p>Cargando invitación…</p></main>;
}
