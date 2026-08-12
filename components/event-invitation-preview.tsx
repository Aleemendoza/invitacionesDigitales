"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { getCountdown } from "@/lib/countdown";
import { normalizeTheme, templateTheme, textColor } from "@/lib/event-theme";
import type { EventContent, EventSections, StoredEvent } from "@/lib/event-types";
import { GIFT_MESSAGE, SOCIAL_PHOTOS_MESSAGE } from "@/lib/invitation-copy";
import { templates, type InvitationSection, type SectionVisual } from "@/lib/templates";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";
import "./event-invitation-preview.css";

export type InvitationPreviewData = Pick<StoredEvent, "title" | "event_type" | "starts_at" | "template_slug"> & {
  content: EventContent;
  photos?: string[];
  sections?: EventSections;
};

function Countdown({ startsAt, image, preview }: { startsAt: string | null; image: string; preview: boolean }) {
  const [state, setState] = useState(() => getCountdown(startsAt, preview));
  useEffect(() => {
    const id = window.setInterval(() => setState(getCountdown(startsAt, preview)), 1000);
    return () => window.clearInterval(id);
  }, [startsAt, preview]);

  if (state.kind !== "pending") {
    return <section className="eventCountdown" style={{ "--countdown-image": `url(${image})` } as CSSProperties}>
      <p>{state.kind === "missing" ? "Cuenta regresiva" : "Hoy es el día"}</p>
      <strong>{state.kind === "missing" ? <>Elegí fecha y hora<br />para activarla.</> : <>¡Llegó el momento<br />de celebrar!</>}</strong>
    </section>;
  }

  return <section className="eventCountdown" style={{ "--countdown-image": `url(${image})` } as CSSProperties}>
    <p>Falta muy poco</p>
    <div>{[[state.days, "Días"], [state.hours, "Hs"], [state.minutes, "Min"], [state.seconds, "Seg"]].map(([value, label]) => <span key={String(label)}><b>{String(value).padStart(2, "0")}</b><small>{label}</small></span>)}</div>
  </section>;
}

