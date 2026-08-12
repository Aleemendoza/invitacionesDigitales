"use client";
import "./public-event.css";
import "./public-invitation-premium.css";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { GiftSection } from "@/components/gift-section";
import { Icon } from "@/components/icons";
import { SocialPhotosSection } from "@/components/social-photos-section";
import { getCountdown } from "@/lib/countdown";
import type { GiftSectionConfig, SocialPhotoSectionConfig } from "@/lib/event-sections";
import { isTheme, textColor } from "@/lib/event-theme";
import type { StoredEvent } from "@/lib/event-types";
import { templates } from "@/lib/templates";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";
type Section = { kind: string; content: Record<string, unknown> };
const format = (value: number) => String(value).padStart(2, "0");
export function PublicInvitation({ event }: { event: StoredEvent & { event_sections?: Section[] } }) {
  const template = templates.find((item) => item.slug === event.template_slug) ?? templates[0];
  const [countdown, setCountdown] = useState(() => getCountdown(event.starts_at, false));
  const [musicPlaying, setMusicPlaying] = useState(false);
  useEffect(() => { const interval = window.setInterval(() => setCountdown(getCountdown(event.starts_at, false)), 1000); return () => window.clearInterval(interval); }, [event.starts_at]);
  const theme = isTheme(event.content.theme) ? event.content.theme : { primaryColor: "#21191b", accentColor: "#e44f88", fontStyle: "clasica" as const };
  const style = { "--event-primary": theme.primaryColor, "--event-accent": theme.accentColor, "--event-on-accent": textColor(theme.accentColor), "--event-cover": `url(${event.event_media?.[0]?.url || template.coverImage})`, "--event-countdown": `url(${template.countdownImage})` } as CSSProperties;
  const date = event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.starts_at)) : "Fecha a confirmar";
  const gifts = event.event_sections?.find((section) => section.kind === "gifts"); const social = event.event_sections?.find((section) => section.kind === "social_photos");
  const values = countdown.kind === "pending" ? [countdown.days, countdown.hours, countdown.minutes, countdown.seconds] : [0, 0, 0, 0];
  const musicId = event.content.features.includes("music") ? getYouTubeVideoId(event.content.musicUrl) : null;
  const mapQuery = [event.content.venue, event.content.venueAddress].filter(Boolean).join(", "); const mapLink = event.content.mapUrl || (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : "");
  return <main className={`publicInvite premiumInvite ${template.theme}`} style={style}>
    <section className="piHero"><div className="piHeroTools"><button aria-label="Abrir menú"><Icon name="menu" size={19} /></button>{musicId && <button aria-label={musicPlaying ? "Pausar música" : "Activar música"} onClick={() => setMusicPlaying((current) => !current)}><Icon name="music" size={19} /></button>}</div><div className="piHeroCopy"><p>{event.event_type}</p><h1>{event.title}</h1><b>{date}</b></div></section>
    {musicPlaying && musicId && <iframe className="publicMusicPlayer" title="Música del evento" src={youtubeEmbedUrl(musicId)} allow="autoplay; encrypted-media" />}
    <section className="piCountdownCard"><p>Falta muy poco</p><div>{values.map((value, index) => <span key={index}><b>{format(value)}</b><small>{["Días", "Horas", "Minutos", "Segundos"][index]}</small></span>)}</div></section>
    <section className="piDetails"><Info icon="calendar" title="¿Cuándo?"><p>{date}<br />{event.starts_at && new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.starts_at))} HS</p></Info><Info icon="pin" title="¿Dónde?"><p>{event.content.venue}<br />{event.content.venueAddress}</p>{mapLink && <a href={mapLink} target="_blank" rel="noreferrer">Ver en mapa</a>}</Info></section>
    {event.content.message && <section className="piMessage"><p className="eyebrow">Un mensaje especial</p><p>{event.content.message}</p></section>}
    {mapLink && <section className="piMap"><div><Icon name="pin" /><p className="eyebrow">Cómo llegar</p><strong>{event.content.venue}</strong>{event.content.venueAddress && <span>{event.content.venueAddress}</span>}</div><a href={mapLink} target="_blank" rel="noreferrer">Abrir mapa</a></section>}
    {event.content.agenda.length > 0 && <section className="piAgenda"><p className="eyebrow">La noche</p><div>{event.content.agenda.map((item) => <article key={`${item.time}-${item.title}`}><Icon name="timeline" /><b>{item.time}</b><span>{item.title}</span></article>)}</div></section>}
    {event.event_media && event.event_media.length > 1 && <section className="piGallery"><SectionHeader icon="gallery" label="Galería" /><div>{event.event_media.slice(1).map((item, index) => <img key={item.storage_path} src={item.url} alt={`Foto ${index + 1} del evento`} />)}</div></section>}
    {event.content.dressCode && <section className="piDress"><Icon name="dress" className="piDressIcon piDressIconLeft" /><div><small>Vestimenta</small><h2>{event.content.dressCode}</h2><span>Elegí tu mejor look para la ocasión</span></div><Icon name="suit" className="piDressIcon piDressIconRight" /></section>}
    {gifts && <GiftSection slug={event.slug} fallback={gifts.content as GiftSectionConfig} theme={template.theme} />}{social && <SocialPhotosSection config={social.content as SocialPhotoSectionConfig} theme={template.theme} />}
    <section className="piRsvp"><div className="piRsvpCopy"><Icon name="mail" /><div><p className="eyebrow">Asistencia</p><h2>Confirmá tu asistencia</h2><p>{event.content.rsvp?.deadline ? `Confirmá antes del ${new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.content.rsvp.deadline))}` : "Tu respuesta es muy importante"}</p></div></div>{event.rsvp_enabled && <Link href={`/e/${event.slug}/rsvp`}>Confirmar</Link>}</section>
    <footer>{event.content.closingMessage || "Gracias por ser parte de este momento inolvidable"}</footer>
  </main>;
}
function SectionHeader({ icon, label }: { icon: "gallery"; label: string }) { return <header className="piSectionHeader"><Icon name={icon} /><p>{label}</p></header>; }
function Info({ icon, title, children }: { icon: "calendar" | "pin"; title: string; children: React.ReactNode }) { return <article><Icon name={icon} /><h2>{title}</h2>{children}</article>; }
