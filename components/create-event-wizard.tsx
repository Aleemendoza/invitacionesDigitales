"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventInvitationPreview } from "@/components/event-invitation-preview";
import { ThemeControls } from "@/components/theme-controls";
import { WizardHeader } from "@/components/wizard-header";
import { defaultAgenda, defaultFeatures, planDetails, plans, type EventDraftInput, type Plan } from "@/lib/event-drafts";
import { defaultTheme, normalizeTheme, templateTheme, type EventTheme } from "@/lib/event-theme";
import { clearPendingEventDraft, readPendingEventDraft, savePendingEventDraft } from "@/lib/pending-event-draft";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { templates, type Template } from "@/lib/templates";
import { prepareImageUpload } from "@/lib/image-upload";

type Draft = EventDraftInput & { theme: EventTheme };
type Photo = { file: File; preview: string };

const initial: Draft = { title: "", eventType: "", date: "", time: "", venue: "", venueAddress: "", mapUrl: "", closingMessage: "", templateSlug: "", plan: "standard", step: 0, agenda: defaultAgenda(), features: defaultFeatures("standard"), message: "", dressCode: "", musicUrl: "", theme: defaultTheme };
const types = ["Boda", "XV", "Cumpleaños", "Infantil", "Baby Shower", "Corporativo"];
const options = () => templates;
const planBenefits: Record<Plan, string[]> = {
  standard: ["Portada personalizada", "Agenda, mapa y regalos", "Sin confirmaciones de asistencia"],
  premium: ["Galería y música", "RSVP dentro de la invitación", "Exportación de respuestas"],
  premium_plus: ["Todo Premium", "Invitaciones individuales", "Álbum QR y trivia"],
};

