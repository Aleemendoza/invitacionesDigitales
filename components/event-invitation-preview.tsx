"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { getCountdown } from "@/lib/countdown";
import type { EventContent, StoredEvent } from "@/lib/event-types";
import { templates } from "@/lib/templates";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";
import { defaultTheme, isTheme, textColor } from "@/lib/event-theme";

export type InvitationPreviewData = Pick<StoredEvent, "title" | "event_type" | "starts_at" | "template_slug"> & { content: EventContent; photos?: string[] };

type ImageTone = "light" | "dark";
type InvitationCopy = { storyLabel: string; gifts: string; rsvpTitle: string; rsvpButton: string };
function invitationCopy(eventType: string, title: string): InvitationCopy {
  const copies: Record<string, InvitationCopy> = {
    Boda: { storyLabel: "NUESTRA HISTORIA", gifts: "Tu presencia es el mejor regalo para nosotros.", rsvpTitle: "¿Nos acompañás?", rsvpButton: "Confirmar asistencia" },
    XV: { storyLabel: "MI NOCHE", gifts: "Tu presencia es el mejor regalo para mí.", rsvpTitle: "¿Me acompañás a festejar?", rsvpButton: "Confirmar asistencia" },
    Cumpleaños: { storyLabel: "MI FESTEJO", gifts: "Lo mejor es celebrarlo con vos.", rsvpTitle: "¿Venís a festejar conmigo?", rsvpButton: "Confirmar asistencia" },
    Infantil: { storyLabel: "LA FIESTA", gifts: "Tu presencia hará aún más especial este día.", rsvpTitle: `¿Acompañás a ${title || "quien festeja"}?`, rsvpButton: "Confirmar asistencia" },
    "Baby Shower": { storyLabel: "UNA DULCE ESPERA", gifts: "Nos hace muy felices compartir este momento con vos.", rsvpTitle: "¿Nos acompañás a celebrar esta espera?", rsvpButton: "Confirmar asistencia" },
    Corporativo: { storyLabel: "EL EVENTO", gifts: "Tu participación hace que este encuentro sea posible.", rsvpTitle: "¿Vas a asistir?", rsvpButton: "Confirmar asistencia" },
  };
  return copies[eventType] ?? copies.Boda;
}
function useImageTone(source: string): ImageTone {
  const [tone, setTone] = useState<ImageTone>("dark");
  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        if (!cancelled) setTone(red * 0.2126 + green * 0.7152 + blue * 0.0722 > 155 ? "light" : "dark");
      } catch { if (!cancelled) setTone("dark"); }
    };
    image.onerror = () => !cancelled && setTone("dark");
    image.src = source;
    return () => { cancelled = true; };
  }, [source]);
  return tone;
}

function Countdown({ startsAt, image, privatePreview }: { startsAt: string | null; image: string; privatePreview: boolean }) {
  const [state, setState] = useState(() => getCountdown(startsAt, privatePreview));
  const tone = useImageTone(image);
  useEffect(() => { setState(getCountdown(startsAt, privatePreview)); const timer = window.setInterval(() => setState(getCountdown(startsAt, privatePreview)), 1_000); return () => window.clearInterval(timer); }, [startsAt, privatePreview]);
  return <section className={`eventCountdown tone-${tone}`} style={{ "--countdown-image": `url(${image})` } as CSSProperties}>{state.kind === "pending" ? <><p>FALTA MUY POCO</p><div aria-live="polite" aria-label={`${state.days} días, ${state.hours} horas, ${state.minutes} minutos y ${state.seconds} segundos restantes`}>{[[state.days, "DÍAS"], [state.hours, "HS"], [state.minutes, "MIN"], [state.seconds, "SEG"]].map(([value, label]) => <span key={String(label)}><b>{String(value).padStart(2, "0")}</b><small>{label}</small></span>)}</div></> : state.kind === "missing" ? <><p>CUENTA REGRESIVA</p><strong>Elegí fecha y hora<br />para activarla.</strong></> : <><p>HOY ES EL DÍA</p><strong>¡Llegó el momento<br />de celebrar!</strong></>}</section>;
}

