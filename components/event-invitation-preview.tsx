"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { getCountdown } from "@/lib/countdown";
import { defaultTheme, isTheme, textColor } from "@/lib/event-theme";
import type { EventContent, StoredEvent } from "@/lib/event-types";
import { templates } from "@/lib/templates";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";
import "./event-invitation-preview.css";

export type InvitationPreviewData = Pick<StoredEvent, "title" | "event_type" | "starts_at" | "template_slug"> & { content: EventContent; photos?: string[] };

function Countdown({ startsAt, image, preview }: { startsAt: string | null; image: string; preview: boolean }) {
  const [state, setState] = useState(() => getCountdown(startsAt, preview));
  useEffect(() => { const id = window.setInterval(() => setState(getCountdown(startsAt, preview)), 1000); return () => window.clearInterval(id); }, [startsAt, preview]);
  return <section className="eventCountdown" style={{ "--countdown-image": `url(${image})` } as CSSProperties}>{state.kind === "pending" ? <><p>Falta muy poco</p><div>{[[state.days, "Días"], [state.hours, "Hs"], [state.minutes, "Min"], [state.seconds, "Seg"]].map(([value, label]) => <span key={String(label)}><b>{String(value).padStart(2, "0")}</b><small>{label}</small></span>)}</div></> : <><p>{state.kind === "missing" ? "Cuenta regresiva" : "Hoy es el día"}</p><strong>{state.kind === "missing" ? <>Elegí fecha y hora<br />para activarla.</> : <>¡Llegó el momento<br />de celebrar!</>}</strong></>}</section>;
}

export function EventInvitationPreview({ event, label = "Vista previa", plan, onCheckout = () => window.location.assign("/precios"), onEdit = () => window.scrollTo({ top: 0, behavior: "smooth" }) }: { event: InvitationPreviewData; label?: string; plan?: "Essential" | "Plus" | "Premium"; onCheckout?: () => void; onEdit?: () => void }) {
  const template = templates.find((item) => item.slug === event.template_slug) ?? templates[0];
  const cover = event.photos?.[0] || template.coverImage;
  const theme = isTheme(event.content.theme) ? event.content.theme : defaultTheme;
  const [music, setMusic] = useState(false);
  const musicId = event.content.features.includes("music") ? getYouTubeVideoId(event.content.musicUrl) : null;
  const date = event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.starts_at)) : "Fecha a confirmar";
  const preview = label.length > 0;
  const price = (plan ?? template.plan) === "Premium" ? 25000 : (plan ?? template.plan) === "Plus" ? 20000 : 15000;
  const mapQuery = [event.content.venue, event.content.venueAddress].filter(Boolean).join(", ");
  const mapLink = event.content.mapUrl || (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : "");
  const style = { "--cover-image": `url(${cover})`, "--theme-primary": theme.primaryColor, "--theme-accent": theme.accentColor, "--theme-on-accent": textColor(theme.accentColor), "--theme-font": theme.fontStyle === "princesa" ? "cursive" : theme.fontStyle === "refinada" ? "Georgia,serif" : "var(--serif)" } as CSSProperties;

  return <aside className="invitationPreview" style={style}><span>{label}</span><div className="phoneFrame"><div className="phoneScreen"><div className={`eventInvitation ${template.theme}`}><section className="eventCover"><div><small>{event.event_type}</small><h2>{event.title || "Tu celebración"}</h2><b>{date}</b><span>{event.content.venue || "Lugar a confirmar"}</span>{musicId && <button className="musicToggle" onClick={() => setMusic((current) => !current)}>{music ? "Pausar música" : "Activar música"}</button>}</div></section>{music && musicId && <iframe className="musicPlayer" title="Música" src={youtubeEmbedUrl(musicId)} allow="autoplay; encrypted-media" />}<Countdown startsAt={event.starts_at} image={template.countdownImage} preview={preview} />{event.content.message && <section className="invitationMessage"><p className="eyebrow">Un mensaje especial</p><p>{event.content.message}</p></section>}<section className="invitationWhere"><p className="eyebrow">Ubicación</p><strong>{event.content.venue || "Lugar a confirmar"}</strong>{event.content.venueAddress && <span>{event.content.venueAddress}</span>}{mapLink && <a href={mapLink} target="_blank" rel="noreferrer">Ver mapa y cómo llegar</a>}</section><section><p className="eyebrow">Agenda</p><div className="invitationAgenda">{event.content.agenda.map((item) => <p key={`${item.time}-${item.title}`}><b>{item.time}</b><span>{item.title}</span></p>)}</div></section>{event.content.dressCode && <section className="invitationDress"><p className="eyebrow">Vestimenta</p><strong>{event.content.dressCode}</strong></section>}<section className="invitationRsvp"><p className="eyebrow">RSVP</p><h3>Confirmá tu asistencia</h3><button>Confirmar asistencia</button></section>{preview && <section className="previewCheckout"><p className="eyebrow">¿Te gusta cómo quedó?</p><button onClick={onCheckout}>Publicar — ${price.toLocaleString("es-AR")} →</button><button className="previewEdit" onClick={onEdit}>← Editar invitación</button></section>}</div></div></div></aside>;
}
