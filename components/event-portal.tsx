"use client";

import "./event-portal.css";
import "./panels.css";
import "./event-list.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { RoleBadge, useAccountRole } from "@/components/account-role";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { eventDateLabel, type StoredEvent } from "@/lib/event-types";
import { canManageGuests, hasPlanFeature, type Plan } from "@/lib/event-drafts";

type SummaryEvent = StoredEvent & { created_at: string; progress: number; rsvp: { invited: number; confirmed: number; pending: number; declined: number }; event_payments?: { id: string; amount: number; status: string; admin_note?: string; created_at: string }[]; event_plan_upgrades?: { id: string; amount: number; status: string; source_plan: string; target_plan: string; admin_note?: string }[] };

async function authFetch(path: string) {
  const token = (await getBrowserSupabase()?.auth.getSession())?.data.session?.access_token;
  return fetch(path, { headers: { authorization: `Bearer ${token ?? ""}` } });
}

const eventState = (event: SummaryEvent) => event.payment_status === "approved" ? "Publicado" : event.payment_status === "pending" ? "Pago pendiente" : event.payment_status === "rejected" ? "Pago rechazado" : "Borrador";

function OrganizerLink({ href, label, close, exact = false, target }: { href: string; label: string; close: () => void; exact?: boolean; target?: "_blank" }) {
  const pathname = usePathname();
  const active = pathname === href || (!exact && pathname.startsWith(`${href}/`));
  return <Link href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} target={target} onClick={close}>{label}</Link>;
}

export function OrganizerNav({ event }: { event?: StoredEvent }) {
  const { account } = useAccountRole();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const plan = event?.plan as Plan | undefined;
  const close = () => setOpen(false);
  const logout = async () => { try { await getBrowserSupabase()?.auth.signOut(); } finally { close(); router.replace("/"); } };
  const initials = account?.fullName.split(/\s+|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "P";

  return <><header className="siteHeader organizerHeader">
    <Link className="brand" href="/mis-eventos" onClick={close}>Papeleta<span>✦</span></Link>
    <button className="siteMenuToggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="organizer-navigation" aria-label={open ? "Cerrar menú" : "Abrir menú"}><span /><span /><span /></button>
    <nav id="organizer-navigation" className={open ? "open" : ""} aria-label="Navegación del organizador">
      <OrganizerLink href="/mis-eventos" label="Mis eventos" close={close} exact />
      {!event && <><OrganizerLink href="/crear" label="Crear invitación" close={close} /><OrganizerLink href="/plantillas" label="Plantillas" close={close} /><OrganizerLink href="/precios" label="Precios" close={close} /></>}
      {event && <>
        <OrganizerLink href={`/eventos/${event.id}`} label="Resumen" close={close} exact />
        <OrganizerLink href={`/eventos/${event.id}/editar`} label="Editar invitación" close={close} />
        {plan && canManageGuests(plan) && <OrganizerLink href={`/eventos/${event.id}/invitados`} label="Invitados" close={close} />}
        {plan && hasPlanFeature(plan, "general-rsvp") && <OrganizerLink href={`/eventos/${event.id}/rsvp`} label="Confirmaciones" close={close} />}
        <OrganizerLink href={`/eventos/${event.id}/vista-previa`} label="Vista previa" close={close} />
        {event.payment_status === "approved" && <OrganizerLink href={`/e/${event.slug}`} label="Ver invitación ↗" close={close} target="_blank" />}
      </>}
      {account?.role === "admin" && <OrganizerLink href="/admin/pagos" label="Administración" close={close} />}
      {account && <div className={`accountMenu ${account.role}`}><div className="accountProfile"><span className="accountAvatar" aria-hidden="true">{initials}</span><div className="accountIdentity"><span>{account.role === "admin" ? "Administrador" : "Organizador"}</span><b title={account.fullName}>{account.fullName}</b></div></div><button type="button" onClick={() => void logout()}>Cerrar sesión</button></div>}
    </nav>
  </header><OrganizerMobileNav event={event} /></>;
}

function OrganizerMobileNav({ event }: { event?: StoredEvent }) {
  const pathname = usePathname();
  const items = event ? [
    { href: `/eventos/${event.id}`, label: "Resumen", icon: "timeline" as const },
    { href: `/eventos/${event.id}/invitados`, label: "Invitados", icon: "users" as const },
    { href: `/eventos/${event.id}/rsvp`, label: "Confirmar", icon: "rsvp" as const },
    { href: `/eventos/${event.id}/vista-previa`, label: "Vista previa", icon: "sparkles" as const },
  ] : [
    { href: "/mis-eventos", label: "Mis eventos", icon: "timeline" as const },
    { href: "/crear", label: "Crear", icon: "plus" as const },
    { href: "/plantillas", label: "Plantillas", icon: "sparkles" as const },
    { href: "/precios", label: "Planes", icon: "check" as const },
  ];
  return <nav className="organizerMobileNav" aria-label="Accesos rápidos del organizador">{items.map((item) => <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}><Icon name={item.icon} size={17} /><span>{item.label}</span></Link>)}</nav>;
}