export function EventInvitationPreview({ event, label = "Vista previa", plan, onCheckout = () => window.location.assign("/precios"), onEdit = () => window.scrollTo({ top: 0, behavior: "smooth" }) }: { event: InvitationPreviewData; label?: string; plan?: "Essential" | "Plus" | "Premium"; onCheckout?: () => void; onEdit?: () => void }) {
  const template = templates.find((item) => item.slug === event.template_slug) ?? templates[0];
  const photos = event.photos?.filter(Boolean) ?? [];
  const cover = photos[0] || template.coverImage;
  const theme = normalizeTheme(event.content.theme, templateTheme(template.theme));
  const [music, setMusic] = useState(false);
  const musicId = event.content.features.includes("music") ? getYouTubeVideoId(event.content.musicUrl) : null;
  const date = event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.starts_at)) : "Fecha a confirmar";
  const preview = label.length > 0;
  const price = (plan ?? template.plan) === "Premium" ? 25000 : (plan ?? template.plan) === "Plus" ? 20000 : 15000;
  const mapQuery = [event.content.venue, event.content.venueAddress].filter(Boolean).join(", ");
  const mapLink = event.content.mapUrl || (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : "");
  const social = event.sections?.socialPhotos;
  const socialValue = social?.socialValue ? (social.socialValue.startsWith("@") || social.socialValue.startsWith("#") ? social.socialValue : `@${social.socialValue}`) : "";
  const panel = (section: InvitationSection) => previewPanelProps(template.sections[section], photos[1], section);
  const style = {
    "--cover-image": `url(${cover})`,
    "--theme-primary": theme.primaryColor,
    "--theme-on-primary": textColor(theme.primaryColor),
    "--theme-accent": theme.accentColor,
    "--theme-on-accent": textColor(theme.accentColor),
    "--theme-background": theme.backgroundColor,
    "--theme-on-background": textColor(theme.backgroundColor),
    "--theme-font": theme.fontStyle === "princesa" ? "cursive" : theme.fontStyle === "refinada" ? "Georgia,serif" : "var(--serif)",
  } as CSSProperties;

  return <aside className="invitationPreview" style={style}>
    <span>{label}</span>
    <div className="phoneFrame"><div className="phoneScreen"><div className={`eventInvitation ${template.theme}`}>
      <section className="eventCover">{musicId && <button className={`musicToggle ${music ? "isPlaying" : ""}`} aria-label={music ? "Silenciar música" : "Activar música"} aria-pressed={music} onClick={() => setMusic((current) => !current)}><Icon name={music ? "music" : "musicOff"} size={18} /></button>}<div><small>{event.event_type}</small><h2>{event.title || "Tu celebración"}</h2></div></section>
      {music && musicId && <iframe className="musicPlayer" title="Música" src={youtubeEmbedUrl(musicId)} allow="autoplay; encrypted-media" />}
      <Countdown startsAt={event.starts_at} image={template.countdownImage} preview={preview} />
      {event.content.message && <section {...panel("message")}><p className="eyebrow">Un mensaje especial</p><p>{event.content.message}</p></section>}
      <section {...panel("details")}><p className="eyebrow">Cuándo y dónde</p><strong>{date}</strong><span>{event.content.venue || "Lugar a confirmar"}</span>{event.content.venueAddress && <span>{event.content.venueAddress}</span>}{mapLink && <a href={mapLink} target="_blank" rel="noreferrer">Ver mapa y cómo llegar</a>}</section>
      {event.content.agenda.length > 0 && <section {...panel("agenda")}><p className="eyebrow">Agenda</p><div className="invitationAgenda">{event.content.agenda.map((item) => <p key={`${item.time}-${item.title}`}><b>{item.time}</b><span>{item.title}</span></p>)}</div></section>}
      {photos.length > 1 && <section {...panel("gallery")}><p className="eyebrow">Galería</p><div className="invitationGallery">{photos.slice(1).map((photo, index) => <img alt={`Foto ${index + 1} de la galería`} key={`${photo}-${index}`} src={photo} />)}</div></section>}
      {event.content.dressCode && <section {...panel("dress")}><p className="eyebrow">Vestimenta</p><strong>{event.content.dressCode}</strong></section>}
      {event.sections?.gifts?.enabled && <section {...panel("gifts")}><p className="eyebrow">Regalos</p><p>{GIFT_MESSAGE}</p><button type="button">Ver datos del regalo</button></section>}
      {social?.enabled && <section {...panel("social")}><p className="eyebrow">Fotos sociales</p><p>{SOCIAL_PHOTOS_MESSAGE}</p>{socialValue && <strong>{socialValue}</strong>}</section>}
      {event.content.rsvp?.enabled !== false && <section {...panel("rsvp")}><p className="eyebrow">RSVP</p><h3>Confirmá tu asistencia</h3><button>Confirmar asistencia</button></section>}
      {preview && <section className="previewCheckout"><p className="eyebrow">¿Te gusta cómo quedó?</p><button onClick={onCheckout}>Publicar — ${price.toLocaleString("es-AR")} →</button><button className="previewEdit" onClick={onEdit}>← Editar invitación</button></section>}
    </div></div></div>
  </aside>;
}
function previewPanelProps(visual: SectionVisual, photo: string | undefined, section: InvitationSection) {
  const baseClass = { message: "invitationMessage", details: "invitationWhere", agenda: "invitationAgendaPanel", gallery: "invitationGalleryPanel", dress: "invitationDress", gifts: "invitationGift", social: "invitationSocial", rsvp: "invitationRsvp" }[section];
  return { className: `${baseClass} previewPanel previewPanel--${visual.tone}`, style: { "--section-gradient": visual.gradient, "--section-art": `url(${visual.decorativeImage})`, "--section-photo": visual.photoEnabled && photo ? `url(${photo})` : "none" } as CSSProperties };
}