export function EventInvitationPreview({ event, label = "Vista previa", plan, onCheckout = () => window.location.assign("/precios"), onEdit = () => window.scrollTo({ top: 0, behavior: "smooth" }) }: { event: InvitationPreviewData; label?: string; plan?: "Essential" | "Plus" | "Premium"; onCheckout?: () => void; onEdit?: () => void }) {
  const template = templates.find(item => item.slug === event.template_slug) ?? templates[0];
  const cover = event.photos?.[0] || template.coverImage;
  const theme = isTheme(event.content.theme) ? event.content.theme : defaultTheme;
  useEffect(() => { const root = document.documentElement; root.style.setProperty("--theme-primary", theme.primaryColor); root.style.setProperty("--theme-accent", theme.accentColor); root.style.setProperty("--theme-on-primary", textColor(theme.primaryColor)); root.style.setProperty("--theme-on-accent", textColor(theme.accentColor)); root.style.setProperty("--theme-font", theme.fontStyle === "princesa" ? "cursive" : theme.fontStyle === "refinada" ? "Georgia,serif" : "var(--serif)"); }, [theme.primaryColor, theme.accentColor, theme.fontStyle]);
  const coverTone = useImageTone(cover);
  const copy = invitationCopy(event.event_type, event.title);
  const musicVideoId = event.content.features.includes("music") ? getYouTubeVideoId(event.content.musicUrl) : null;
  const [musicPlaying, setMusicPlaying] = useState(false);
  const date = event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.starts_at)) : "Fecha a confirmar";
  const privatePreview = label.length > 0;
  const selectedPlan = plan ?? template.plan;
  const price = selectedPlan === "Premium" ? 25000 : selectedPlan === "Plus" ? 20000 : 15000;
  return <aside className="invitationPreview"><span>{label}</span><div className="phoneFrame"><div className="phoneScreen"><div className={`eventInvitation ${template.theme}`}><section className={`eventCover tone-${coverTone}`} style={{ backgroundImage: `url(${cover})` }}><div><small>{event.event_type}</small><h2>{event.title || "Tu celebración"}</h2><b>{date}</b><span>{event.content.venue || "Lugar a confirmar"}</span>{musicVideoId && <button className="musicToggle" type="button" aria-pressed={musicPlaying} onClick={() => setMusicPlaying(current => !current)}>{musicPlaying ? "❚❚ Pausar música" : "▶ Activar música"}</button>}</div></section>{musicPlaying && musicVideoId && <iframe className="musicPlayer" title="Música de la invitación" src={youtubeEmbedUrl(musicVideoId)} allow="autoplay; encrypted-media" /> }<Countdown startsAt={event.starts_at} image={template.countdownImage} privatePreview={privatePreview} />{event.content.message && <section><p className="eyebrow">{copy.storyLabel}</p><p>{event.content.message}</p></section>}<section><p className="eyebrow">AGENDA</p><div className="invitationAgenda">{event.content.agenda.map(item => <p key={`${item.time}-${item.title}`}><b>{item.time}</b><span>{item.title}</span></p>)}</div></section>{event.content.features.includes("map") && <section><p className="eyebrow">UBICACIÓN</p><p>{event.content.venue || "Ubicación a confirmar"}</p></section>}{event.content.features.includes("dress-code") && <section><p className="eyebrow">DRESS CODE</p><p>{event.content.dressCode || "Vestimenta a confirmar"}</p></section>}{event.content.features.includes("gifts") && <section><p className="eyebrow">REGALOS</p><p>{copy.gifts}</p></section>}{event.content.features.includes("gallery") && event.photos?.slice(1).length ? <section><p className="eyebrow">GALERÍA</p><div className="invitationGallery">{event.photos.slice(1).map((photo, index) => <img src={photo} alt={`Foto ${index + 2} del evento`} key={photo} />)}</div></section> : null}<section className="invitationRsvp"><p className="eyebrow">RSVP</p><h3>{copy.rsvpTitle}</h3><button type="button">{copy.rsvpButton}</button></section>{privatePreview && <><section className="previewCheckout"><p className="eyebrow">¿TE GUSTA CÓMO QUEDÓ?</p><h3>Activá tu invitación y obtené tu link para compartir.</h3><button type="button" onClick={onCheckout}>Publicar — ${price.toLocaleString("es-AR")} →</button><button className="previewEdit" type="button" onClick={onEdit}>← Editar invitación</button></section><footer className="previewFooter"><a href="https://wa.me/5491100000000" target="_blank" rel="noreferrer">◉ ¿Dudas? Escribinos</a><a href="mailto:hola@celebra.app">hola@celebra.app</a></footer></>}</div></div></div></aside>;
}