export function EventsPortal() {
  const { account, error: roleError } = useAccountRole();
  const [events, setEvents] = useState<SummaryEvent[]>([]);
  const [notice, setNotice] = useState("Cargando tus eventos…");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  useEffect(() => { void authFetch("/api/organizer/overview").then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setEvents(body.events); setNotice(""); }).catch(reason => setNotice(reason instanceof Error ? reason.message : "No pudimos cargar tus eventos.")); }, []);
  const ordered = useMemo(() => events.filter(event => (filter === "all" || event.payment_status === filter) && event.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "date" ? String(a.starts_at ?? "").localeCompare(String(b.starts_at ?? "")) : sort === "progress" ? b.progress - a.progress : String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))), [events, query, filter, sort]);
  const latest = useMemo(() => [...events].sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")))[0], [events]);

  return <main className="panelShell">
    <OrganizerNav />
    <header className="panelTop"><div><p className="eyebrow">{account?.role === "admin" ? "PANEL DE ADMINISTRADOR" : "PANEL DE ORGANIZADOR"}</p><h1>Tus celebraciones</h1><p>Todo lo importante de cada invitación, ordenado para que avances sin perder tiempo.</p></div><div className="panelTopActions">{account && <RoleBadge role={account.role} />}<Link className="button pink" href="/crear">Crear invitación</Link></div></header>
    {(roleError || notice) && <p className="notice">{roleError || notice}</p>}
    {latest ? <Featured event={latest} /> : !notice && <div className="panelCard emptyState"><b>Tu próxima celebración empieza acá.</b><span>Creá una invitación y te ayudaremos a prepararla paso a paso.</span><Link className="button pink" href="/crear">Crear invitación</Link></div>}
    <section className="metricsGrid">{[[events.length, "Eventos"], [events.filter(event => event.payment_status === "approved").length, "Publicados"], [events.reduce((total, event) => total + event.rsvp.confirmed, 0), "Confirmados"], [events.reduce((total, event) => total + event.rsvp.pending, 0), "Respuestas pendientes"]].map(([value, label]) => <Metric value={value as number} label={label as string} key={label as string} />)}</section>
    <section className="adminSection"><h2>Todos tus eventos</h2><div className="filters"><input placeholder="Buscar celebración" value={query} onChange={event => setQuery(event.target.value)} /><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todos los estados</option><option value="unpaid">Borradores</option><option value="pending">Pago pendiente</option><option value="approved">Publicados</option></select><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Más recientes</option><option value="date">Fecha del evento</option><option value="progress">Mayor progreso</option></select></div><div className="eventCatalog">{ordered.map(event => <EventRow event={event} key={event.id} />)}{!ordered.length && !notice && <div className="panelCard emptyState"><b>No encontramos eventos.</b><span>Probá otro nombre o filtro.</span></div>}</div></section>
  </main>;
}

function Featured({ event }: { event: SummaryEvent }) {
  const cta = event.payment_status === "approved" ? { href: `/eventos/${event.id}/invitados`, label: "Gestionar invitados" } : event.payment_status === "pending" ? { href: `/eventos/${event.id}`, label: "Ver estado del pago" } : event.progress < 80 ? { href: `/eventos/${event.id}/editar`, label: "Completar invitación" } : { href: `/eventos/${event.id}/vista-previa`, label: "Revisar y publicar" };
  return <section className="panelCard featureEvent"><div className="featureEventContent"><p className="eyebrow">ÚLTIMO EVENTO AGREGADO</p><h2>{event.title}</h2><p>{eventDateLabel(event)} · {event.content.venue || "Lugar a confirmar"}</p><span className={`paymentBadge ${event.payment_status}`}>{eventState(event)}</span><div className="progressBar"><span style={{ width: `${event.progress}%` }} /></div><small>{event.progress}% de configuración completada · {event.rsvp.confirmed}/{event.rsvp.invited} confirmados</small></div><Link className="button dark" href={cta.href}>{cta.label}</Link></section>;
}

