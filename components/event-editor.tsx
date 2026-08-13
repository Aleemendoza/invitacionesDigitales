"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./event-editor-section-controls.css";
import { Header } from "@/components/papeleta";
import { EventInvitationPreview } from "@/components/event-invitation-preview";
import { ThemeControls } from "@/components/theme-controls";
import { defaultAgenda, defaultFeatures, hasPlanFeature, planDetails, plans, type EventDraftInput, type Plan } from "@/lib/event-drafts";
import type { GiftSectionConfig, SectionVisualConfig, SocialPhotoSectionConfig } from "@/lib/event-sections";
import { normalizeTheme, templateTheme } from "@/lib/event-theme";
import { GIFT_MESSAGE, SOCIAL_PHOTOS_MESSAGE } from "@/lib/invitation-copy";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { templates } from "@/lib/templates";

const blankGift: GiftSectionConfig = {
  enabled: false, title: "Regalos", message: GIFT_MESSAGE, type: "bank_transfer", protectedDetails: true,
  accounts: [{ accountHolderFullName: "", accountAlias: "", bankName: "", accountType: "", cbuOrCvu: "", currency: "ARS", additionalNote: "" }],
};

const blankSocial: SocialPhotoSectionConfig = {
  enabled: false, title: "Fotos sociales", description: SOCIAL_PHOTOS_MESSAGE, socialType: "instagram_handle", socialValue: "", showCopyButton: true,
};

function toDraft(event: any): EventDraftInput {
  const date = event.starts_at ? new Date(event.starts_at) : null;
  const template = templates.find((item) => item.slug === event.template_slug) ?? templates[0];
  const storedSections = Object.fromEntries((event.event_sections ?? []).map((section: any) => [section.kind, { ...section.content, enabled: section.enabled }])) as Record<string, unknown>;
  return {
    title: event.title,
    eventType: event.event_type,
    date: date?.toISOString().slice(0, 10) ?? "",
    time: date?.toISOString().slice(11, 16) ?? "",
    venue: event.content.venue ?? "",
    venueAddress: event.content.venueAddress ?? "",
    mapUrl: event.content.mapUrl ?? "",
    closingMessage: event.content.closingMessage ?? "",
    templateSlug: event.template_slug,
    plan: event.plan,
    step: 7,
    agenda: event.content.agenda?.length ? event.content.agenda : defaultAgenda(),
    features: event.content.features ?? [],
    message: event.content.message ?? "",
    dressCode: event.content.dressCode ?? "",
    musicUrl: event.content.musicUrl ?? "",
    theme: normalizeTheme(event.content.theme, templateTheme(template.theme)),
    rsvp: event.content.rsvp ?? { enabled: event.rsvp_enabled ?? true, deadline: event.rsvp_deadline?.slice(0, 16) ?? "", accessMode: event.guest_access_mode ?? "name_lookup", questions: [] },
    sectionStyles: event.content.sectionStyles ?? {},
    sections: {
      gifts: { ...blankGift, ...(storedSections.gifts as Partial<GiftSectionConfig> | undefined) },
      socialPhotos: { ...blankSocial, ...(storedSections.social_photos as Partial<SocialPhotoSectionConfig> | undefined) },
    },
  };
}

