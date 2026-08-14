"use client";

import "./guests-manager.css";
import "./guests-manager-layout.css";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { OrganizerNav } from "@/components/event-portal";
import { Icon } from "@/components/icons";
import type { StoredEvent } from "@/lib/event-types";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Member = { id: string; name: string; attending: boolean | null; foodPreference: string | null };
type Guest = { id: string; display_name: string; seats: number; status: string; confirmed_seats: number | null; members?: Member[] };
type EventInfo = Pick<StoredEvent, "id" | "slug" | "title" | "event_type" | "payment_status">;
type InviteLink = { url: string; code: string };

function celebrationType(value: string | undefined) {
  const normalized = value?.trim().toLocaleLowerCase("es-AR");
  const labels: Record<string, string> = {
    boda: "casamiento",
    xv: "festejo de 15 años",
    cumpleaños: "cumpleaños",
    infantil: "evento infantil",
    "baby shower": "baby shower",
    corporativo: "evento corporativo",
  };
  return labels[normalized ?? ""] ?? normalized ?? "celebración";
}

async function api(path: string, init?: RequestInit) {
  const token = (await getBrowserSupabase()?.auth.getSession())?.data.session?.access_token;
  return fetch(path, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}`, ...(init?.headers ?? {}) } });
}

export function GuestsManager({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventInfo>(); const [guests, setGuests] = useState<Guest[]>([]); const [name, setName] = useState(""); const [seats, setSeats] = useState(1); const [notice, setNotice] = useState("Cargando invitados…"); const [busy, setBusy] = useState(false); const [links, setLinks] = useState<Record<string, InviteLink>>({}); const [editing, setEditing] = useState<Guest>();
  const load = useCallback(async () => { try { const response = await api(`/api/events/${eventId}/guests`); const body = await response.json(); if (!response.ok) throw new Error(body.error); setGuests(body.guests); setEvent({ id: eventId, slug: body.eventSlug, title: body.eventTitle, event_type: body.eventType, payment_status: body.paymentStatus }); setNotice(""); } catch (error) { setNotice(error instanceof Error ? error.message : "No pudimos cargar los invitados."); } }, [eventId]);
  useEffect(() => { void load(); }, [load]);
  const save = async (submitEvent: FormEvent) => { submitEvent.preventDefault(); setBusy(true); try { const response = await api(`/api/events/${eventId}/guests`, { method: editing ? "PATCH" : "POST", body: JSON.stringify(editing ? { guestId: editing.id, name, seats } : { name, seats }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setName(""); setSeats(1); setEditing(undefined); await load(); } catch (error) { setNotice(error instanceof Error ? error.message : "No pudimos guardar el invitado."); } finally { setBusy(false); } };
  const remove = async (id: string) => { if (!confirm("¿Eliminar este invitado y su enlace?")) return; setBusy(true); try { const response = await api(`/api/events/${eventId}/guests?guestId=${id}`, { method: "DELETE" }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setGuests((current) => current.filter((guest) => guest.id !== id)); } catch (error) { setNotice(error instanceof Error ? error.message : "No pudimos eliminar el invitado."); } finally { setBusy(false); } };
  const issue = async (id: string) => { setBusy(true); try { const response = await api(`/api/events/${eventId}/guests/${id}/link`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setLinks((current) => ({ ...current, [id]: body })); } catch (error) { setNotice(error instanceof Error ? error.message : "No pudimos generar el enlace."); } finally { setBusy(false); } };
  const inviteMessage = (guest: Guest, link: InviteLink) => {
    const invitation = guest.seats > 1 ? "Están invitados" : "Estás invitado/a";
    return `¡Hola, ${guest.display_name}!\n\n${invitation} al ${celebrationType(event?.event_type)} de *${event?.title ?? "nuestra celebración"}*.\n\nTu tarjeta digital:\n${link.url}\n\nCódigo de acceso: *${link.code}*\n\n¡Te esperamos!`;
  };
  const copy = async (guest: Guest, link: InviteLink) => { await navigator.clipboard.writeText(inviteMessage(guest, link)); setNotice("Mensaje copiado, listo para enviar."); };
  const paid = event?.payment_status === "approved";
  return <main className="appPage guestManager"><OrganizerNav event={event as StoredEvent} /><section className="guestIntro"><div><p className="eyebrow">INVITADOS</p><h1>Tu lista, bajo control.</h1><p>Creá grupos, asigná cupos y enviá una invitación personal a cada uno.</p></div><div className="guestMetric"><Icon name="users" /><b>{guests.length}</b><span>grupos</span></div></section>{!paid && <div className="guestGate"><Icon name="link" /><div><b>{event?.payment_status === "pending" ? "Pago en verificación" : "Los enlaces se habilitan al publicar"}</b><span>Podés preparar tu lista ahora.</span></div><Link href={`/eventos/${eventId}/vista-previa`}>Publicar</Link></div>}<form className="guestForm" onSubmit={save}><div className="formTitle"><Icon name={editing ? "edit" : "plus"} /><b>{editing ? "Editar invitado" : "Agregar invitado"}</b>{editing && <button type="button" onClick={() => { setEditing(undefined); setName(""); setSeats(1); }}>Cancelar</button>}</div><label>Nombre o grupo<input value={name} onChange={(input) => setName(input.target.value)} placeholder="Ej.: Familia Pérez" maxLength={120} required /></label><label>Cupos<select value={seats} onChange={(input) => setSeats(+input.target.value)}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{index + 1} {index ? "personas" : "persona"}</option>)}</select></label><button className="button dark" disabled={busy}><Icon name={editing ? "check" : "plus"} size={17} />{editing ? "Guardar cambios" : "Agregar"}</button></form>{notice && <p className="guestNotice" role="status">{notice}</p>}<section className="guestList">{guests.length === 0 ? <div className="emptyGuests"><Icon name="users" size={32} /><b>Tu lista está vacía</b><span>Agregá el primer grupo para empezar.</span></div> : guests.map((guest) => <GuestCard key={guest.id} guest={guest} link={links[guest.id]} paid={paid} onEdit={() => { setEditing(guest); setName(guest.display_name); setSeats(guest.seats); }} onDelete={() => void remove(guest.id)} onIssue={() => void issue(guest.id)} onCopy={() => links[guest.id] && void copy(guest, links[guest.id])} message={links[guest.id] ? inviteMessage(guest, links[guest.id]) : ""} />)}</section><MenuSummary guests={guests} /></main>;
}

function GuestCard({ guest, link, paid, onEdit, onDelete, onIssue, onCopy, message }: { guest: Guest; link?: InviteLink; paid: boolean; onEdit: () => void; onDelete: () => void; onIssue: () => void; onCopy: () => void; message: string }) {
  const selections = guest.members?.filter((member) => member.attending && member.foodPreference) ?? [];
  return <article className="guestCard"><div className="guestCardTop"><div className="guestAvatar">{guest.display_name.slice(0, 1)}</div><div><b>{guest.display_name}</b><span className={`guestStatus ${guest.status}`}>{guest.status === "confirmed" ? "Confirmado" : guest.status === "declined" ? "No asiste" : "Pendiente"}</span></div><div className="guestSeats"><Icon name="users" size={16} /><b>{guest.confirmed_seats ?? 0}/{guest.seats}</b></div></div>{selections.length > 0 && <div className="guestMenus"><b>Menú confirmado</b>{selections.map((member) => <span key={member.id}>{member.name}<em>{member.foodPreference}</em></span>)}</div>}<div className="guestCardActions"><button onClick={onEdit}><Icon name="edit" />Editar</button>{paid ? link ? <><button onClick={onCopy}><Icon name="copy" />Copiar mensaje</button><a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"><Icon name="share" />WhatsApp</a><button onClick={onIssue}><Icon name="link" />Regenerar</button></> : <button className="primaryAction" onClick={onIssue}><Icon name="link" />Generar enlace</button> : <span className="locked"><Icon name="link" />Al publicar</span>}<button className="danger" onClick={onDelete} aria-label="Eliminar"><Icon name="trash" /></button></div>{link && <div className="guestLink"><span><b>Código</b>{link.code}</span><a href={link.url} target="_blank" rel="noreferrer">{link.url}</a></div>}</article>;
}

function MenuSummary({ guests }: { guests: Guest[] }) {
  const rows = guests.flatMap((guest) => (guest.members ?? []).filter((member) => member.attending && member.foodPreference).map((member) => ({ ...member, group: guest.display_name })));
  const totals = ["Tradicional", "Vegetariana", "Vegana"].map((menu) => [menu, rows.filter((row) => row.foodPreference === menu).length] as const);
  return <section className="menuSummary"><p className="eyebrow">SERVICIO DE CATERING</p><h2>Menú confirmado</h2><div className="menuTotals">{totals.map(([menu, total]) => <article key={menu}><b>{total}</b><span>{menu}</span></article>)}</div>{rows.length > 0 ? <div className="menuTable"><div><b>Invitado</b><b>Grupo</b><b>Plato</b></div>{rows.map((row) => <div key={row.id}><span>{row.name}</span><span>{row.group}</span><strong>{row.foodPreference}</strong></div>)}</div> : <p className="menuEmpty">Las elecciones de menú aparecerán aquí cuando los invitados confirmen.</p>}</section>;
}