function EventRow({ event }: { event: SummaryEvent }) {
  return <article className="eventRow"><div className="eventRowMain"><span className={`paymentBadge ${event.payment_status}`}>{eventState(event)}</span><h3>{event.title}</h3><p>{eventDateLabel(event)} · {event.content.venue || "Lugar a confirmar"}</p></div><div className="eventRowStats"><b>{event.rsvp.confirmed}/{event.rsvp.invited}</b><p>Confirmados · {event.rsvp.pending} pendientes</p></div><div className="eventRowProgress"><div className="progressBar"><span style={{ width: `${event.progress}%` }} /></div><p>{event.progress}% configurado</p></div><div className="eventRowActions"><Link className="button outline" href={`/eventos/${event.id}`}>Abrir panel</Link>{event.payment_status === "approved" && <Link className="textLink" href={`/e/${event.slug}`} target="_blank">Ver invitación ↗</Link>}</div></article>;
}

export function EventDashboard({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<SummaryEvent>(); const [notice, setNotice] = useState("Cargando evento…");
  useEffect(() => { void authFetch("/api/organizer/overview").then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); const item = body.events.find((candidate: SummaryEvent) => candidate.id === eventId); if (!item) throw new Error("Evento no encontrado."); setEvent(item); setNotice(""); }).catch(reason => setNotice(reason instanceof Error ? reason.message : "No pudimos cargar el evento.")); }, [eventId]);
  if (!event) return <main className="panelShell"><p>{notice}</p></main>;
  return <main className="panelShell"><OrganizerNav event={event} /><header className="panelTop"><div><p className="eyebrow">RESUMEN DEL EVENTO</p><h1>{event.title}</h1><p>{eventDateLabel(event)} · {event.content.venue || "Lugar a confirmar"}</p></div><span className={`paymentBadge ${event.payment_status}`}>{eventState(event)}</span></header><section className="metricsGrid"><Metric value={`${event.progress}%`} label="Configuración" /><Metric value={event.rsvp.invited} label="Invitados" /><Metric value={event.rsvp.confirmed} label="Confirmados" /><Metric value={event.rsvp.pending} label="Pendientes" /></section><section className="panelGrid"><article className="panelCard"><h2>Próximos pasos</h2><div className="actionList"><Link href={`/eventos/${event.id}/editar`}>Editar contenido y diseño</Link><Link href={`/eventos/${event.id}/invitados`}>Gestionar invitados y enlaces</Link><Link href={`/eventos/${event.id}/rsvp`}>Revisar RSVP</Link><Link href={`/eventos/${event.id}/vista-previa`}>{event.payment_status === "approved" ? "Ver invitación publicada" : "Vista previa y publicación"}</Link></div></article><History event={event} /></section></main>;
}

function Metric({ value, label }: { value: string | number; label: string }) { return <article className="metricCard"><b>{value}</b><span>{label}</span></article>; }
function History({ event }: { event: SummaryEvent }) { const activity = [...(event.event_payments ?? []).map(item => ({ key: `p${item.id}`, text: `Pago ${item.status}`, amount: item.amount, note: item.admin_note })), ...(event.event_plan_upgrades ?? []).map(item => ({ key: `u${item.id}`, text: `Mejora ${item.source_plan} → ${item.target_plan} (${item.status})`, amount: item.amount, note: item.admin_note }))]; return <article className="panelCard"><h2>Pagos y mejoras</h2>{activity.length ? <div className="actionList">{activity.map(item => <div key={item.key}><b>{item.text}</b><p>{item.amount.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}{item.note ? ` · ${item.note}` : ""}</p></div>)}</div> : <p className="notice">Todavía no hay operaciones para este evento.</p>}</article>; }