export function CreateEventWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [draft, setDraft] = useState<Draft>(initial);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [planChosen, setPlanChosen] = useState(false);
  const submittingRef = useRef(false);
  const resume = params.get("resume") === "1";

  useEffect(() => {
    void (async () => {
      try {
        if (resume) {
          const pending = await readPendingEventDraft();
          if (pending) {
            const pendingTemplate = templates.find((item) => item.slug === pending.draft.templateSlug) ?? templates[0];
            setDraft({ ...pending.draft, theme: normalizeTheme(pending.draft.theme, templateTheme(pendingTemplate.theme)) } as Draft);
            setPlanChosen(true);
            setPhotos(pending.photos.map((file) => ({ file, preview: URL.createObjectURL(file) })));
            setNotice("Recuperamos tu borrador para que puedas guardarlo.");
          }
        } else await clearPendingEventDraft();
      } catch { if (resume) setNotice("No pudimos recuperar el borrador anterior."); }
      finally { setReady(true); }
    })();
  }, [resume]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const choosePlan = (plan: Plan) => { const previewTemplate = templates.find((item) => item.plan === plan) ?? templates[0]; setPlanChosen(true); setDraft((current) => ({ ...current, plan, eventType: "", templateSlug: "", features: defaultFeatures(plan), theme: templateTheme(previewTemplate.theme) })); };
  const chooseType = (eventType: string) => {
    const template = options()[0];
    if (!template) return;
    setDraft((current) => ({ ...current, eventType, templateSlug: template.slug, features: defaultFeatures(current.plan), theme: templateTheme(template.theme) }));
  };
  const chooseTemplate = (template: Template) => setDraft((current) => ({ ...current, templateSlug: template.slug, features: defaultFeatures(current.plan), theme: templateTheme(template.theme) }));
  const valid = () => draft.step === 0 ? planChosen : draft.step === 1 ? Boolean(draft.eventType) : draft.step === 2 ? draft.title.trim().length > 1 : draft.step === 3 ? Boolean(draft.date && draft.time) : draft.step === 4 ? draft.venue.trim().length > 1 : draft.step === 5 ? draft.agenda.length > 0 && draft.agenda.every((item) => item.time && item.title.trim()) : draft.step === 6 ? Boolean(draft.templateSlug) : draft.step === 7 ? photos.length > 0 : true;
  const next = () => { if (!valid()) return setNotice("Completá este paso para continuar."); setNotice(""); update("step", Math.min(8, draft.step + 1)); };
  const submit = async () => {
    if (submittingRef.current || saving) return;
    if (!valid()) return setNotice("Completá este paso para crear el evento.");
    submittingRef.current = true;
    const session = (await getBrowserSupabase()?.auth.getSession())?.data.session;
    if (!session) { try { await savePendingEventDraft({ draft, photos: photos.map((item) => item.file) }); router.push(`/login?next=${encodeURIComponent("/crear?resume=1")}`); } finally { submittingRef.current = false; } return; }
    setSaving(true);
    let createdEventId: string | undefined;
    try {
      const response = await fetch("/api/events/drafts", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(draft) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      createdEventId = body.event.id;
      if (photos.length) {
        for (const photo of photos) {
          const form = new FormData(); form.append("photos", photo.file);
          const media = await fetch(`/api/events/${body.event.id}/media`, { method: "POST", headers: { authorization: `Bearer ${session.access_token}` }, body: form });
          if (!media.ok) throw new Error("El evento se creó, pero falló la carga de una foto.");
        }
      }
      await clearPendingEventDraft(); router.replace(`/eventos/${body.event.id}/editar`);
    } catch (error) {
      if (createdEventId) { await clearPendingEventDraft(); router.replace(`/eventos/${createdEventId}/editar?media=error`); return; }
      setNotice(error instanceof Error ? error.message : "No pudimos crear el evento.");
    } finally { setSaving(false); submittingRef.current = false; }
  };

  if (!ready) return null;
  const selectedTemplate = templates.find((item) => item.slug === draft.templateSlug) ?? templates.find((item) => item.plan === draft.plan) ?? templates[0];
  const preview = { title: draft.title, event_type: draft.eventType, starts_at: draft.date && draft.time ? new Date(`${draft.date}T${draft.time}:00-03:00`).toISOString() : null, template_slug: selectedTemplate.slug, content: { venue: draft.venue, venueAddress: draft.venueAddress, mapUrl: draft.mapUrl, closingMessage: draft.closingMessage, wizard_step: draft.step, features: draft.features, agenda: draft.agenda, message: draft.message, dressCode: draft.dressCode, musicUrl: draft.musicUrl, theme: draft.theme }, photos: photos.map((photo) => photo.preview) };
  const heading = ["Elegí tu plan.", "¿Qué vamos a celebrar?", "Contanos quiénes son los protagonistas.", "¿Cuándo empieza?", "¿Dónde se encuentran?", "¿Cuál es la agenda?", "Elegí una plantilla.", "Subí tus fotos.", "Últimos detalles."][draft.step];
  return <main><WizardHeader /><div className="progress"><span>Paso {draft.step + 1} de 9</span><progress value={draft.step + 1} max="9" /></div><section className="wizard photoWizard"><div className="wizardPanel"><p className="eyebrow">Tu celebración</p><h1>{heading}</h1><Fields draft={draft} photos={photos} update={update} choosePlan={choosePlan} chooseType={chooseType} chooseTemplate={chooseTemplate} setPhotos={setPhotos} />{draft.step === 8 && <ThemeControls value={draft.theme} defaults={templateTheme(selectedTemplate.theme)} onChange={(theme) => update("theme", theme)} />}{notice && <p className="wizardNotice">{notice}</p>}<div className="wizardActions"><button className="button outline" disabled={!draft.step || saving} onClick={() => update("step", draft.step - 1)}>Volver</button><button className="button dark" disabled={saving} onClick={draft.step === 8 ? submit : next}>{saving ? "Guardando…" : draft.step === 8 ? "Crear mi evento" : "Continuar →"}</button></div></div><EventInvitationPreview event={preview} plan={draft.plan} /></section></main>;
}

function Fields({ draft, photos, update, choosePlan, chooseType, chooseTemplate, setPhotos }: { draft: Draft; photos: Photo[]; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; choosePlan: (plan: Plan) => void; chooseType: (value: string) => void; chooseTemplate: (value: Template) => void; setPhotos: (value: Photo[]) => void }) {
  const editAgenda = (index: number, field: "time" | "title", value: string) => update("agenda", draft.agenda.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  if (draft.step === 0) return <div className="planPicker">{plans.map((plan) => <button className={draft.plan === plan ? "selected" : ""} onClick={() => choosePlan(plan)} key={plan}><b>{planDetails[plan].name}</b><strong>${planDetails[plan].price.toLocaleString("es-AR")}</strong><ul>{planBenefits[plan].map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></button>)}</div>;
  if (draft.step === 1) return <div className="choices">{types.map((type) => <button className={draft.eventType === type ? "selected" : ""} onClick={() => chooseType(type)} key={type}>✦<br />{type}</button>)}</div>;
  if (draft.step === 2) return <><label>Nombre o título<input value={draft.title} onChange={(event) => update("title", event.currentTarget.value)} /></label><label>Mensaje de bienvenida<textarea placeholder="Unas palabras para quienes reciban tu invitación" value={draft.message ?? ""} onChange={(event) => update("message", event.currentTarget.value)} /></label></>;
  if (draft.step === 3) return <div className="fieldPair"><label>Fecha<input type="date" value={draft.date} onChange={(event) => update("date", event.currentTarget.value)} /></label><label>Hora<input type="time" value={draft.time} onChange={(event) => update("time", event.currentTarget.value)} /></label></div>;
  if (draft.step === 4) return <><label>Lugar<input value={draft.venue} onChange={(event) => update("venue", event.currentTarget.value)} /></label><label>Dirección<input placeholder="Ej.: Av. Libertador 1234, Palermo" value={draft.venueAddress ?? ""} onChange={(event) => update("venueAddress", event.currentTarget.value)} /></label><label>Enlace de Google Maps (opcional)<input type="url" placeholder="https://maps.google.com/..." value={draft.mapUrl ?? ""} onChange={(event) => update("mapUrl", event.currentTarget.value)} /></label></>;
  if (draft.step === 5) return <div className="agendaEditor">{draft.agenda.map((item, index) => <div key={`${index}-${item.time}`}><input type="time" value={item.time} onChange={(event) => editAgenda(index, "time", event.currentTarget.value)} /><input value={item.title} onChange={(event) => editAgenda(index, "title", event.currentTarget.value)} />{draft.agenda.length > 1 && <button type="button" aria-label="Eliminar momento" onClick={() => update("agenda", draft.agenda.filter((_, itemIndex) => itemIndex !== index))}>×</button>}</div>)}<button type="button" className="textButton" onClick={() => update("agenda", [...draft.agenda, { time: "", title: "" }])}>+ Agregar otro momento</button></div>;
  if (draft.step === 6) return <div className="templatePicker">{options().map((template) => <button className={draft.templateSlug === template.slug ? "selected" : ""} onClick={() => chooseTemplate(template)} key={template.slug}><span className="templateThumb" style={{ backgroundImage: `url(${template.coverImage})` }} /><b>{template.name}</b><small>{template.style}</small></button>)}</div>;
  if (draft.step === 7) return <PhotoPicker photos={photos} setPhotos={setPhotos} plan={draft.plan} />;
  return <div className="wizardDetails"><p>Completá los detalles que quieras mostrar. También vas a poder editarlos después desde tu panel.</p>{draft.features.includes("dress-code") && <label>Vestimenta<input placeholder="Ej.: Elegante sport" value={draft.dressCode ?? ""} onChange={(event) => update("dressCode", event.currentTarget.value)} /></label>}{draft.features.includes("music") && <label>Música (enlace de YouTube)<input type="url" placeholder="https://www.youtube.com/watch?v=..." value={draft.musicUrl ?? ""} onChange={(event) => update("musicUrl", event.currentTarget.value)} /></label>}<label>Mensaje de cierre<input placeholder="Ej.: Gracias por ser parte de este momento" value={draft.closingMessage ?? ""} onChange={(event) => update("closingMessage", event.currentTarget.value)} /></label></div>;
}

function PhotoPicker({ photos, setPhotos, plan }: { photos: Photo[]; setPhotos: (value: Photo[]) => void; plan: Plan }) {
  const [error, setError] = useState("");
  const maxPhotos = planDetails[plan].galleryLimit ?? 10;
  const choose = async (event: ChangeEvent<HTMLInputElement>) => { try { setError(""); const files = Array.from(event.currentTarget.files ?? []).filter((file) => file.type.startsWith("image/")).slice(0, maxPhotos - photos.length); const prepared = await Promise.all(files.map(prepareImageUpload)); const added = prepared.map((file) => ({ file, preview: URL.createObjectURL(file) })); setPhotos([...photos, ...added]); } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos preparar la imagen."); } finally { event.currentTarget.value = ""; } };
  return <div className="photoUploader"><p>{plan === "standard" ? "Subí una foto para la portada." : `Podés subir hasta ${maxPhotos} fotos.`}</p>{photos.length < maxPhotos && <label className="upload">{photos.length ? "Agregar fotos" : "Elegir fotos"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choose} /></label>}{error && <p className="wizardNotice">{error}</p>}<div className="photoThumbs">{photos.map((photo, index) => <figure key={photo.preview}><img src={photo.preview} alt={`Foto ${index + 1}`} /><button onClick={() => setPhotos(photos.filter((item) => item !== photo))}>×</button></figure>)}</div></div>;
}
