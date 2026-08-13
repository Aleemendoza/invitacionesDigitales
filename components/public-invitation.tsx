"use client";
import "./public-event.css";
import "./public-invitation-premium.css";
import "./agenda-timeline.css";
import "./invitation-section-surfaces.css";
import "./invitation-hero.css";
import "./auto-gallery.css";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { GiftSection } from "@/components/gift-section";
import { AutoGallery } from "@/components/auto-gallery";
import { Icon } from "@/components/icons";
import { SocialPhotosSection } from "@/components/social-photos-section";
import { getCountdown } from "@/lib/countdown";
import type { GiftSectionConfig, SocialPhotoSectionConfig } from "@/lib/event-sections";
import { normalizeTheme, templateTheme, textColor } from "@/lib/event-theme";
import type { StoredEvent } from "@/lib/event-types";
import { templates, type InvitationSection, type SectionVisual } from "@/lib/templates";
import { getYouTubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";
import { hasPlanFeature, type Plan } from "@/lib/event-drafts";
import { closingMessageForEventType } from "@/lib/event-closing";
import type { SectionVisualConfig } from "@/lib/event-sections";
type Section = { kind: string; content: Record<string, unknown> };
const format = (value: number) => String(value).padStart(2, "0");
export function PublicInvitation({ event }: { event: StoredEvent & { event_sections?: Section[] } }) {
  const template = templates.find((item) => item.slug === event.template_slug) ?? templates[0];
  const [countdown, setCountdown] = useState(() => getCountdown(event.starts_at, false));
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const interval = window.setInterval(() => setCountdown(getCountdown(event.starts_at, false)), 1000); return () => window.clearInterval(interval); }, [event.starts_at]);
  const theme = normalizeTheme(event.content.theme, templateTheme(template.theme));
  const style = { "--event-primary": theme.primaryColor, "--event-on-primary": textColor(theme.primaryColor), "--event-accent": theme.accentColor, "--event-on-accent": textColor(theme.accentColor), "--event-background": theme.backgroundColor, "--event-on-background": textColor(theme.backgroundColor), "--event-title": theme.titleColor, "--event-cover": `url(${event.event_media?.[0]?.url || template.coverImage})`, "--event-countdown": `url(${template.countdownImage})` } as CSSProperties;
  const date = event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.starts_at)) : "Fecha a confirmar";
  const gifts = event.event_sections?.find((section) => section.kind === "gifts"); const social = event.event_sections?.find((section) => section.kind === "social_photos");
  const values = countdown.kind === "pending" ? [countdown.days, countdown.hours, countdown.minutes, countdown.seconds] : [0, 0, 0, 0];
  const musicId = event.content.features.includes("music") ? getYouTubeVideoId(event.content.musicUrl) : null;
  const mapQuery = [event.content.venue, event.content.venueAddress].filter(Boolean).join(", "); const mapLink = event.content.mapUrl || (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : "");
  const sectionPhoto = event.event_media?.find((item) => item.position > 0)?.url;
  const mediaUrlByPath = new Map((event.event_media ?? []).map((item) => [item.storage_path, item.url]));
  const compactDate = event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(event.starts_at)) : "";
  const rsvpAvailable = hasPlanFeature(event.plan as Plan, "general-rsvp") && event.rsvp_enabled;
  const rsvpHref = `/e/${event.slug}/rsvp`;
  const panel = (section: InvitationSection) => panelProps(template.sections[section], sectionPhoto, section);
  const rsvpPanel = panel("rsvp");
  return <main className={`publicInvite premiumInvite ${template.theme}`} style={style}>
    <section className="piHero"><div className="piHeroTools"><button aria-label="Abrir menú" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}><Icon name="menu" size={19} /></button>{musicId && <button className={musicPlaying ? "isPlaying" : ""} aria-label={musicPlaying ? "Silenciar música" : "Activar música"} aria-pressed={musicPlaying} onClick={() => setMusicPlaying((current) => !current)}><Icon name={musicPlaying ? "music" : "musicOff"} size={19} /></button>}</div>{menuOpen && rsvpAvailable && <nav className="piHeroMenu" aria-label="Opciones de la invitación"><Link href={rsvpHref}>Confirmar asistencia</Link></nav>}<div className="piHeroCopy"><h1>{event.title}</h1>{compactDate && <time>{compactDate}</time>}</div></section>
    {musicPlaying && musicId && <iframe className="publicMusicPlayer" title="Música del evento" src={youtubeEmbedUrl(musicId)} allow="autoplay; encrypted-media" />}
    <section className="piCountdownCard"><p>Falta muy poco</p><div>{values.map((value, index) => <span key={index}><b>{format(value)}</b><small>{["Días", "Horas", "Minutos", "Segundos"][index]}</small></span>)}</div></section>
    <section className="piDetails" {...panel("details")}><Info icon="calendar" title="¿Cuándo?"><p>{date}<br />{event.starts_at && new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.starts_at))} HS</p></Info><Info icon="pin" title="¿Dónde?"><p>{event.content.venue}<br />{event.content.venueAddress}</p>{mapLink && <a href={mapLink} target="_blank" rel="noreferrer">Ver en mapa</a>}</Info></section>
    {mapLink && <section className="piMap" {...panel("details")}><div><Icon name="pin" /><p className="eyebrow">Cómo llegar</p><strong>{event.content.venue}</strong>{event.content.venueAddress && <span>{event.content.venueAddress}</span>}</div><a href={mapLink} target="_blank" rel="noreferrer">Abrir mapa</a></section>}
    {event.content.message && <section className="piMessage" {...panel("message")}><p className="eyebrow">Un mensaje especial</p><p>{event.content.message}</p></section>}
    {event.content.agenda.length > 0 && <section className="piAgenda" {...panel("agenda")}><header><p className="eyebrow">La noche</p><span>Así se vive cada momento</span></header><ol>{event.content.agenda.map((item, index) => <li key={item.time + "-" + item.title}><AgendaIcon index={index} /><div className="piAgendaDot" /><article><time>{item.time}</time><h2>{item.title}</h2></article></li>)}</ol></section>}
    {event.event_media && event.event_media.length > 1 && <section className="piGallery" {...panel("gallery")}><SectionHeader icon="gallery" label="Galería" /><AutoGallery photos={event.event_media.slice(1)} /></section>}
    {event.content.dressCode && <section className="piDress" {...panel("dress")}><Icon name="dress" className="piDressIcon piDressIconLeft" /><div><small>Vestimenta</small><h2>{event.content.dressCode}</h2><span>Elegí tu mejor look para la ocasión</span></div><Icon name="suit" className="piDressIcon piDressIconRight" /></section>}
    {gifts && <div {...panel("gifts")}><GiftSection slug={event.slug} fallback={gifts.content as GiftSectionConfig} theme={template.theme} photoUrl={mediaUrlByPath.get((gifts.content as GiftSectionConfig).visual?.photoPath ?? "")} /></div>}{social && <div {...panel("social")}><SocialPhotosSection config={social.content as SocialPhotoSectionConfig} theme={template.theme} photoUrl={mediaUrlByPath.get((social.content as SocialPhotoSectionConfig).visual?.photoPath ?? "")} /></div>}
    {rsvpAvailable && <section className="piRsvp sectionSurface" {...rsvpPanel} style={{ ...rsvpPanel.style, ...surfaceStyle(event.content.sectionStyles?.rsvp, mediaUrlByPath) }}><div className="piRsvpCopy"><Icon name="mail" /><div><p className="eyebrow">Asistencia</p><h2>¿Nos acompañás?</h2><p>{event.content.rsvp?.deadline ? `Confirmá antes del ${new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.content.rsvp.deadline))}` : "Tu respuesta es muy importante"}</p></div></div><Link href={rsvpHref}>Confirmar asistencia</Link></section>}
    <footer className="piClosing sectionSurface" style={surfaceStyle(event.content.sectionStyles?.closing, mediaUrlByPath)}><h2>{event.title}</h2><p>{closingMessageForEventType(event.event_type)}</p></footer>
  </main>;
}
function panelProps(visual: SectionVisual, photo: string | undefined, section: InvitationSection) {
  return { "data-section-tone": visual.tone, "data-section-card": visual.card, "data-section": section, style: { "--section-gradient": visual.gradient, "--section-art": `url(${visual.decorativeImage})`, "--section-photo": visual.photoEnabled && photo ? `url(${photo})` : "none" } as CSSProperties };
}
function surfaceStyle(visual?: SectionVisualConfig, mediaUrlByPath?: Map<string, string | undefined>) {
  const photoUrl = (visual?.photoPath && mediaUrlByPath?.get(visual.photoPath)) || visual?.photoUrl;
  return { "--section-custom-bg": visual?.backgroundColor || "transparent", "--section-custom-fg": visual?.textColor || "currentColor", "--section-custom-accent": visual?.accentColor || "var(--event-accent)", "--section-custom-photo": photoUrl ? `url("${photoUrl}")` : "none", "--section-photo-overlay": String((visual?.photoOverlay ?? 55) / 100) } as CSSProperties;
}
function SectionHeader({ icon, label }: { icon: "gallery"; label: string }) { return <header className="piSectionHeader"><Icon name={icon} /><p>{label}</p></header>; }
function Info({ icon, title, children }: { icon: "calendar" | "pin"; title: string; children: React.ReactNode }) { return <article><Icon name={icon} /><h2>{title}</h2>{children}</article>; }
function AgendaIcon({ index }: { index: number }) {
  const kind = index % 6;
  const icons = [
    <><path d="M7 3h3l3 18H8L7 3Zm7 0h3l-1 18h-5l3-18Z" /><path d="M4 10h16M6 15h12" /></>,
    <><path d="M7 3v18M4 3v7a3 3 0 0 0 6 0V3M17 3v18M14 3h6" /></>,
    <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16M6 7.5h12M6 16.5h12M19 4v3m-1.5-1.5h3M5 19v2m-1 1h2" /></>,
    <><path d="M5 18h14M7 18v-6h10v6M9 12V8h6v4M10 8V5a2 2 0 1 1 4 0v3" /><path d="M4 21h16" /></>,
    <><rect x="4" y="6" width="16" height="13" rx="2" /><circle cx="11" cy="12.5" r="3.5" /><circle cx="11" cy="12.5" r="1" /><path d="M17 9v6M16 9h2M16 15h2M18 3v3m-1.5-1.5h3" /></>,
    <><path d="M6 13h12v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-3Z" /><path d="M18 15h1a2 2 0 0 1 0 4h-2M8 9c-1-1-1-2 0-3M12 9c-1-1-1-2 0-3M16 9c-1-1-1-2 0-3" /></>,
  ];
  return <svg className="piAgendaIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[kind]}</svg>;
}