function DeadlineFields({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const [date = "", time = ""] = (value ?? "").split("T");
  const updateDate = (next: string) => onChange(next ? `${next}T${time || "20:00"}` : "");
  const updateTime = (next: string) => onChange(date ? `${date}T${next || "20:00"}` : "");
  return <div className="deadlineFields">
    <label>Fecha límite<input type="date" value={date} onChange={(item) => updateDate(item.currentTarget.value)} /></label>
    <label>Hora límite<input type="time" value={time} onChange={(item) => updateTime(item.currentTarget.value)} /></label>
  </div>;
}

function SectionVisualControls({ label, value, photos, onChange }: { label: string; value?: SectionVisualConfig; photos: { path: string; url: string }[]; onChange: (next: SectionVisualConfig) => void }) {
  const visual = value ?? {};
  return <fieldset className="sectionVisualControls"><legend>Diseño de {label}</legend><div className="fieldPair"><label>Fondo<input type="color" value={visual.backgroundColor ?? "#21191b"} onChange={(event) => onChange({ ...visual, backgroundColor: event.currentTarget.value })} /></label><label>Texto<input type="color" value={visual.textColor ?? "#ffffff"} onChange={(event) => onChange({ ...visual, textColor: event.currentTarget.value })} /></label><label>Acento<input type="color" value={visual.accentColor ?? "#e44f88"} onChange={(event) => onChange({ ...visual, accentColor: event.currentTarget.value })} /></label></div><label>Foto de fondo<select value={visual.photoPath ?? ""} onChange={(event) => { const photo = photos.find((item) => item.path === event.currentTarget.value); onChange({ ...visual, photoPath: photo?.path, photoUrl: photo?.url }); }}><option value="">Sin foto</option>{photos.map((photo, index) => <option key={photo.path} value={photo.path}>Imagen {index + 1}</option>)}</select></label>{visual.photoPath && <label>Oscurecer foto ({visual.photoOverlay ?? 55}%)<input type="range" min="0" max="90" value={visual.photoOverlay ?? 55} onChange={(event) => onChange({ ...visual, photoOverlay: Number(event.currentTarget.value) })} /></label>}<p className="editorHint">Usá las imágenes que ya subiste para la invitación. Cada sección conserva sus colores y foto propios.</p></fieldset>;
}

export function EventEditor({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<any>();
  const [draft, setDraft] = useState<EventDraftInput>();
  const [notice, setNotice] = useState("Cargando evento…");
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = async () => (await getBrowserSupabase()?.auth.getSession())?.data.session?.access_token;

  const load = async () => {
    const access = await token();
    if (!access) return setNotice("Iniciá sesión para editar este evento.");
    const response = await fetch(`/api/events/${eventId}/draft`, { headers: { authorization: `Bearer ${access}` } });
    const body = await response.json();
    if (!response.ok) return setNotice(body.error ?? "No pudimos cargar el evento.");
    setEvent(body.event);
    setDraft(toDraft(body.event));
    setNotice("");
  };

  useEffect(() => { void load(); }, [eventId]);

  const update = <K extends keyof EventDraftInput>(key: K, value: EventDraftInput[K]) => setDraft((current) => current ? { ...current, [key]: value } : current);
  const updateAgenda = (index: number, field: "time" | "title", value: string) => draft && update("agenda", draft.agenda.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const updateGift = (next: GiftSectionConfig) => update("sections", { ...draft?.sections, gifts: next });
  const updateSocial = (next: SocialPhotoSectionConfig) => update("sections", { ...draft?.sections, socialPhotos: next });

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const response = await fetch(`/api/events/${eventId}/draft`, {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${await token()}` },
      body: JSON.stringify(draft),
    });
    const body = await response.json();
    setNotice(response.ok ? "Cambios guardados." : body.error ?? "No pudimos guardar los cambios.");
    setSaving(false);
    if (response.ok) void load();
  };

  const checkout = async () => {
    setPaying(true);
    setNotice("");
    try {
      const response = await fetch(`/api/events/${eventId}/checkout`, { method: "POST", headers: { "content-type":"application/json", authorization: `Bearer ${await token()}` }, body: JSON.stringify({ plan: draft?.plan }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos iniciar el pago.");
      window.location.assign(body.checkoutUrl);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No pudimos iniciar el pago.");
      setPaying(false);
    }
  };

  const requestUpgrade = async (targetPlan: Plan) => {
    if (!event || targetPlan === event.plan) return;
    const currentTemplate = templates.find((template) => template.slug === draft?.templateSlug);
    const compatibleTemplate = templates.find((template) => template.plan === targetPlan && template.category === currentTemplate?.category);
    if (!compatibleTemplate) { setNotice(`No hay una plantilla ${planDetails[targetPlan].name} para este tipo de evento.`); return; }
    if (event.payment_status !== "approved") { update("plan", targetPlan); update("templateSlug", compatibleTemplate.slug); update("theme", templateTheme(compatibleTemplate.theme)); update("features", defaultFeatures(targetPlan)); return; }
    const response = await fetch(`/api/events/${eventId}/upgrade`, { method:"POST", headers:{"content-type":"application/json",authorization:`Bearer ${await token()}`}, body:JSON.stringify({targetPlan}) });
    const body = await response.json(); if (!response.ok) return setNotice(body.error ?? "No pudimos solicitar la actualización.");
    const target=planDetails[targetPlan]; const current=planDetails[event.plan as Plan];
    const message=`Hola, quiero actualizar mi invitación “${event.title}” (${event.slug}) de ${current.name} a ${target.name}. El saldo informado es $${body.upgrade.amount.toLocaleString("es-AR")}. Solicitud: ${body.upgrade.id}`;
    window.open(`https://wa.me/5493886145245?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer"); setNotice("Solicitud registrada. Enviá el mensaje por WhatsApp para coordinar el pago.");
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 5);
    const access = await token();
    if (!access) return setNotice("Iniciá sesión para subir imágenes.");
    setUploading(true);
    const form = new FormData();
    selected.forEach((file) => form.append("photos", file));
    const response = await fetch(`/api/events/${eventId}/media`, { method: "POST", headers: { authorization: `Bearer ${access}` }, body: form });
    const body = await response.json();
    setUploading(false);
    if (!response.ok) return setNotice(body.error ?? "No pudimos subir las imágenes.");
    setNotice(`${selected.length} imagen${selected.length === 1 ? " subida" : "es subidas"}.`);
    void load();
  };

  if (!event || !draft) return <main className="appPage"><p>{notice}</p></main>;

  const gift = draft.sections?.gifts ?? blankGift;
  const social = draft.sections?.socialPhotos ?? blankSocial;
  const account = gift.accounts[0] ?? blankGift.accounts[0];
  const rsvp = draft.rsvp!;
  const template = templates.find((item) => item.slug === draft.templateSlug) ?? templates[0];
  const photos = event.event_media?.map((item: any) => item.url ?? "").filter(Boolean) ?? [];
  const photoOptions = event.event_media?.filter((item: any) => item.storage_path && item.url).map((item: any) => ({ path: item.storage_path, url: item.url })) ?? [];
  const preview = {
    title: draft.title,
    event_type: draft.eventType,
    starts_at: draft.date && draft.time ? new Date(`${draft.date}T${draft.time}:00-03:00`).toISOString() : null,
    template_slug: draft.templateSlug,
    content: { venue: draft.venue, venueAddress: draft.venueAddress, mapUrl: draft.mapUrl, closingMessage: draft.closingMessage, wizard_step: 7, features: draft.features, agenda: draft.agenda, message: draft.message, dressCode: draft.dressCode, musicUrl: draft.musicUrl, theme: draft.theme, rsvp, sectionStyles: draft.sectionStyles },
    sections: draft.sections,
    photos,
  };

  return <main className="editorPage">
    <Header app />
    <div className="editorContextBar"><b>/{event.slug}</b><Link className="button outline" href={`/e/${event.slug}`}>Ver enlace público</Link></div>
    <div className="editorWorkspace">
      <section className="editorForm">
        <p className="eyebrow">Configuración del evento</p><h1>{draft.title}</h1>
        <section className="box"><b>Plan: {planDetails[draft.plan].name}</b><p>{event.payment_status==="approved"?"Para subir de plan se calcula el saldo y lo coordinás por WhatsApp.":"Podés cambiar de plan antes de publicar."}</p><select value={draft.plan} onChange={item=>void requestUpgrade(item.currentTarget.value as Plan)}>{plans.map(plan=><option key={plan} value={plan} disabled={event.payment_status==="approved"&&plan===event.plan}>{planDetails[plan].name} — ${planDetails[plan].price.toLocaleString("es-AR")}</option>)}</select></section>
        <h3>Identidad</h3>
        <label>Título<input value={draft.title} onChange={(item) => update("title", item.currentTarget.value)} /></label>
        <label>Tipo de evento<input value={draft.eventType} onChange={(item) => update("eventType", item.currentTarget.value)} /></label>
        <div className="fieldPair"><label>Fecha<input type="date" value={draft.date} onChange={(item) => update("date", item.currentTarget.value)} /></label><label>Hora<input type="time" value={draft.time} onChange={(item) => update("time", item.currentTarget.value)} /></label></div>
        <ThemeControls value={draft.theme!} defaults={templateTheme(template.theme)} onChange={(theme) => update("theme", theme)} />

        <h3>Portada y galería</h3>
        <p className="editorHint">La primera imagen es la portada. Las siguientes aparecen en la galería de tu invitación.</p>
        <label className="galleryUploader">{uploading ? "Subiendo imágenes…" : "Agregar imágenes"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} onChange={(item) => void uploadGallery(item.currentTarget.files)} /></label>
        {photos.length > 0 ? <div className="galleryGrid">{photos.map((photo: string, index: number) => <figure key={`${photo}-${index}`}><img src={photo} alt={index === 0 ? "Portada actual" : `Imagen de galería ${index}`} /><figcaption>{index === 0 ? "Portada" : `Galería ${index}`}</figcaption></figure>)}</div> : <p className="editorEmpty">Todavía no cargaste imágenes. Se usarán las imágenes de la plantilla.</p>}

        <h3>Información para tus invitados</h3>
        <label>Mensaje de bienvenida<textarea value={draft.message ?? ""} onChange={(item) => update("message", item.currentTarget.value)} /></label>
        <label>Lugar<input value={draft.venue} onChange={(item) => update("venue", item.currentTarget.value)} /></label>
        <label>Dirección<input value={draft.venueAddress ?? ""} onChange={(item) => update("venueAddress", item.currentTarget.value)} /></label>
        <label>Enlace de Google Maps<input type="url" value={draft.mapUrl ?? ""} placeholder="https://maps.google.com/..." onChange={(item) => update("mapUrl", item.currentTarget.value)} /></label>
        <div className="fixedCopy"><b>Mensaje final según el tipo de evento</b><p>La invitación mostrará una despedida fija adaptada al tipo de celebración.</p></div>

        <SectionVisualControls label="mensaje final" value={draft.sectionStyles?.closing} photos={photoOptions} onChange={(closing) => update("sectionStyles", { ...draft.sectionStyles, closing })} />

        <h3>Agenda</h3>
        {draft.agenda.map((item, index) => <div className="editorAgenda" key={`${index}-${item.time}`}><input aria-label={`Hora del momento ${index + 1}`} type="time" value={item.time} onChange={(next) => updateAgenda(index, "time", next.currentTarget.value)} /><input aria-label={`Nombre del momento ${index + 1}`} value={item.title} onChange={(next) => updateAgenda(index, "title", next.currentTarget.value)} /></div>)}
        <button className="textButton" type="button" onClick={() => update("agenda", [...draft.agenda, { time: "", title: "" }])}>+ Agregar momento</button>

        <h3>Vestimenta y música</h3>
        <label>Vestimenta<input placeholder="Ej.: Elegante sport" value={draft.dressCode ?? ""} onChange={(item) => update("dressCode", item.currentTarget.value)} /></label>
        {hasPlanFeature(draft.plan, "music") && <label>Música de YouTube<input type="url" placeholder="https://www.youtube.com/watch?v=..." value={draft.musicUrl ?? ""} onChange={(item) => update("musicUrl", item.currentTarget.value)} /></label>}

        <SectionVisualControls label="confirmación" value={draft.sectionStyles?.rsvp} photos={photoOptions} onChange={(rsvpStyle) => update("sectionStyles", { ...draft.sectionStyles, rsvp: rsvpStyle })} />

        <h3>Regalos</h3>
        <label className="switch"><span>Activar regalos</span><input type="checkbox" checked={gift.enabled} onChange={(item) => updateGift({ ...gift, enabled: item.currentTarget.checked })} /></label>
        {gift.enabled && <><label>Título<input value={gift.title} onChange={(item) => updateGift({ ...gift, title: item.currentTarget.value })} /></label><label>Mensaje<textarea value={gift.message} onChange={(item) => updateGift({ ...gift, message: item.currentTarget.value })} /></label><label>Titular<input value={account.accountHolderFullName} onChange={(item) => updateGift({ ...gift, accounts: [{ ...account, accountHolderFullName: item.currentTarget.value }] })} /></label><label>Alias<input value={account.accountAlias} onChange={(item) => updateGift({ ...gift, accounts: [{ ...account, accountAlias: item.currentTarget.value }] })} /></label><label>CBU/CVU<input inputMode="numeric" value={account.cbuOrCvu ?? ""} onChange={(item) => updateGift({ ...gift, accounts: [{ ...account, cbuOrCvu: item.currentTarget.value }] })} /></label><SectionVisualControls label="regalos" value={gift.visual} photos={photoOptions} onChange={(visual) => updateGift({ ...gift, visual })} /></>}

        <h3>Fotos sociales</h3>
        <label className="switch"><span>Activar bloque social</span><input type="checkbox" checked={social.enabled} onChange={(item) => updateSocial({ ...social, enabled: item.currentTarget.checked })} /></label>
        {social.enabled && <><label>Título<input value={social.title} onChange={(item) => updateSocial({ ...social, title: item.currentTarget.value })} /></label><label>Mensaje<textarea value={social.description} onChange={(item) => updateSocial({ ...social, description: item.currentTarget.value })} /></label><label>Usuario o hashtag<input placeholder="@usuario o #hashtag" value={social.socialValue} onChange={(item) => updateSocial({ ...social, socialValue: item.currentTarget.value })} /></label><label>Texto del botón<input value={social.ctaLabel ?? ""} placeholder="Ver Instagram" onChange={(item) => updateSocial({ ...social, ctaLabel: item.currentTarget.value })} /></label><SectionVisualControls label="Instagram" value={social.visual} photos={photoOptions} onChange={(visual) => updateSocial({ ...social, visual })} /></>}

        {hasPlanFeature(draft.plan, "general-rsvp") && <><h3>RSVP</h3>
        <label className="switch"><span>Activar RSVP</span><input type="checkbox" checked={rsvp.enabled} onChange={(item) => update("rsvp", { ...rsvp, enabled: item.currentTarget.checked })} /></label>
        <DeadlineFields value={rsvp.deadline} onChange={(deadline) => update("rsvp", { ...rsvp, deadline })} />
        <label>Acceso<select value={rsvp.accessMode} onChange={(item) => update("rsvp", { ...rsvp, accessMode: item.currentTarget.value as typeof rsvp.accessMode })}><option value="name_lookup">Búsqueda por nombre</option><option value="name_and_code">Nombre y código</option></select></label></>}
        <div className="editorPaymentActions"><button className="button dark" type="button" disabled={saving || paying} onClick={() => void save()}>{saving ? "Guardando…" : "Guardar cambios"}</button>{event.payment_status === "approved" ? <Link className="button pink" href={`/e/${event.slug}`} target="_blank">Ver invitación publicada</Link> : event.payment_status === "pending" ? <button className="button outline" type="button" disabled>Pago en verificación</button> : <button className="button pink" type="button" disabled={saving || paying} onClick={() => void checkout()}>{paying ? "Abriendo Mercado Pago…" : `Pagar y publicar — $${planDetails[draft.plan].price.toLocaleString("es-AR")} →`}</button>}</div><p className="wizardNotice">{notice}</p>
      </section>
      <EventInvitationPreview event={preview} />
    </div>
  </main>;
}
