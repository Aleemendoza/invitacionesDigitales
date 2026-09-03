"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AgendaStepEditor } from "@/components/agenda-step-editor";
import { EventInvitationPreview } from "@/components/event-invitation-preview";
import { GooglePlacePicker } from "@/components/google-place-picker";
import { ThemeControls } from "@/components/theme-controls";
import { WizardHeader } from "@/components/wizard-header";
import { defaultAgenda, defaultFeatures, hasPlanFeature, isPlan, normalizePlan, planDetails, plans, type EventDraftInput, type Plan } from "@/lib/event-drafts";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { defaultTheme, normalizeTheme, templateTheme, type EventTheme } from "@/lib/event-theme";
import { clearPendingEventDraft, readPendingEventDraft, savePendingEventDraft } from "@/lib/pending-event-draft";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { templates, type Template } from "@/lib/templates";
import { prepareImageUpload } from "@/lib/image-upload";
import { firstInvalidCreateEventStep, validateCreateEventStep, type WizardFieldErrors } from "@/lib/create-event-validation";
import "./create-event-wizard.css";

type Draft = EventDraftInput & { theme: EventTheme };
type Photo = { file: File; preview: string };

const initial: Draft = { title: "", eventType: "", date: "", time: "", venue: "", venueAddress: "", mapUrl: "", closingMessage: "", templateSlug: "", plan: "standard", step: 0, agenda: defaultAgenda(), features: defaultFeatures("standard"), message: "", dressCode: "", musicUrl: "", theme: defaultTheme };
const types = ["Boda", "XV", "Cumpleaños", "Infantil", "Baby Shower", "Corporativo"];
const category = (type: string) => type === "Boda" ? "Bodas" : type === "Infantil" ? "Infantiles" : type === "Corporativo" ? "Corporativos" : type;
const typeForCategory = (value: string) => value === "Bodas" ? "Boda" : value === "Infantiles" ? "Infantil" : value === "Corporativos" ? "Corporativo" : value;
const options = (type: string) => type === "Baby Shower" ? templates.filter((item) => item.slug === "dreamscape") : templates.filter((item) => item.category === category(type));
const planBenefits: Record<Plan, string[]> = {
  standard: ["Toda la información de tu evento", "Diseño personalizado", "Lista para compartir por WhatsApp"],
  premium: ["Confirmá quién asiste", "Organizá a tus invitados", "Fotos, música, álbum QR y trivia"],
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
  const requestedTemplate = templates.find((item) => item.slug === params.get("template"));
  const requestedPlan = isPlan(params.get("plan")) ? params.get("plan") as Plan : undefined;
  const templateLocked = Boolean(requestedTemplate);

  useEffect(() => {
    void (async () => {
      try {
        const pending = await readPendingEventDraft();
        let nextDraft = pending?.draft ? { ...pending.draft } : { ...initial };
        if (pending?.draft) {
          const normalizedPlan = normalizePlan(nextDraft.plan);
          nextDraft = { ...nextDraft, plan: normalizedPlan, features: nextDraft.features.filter((feature) => hasPlanFeature(normalizedPlan, feature)) };
        }
        if (requestedPlan) nextDraft = { ...nextDraft, plan: requestedPlan, features: defaultFeatures(requestedPlan), step: pending ? nextDraft.step : 1 };
        if (requestedTemplate) nextDraft = { ...nextDraft, plan: requestedTemplate.plan, eventType: typeForCategory(requestedTemplate.category), templateSlug: requestedTemplate.slug, features: defaultFeatures(requestedTemplate.plan), theme: templateTheme(requestedTemplate.theme), step: pending ? nextDraft.step : 2 };
        const selected = templates.find((item) => item.slug === nextDraft.templateSlug) ?? requestedTemplate ?? templates.find((item) => item.plan === nextDraft.plan) ?? templates[0];
        setDraft({ ...nextDraft, theme: normalizeTheme(nextDraft.theme, templateTheme(selected.theme)) } as Draft);
        setPlanChosen(Boolean(pending || requestedPlan || requestedTemplate));
        if (pending) {
          setPhotos(pending.photos.map((file) => ({ file, preview: URL.createObjectURL(file) })));
          setNotice(resume ? "Recuperamos tu borrador para que puedas continuar." : "Tu borrador anterior está listo para continuar.");
        }
      } catch { setNotice("No pudimos recuperar el borrador anterior."); }
      finally { setReady(true); }
    })();
  }, [requestedPlan, requestedTemplate, resume]);

  useEffect(() => {
    if (!ready || submittingRef.current) return;
    const timer = window.setTimeout(() => { void savePendingEventDraft({ draft, photos: photos.map((item) => item.file) }).catch(() => setNotice("No pudimos guardar el borrador en este dispositivo.")); }, 250);
    return () => window.clearTimeout(timer);
  }, [draft, photos, ready]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const choosePlan = (plan: Plan) => { const previewTemplate = templates.find((item) => item.plan === plan) ?? templates[0]; setPlanChosen(true); setDraft((current) => ({ ...current, plan, eventType: "", templateSlug: "", features: defaultFeatures(plan), theme: templateTheme(previewTemplate.theme) })); };
  const chooseType = (eventType: string) => {
    const template = options(eventType)[0];
    if (!template) return;
    setDraft((current) => ({ ...current, eventType, templateSlug: template.slug, features: defaultFeatures(current.plan), theme: templateTheme(template.theme) }));
  };
  const chooseTemplate = (template: Template) => setDraft((current) => ({ ...current, templateSlug: template.slug, features: defaultFeatures(current.plan), theme: templateTheme(template.theme) }));
  const valid = () => Object.keys(validateCreateEventStep(draft, draft.step, planChosen)).length === 0;
  const next = () => { if (!valid()) return; trackAnalyticsEvent({ name:"wizard_step_completed", step:draft.step + 1, plan:draft.plan, eventType:draft.eventType || undefined, templateSlug:draft.templateSlug || undefined }); setNotice(""); update("step", templateLocked && draft.step === 5 ? 7 : Math.min(8, draft.step + 1)); };
  const previous = () => update("step", templateLocked && draft.step === 7 ? 5 : Math.max(0, draft.step - 1));
  const submit = async () => {
    if (submittingRef.current || saving) return;
    const invalidStep = firstInvalidCreateEventStep(draft, planChosen);
    if (invalidStep !== null) { update("step", invalidStep); return; }
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
      trackAnalyticsEvent({ name:"draft_created", eventId:body.event.id, plan:draft.plan, eventType:draft.eventType, templateSlug:draft.templateSlug });
      await clearPendingEventDraft(); router.replace(`/eventos/${body.event.id}/editar`);
    } catch (error) {
      if (createdEventId) { await clearPendingEventDraft(); router.replace(`/eventos/${createdEventId}/editar?media=error`); return; }
      setNotice(error instanceof Error ? error.message : "No pudimos crear el evento.");
    } finally { setSaving(false); submittingRef.current = false; }
  };

  if (!ready) return null;
  const fieldErrors = validateCreateEventStep(draft, draft.step, planChosen);
  const canContinue = draft.step === 8 ? firstInvalidCreateEventStep(draft, planChosen) === null : Object.keys(fieldErrors).length === 0;
  const selectedTemplate = templates.find((item) => item.slug === draft.templateSlug) ?? templates.find((item) => item.plan === draft.plan) ?? templates[0];
  const preview = { title: draft.title, event_type: draft.eventType, starts_at: draft.date && draft.time ? new Date(`${draft.date}T${draft.time}:00-03:00`).toISOString() : null, template_slug: selectedTemplate.slug, content: { venue: draft.venue, venueAddress: draft.venueAddress, mapUrl: draft.mapUrl, closingMessage: draft.closingMessage, wizard_step: draft.step, features: draft.features, agenda: draft.agenda, message: draft.message, dressCode: draft.dressCode, musicUrl: draft.musicUrl, theme: draft.theme }, photos: photos.map((photo) => photo.preview) };
  const heading = ["Elegí tu plan.", "¿Qué vamos a celebrar?", "Contanos quiénes son los protagonistas.", "¿Cuándo empieza?", "¿Dónde se encuentran?", "¿Cuál es la agenda?", "Elegí una plantilla.", "Subí tus fotos.", "Últimos detalles."][draft.step];
  return <main><WizardHeader /><div className="progress"><span>Paso {draft.step + 1} de 9</span><progress value={draft.step + 1} max="9" aria-label={`Paso ${draft.step + 1} de 9`} /></div><section className="wizard photoWizard"><form className="wizardPanel" noValidate onSubmit={(event) => event.preventDefault()}><p className="eyebrow">Tu celebración</p><h1 tabIndex={-1}>{heading}</h1><p className="wizardStepLead">Los campos marcados como obligatorios deben completarse para avanzar.</p>{templateLocked && <p className="wizardHint">Elegiste {requestedTemplate?.name}. Conservamos esta plantilla y su plan compatible.</p>}<Fields draft={draft} errors={fieldErrors} photos={photos} update={update} choosePlan={choosePlan} chooseType={chooseType} chooseTemplate={chooseTemplate} setPhotos={setPhotos} />{draft.step === 8 && <ThemeControls value={draft.theme} defaults={templateTheme(selectedTemplate.theme)} onChange={(theme) => update("theme", theme)} />}{notice && <p className="wizardNotice" role="alert">{notice}</p>}{!canContinue && <p className="wizardStepStatus" role="status">Completá los campos indicados para habilitar {draft.step === 8 ? "la creación del evento" : "el siguiente paso"}.</p>}<div className="wizardActions"><button type="button" className="button outline" disabled={!draft.step || saving} onClick={previous}>Volver</button><button type="button" className="button dark" disabled={saving || !canContinue} onClick={draft.step === 8 ? submit : next}>{saving ? "Guardando…" : draft.step === 8 ? "Crear mi evento" : "Continuar →"}</button></div></form><details className="mobilePreview"><summary>Ver vista previa</summary><EventInvitationPreview event={preview} plan={draft.plan} /></details><div className="desktopPreview"><EventInvitationPreview event={preview} plan={draft.plan} /></div></section></main>;
}

function FieldError({ id, children }: { id?: string; children?: string }) { return children ? <span className="fieldError" id={id} role="alert">{children}</span> : null; }

function Fields({ draft, errors, photos, update, choosePlan, chooseType, chooseTemplate, setPhotos }: { draft: Draft; errors: WizardFieldErrors; photos: Photo[]; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; choosePlan: (plan: Plan) => void; chooseType: (value: string) => void; chooseTemplate: (value: Template) => void; setPhotos: (value: Photo[]) => void }) {
  if (draft.step === 0) return <fieldset className="wizardChoiceGroup"><legend>Plan <em>Obligatorio</em></legend><div className="planPicker">{plans.map((plan) => <button type="button" aria-pressed={draft.plan === plan && !errors.plan} className={draft.plan === plan && !errors.plan ? "selected" : ""} onClick={() => choosePlan(plan)} key={plan}><b>{planDetails[plan].name}</b><strong>${planDetails[plan].price.toLocaleString("es-AR")}</strong><ul>{planBenefits[plan].map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></button>)}</div><FieldError>{errors.plan}</FieldError></fieldset>;
  if (draft.step === 1) return <fieldset className="wizardChoiceGroup"><legend>Tipo de evento <em>Obligatorio</em></legend><div className="choices">{types.map((type) => <button type="button" aria-pressed={draft.eventType === type} className={draft.eventType === type ? "selected" : ""} onClick={() => chooseType(type)} key={type}>✦<br />{type}</button>)}</div><FieldError>{errors.eventType}</FieldError></fieldset>;
  if (draft.step === 2) return <div className="wizardFields"><label className="wizardField"><span className="fieldLabel">Nombre o título <em>Obligatorio</em></span><input value={draft.title} maxLength={120} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} placeholder="Ej.: Santino & Griselda" onChange={(event) => update("title", event.currentTarget.value)} /><FieldError id="title-error">{errors.title}</FieldError></label><label className="wizardField"><span className="fieldLabel">Mensaje de bienvenida <em>Opcional</em></span><textarea placeholder="Unas palabras para quienes reciban tu invitación" value={draft.message ?? ""} onChange={(event) => update("message", event.currentTarget.value)} /></label></div>;
  if (draft.step === 3) return <div className="fieldPair"><label className="wizardField"><span className="fieldLabel">Fecha <em>Obligatorio</em></span><input type="date" value={draft.date} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : undefined} onChange={(event) => update("date", event.currentTarget.value)} /><FieldError id="date-error">{errors.date}</FieldError></label><label className="wizardField"><span className="fieldLabel">Hora <em>Obligatorio</em></span><input type="time" value={draft.time} aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? "time-error" : undefined} onChange={(event) => update("time", event.currentTarget.value)} /><FieldError id="time-error">{errors.time}</FieldError></label></div>;
  if (draft.step === 4) return <GooglePlacePicker venue={draft.venue} address={draft.venueAddress ?? ""} mapUrl={draft.mapUrl ?? ""} errors={errors} onChange={({ venue, address, mapUrl }) => { update("venue", venue); update("venueAddress", address); update("mapUrl", mapUrl); }} />;
  if (draft.step === 5) return <AgendaStepEditor agenda={draft.agenda} errors={errors} onChange={(agenda) => update("agenda", agenda)} />;
  if (draft.step === 6) return <fieldset className="wizardChoiceGroup"><legend>Plantilla <em>Obligatorio</em></legend><div className="templatePicker">{options(draft.eventType).map((template) => <button type="button" aria-pressed={draft.templateSlug === template.slug} className={draft.templateSlug === template.slug ? "selected" : ""} onClick={() => chooseTemplate(template)} key={template.slug}><span className="templateThumb" style={{ backgroundImage: `url(${template.coverImage})` }} /><b>{template.name}</b><small>{template.style}</small></button>)}</div><FieldError>{errors.templateSlug}</FieldError></fieldset>;
  if (draft.step === 7) return <PhotoPicker photos={photos} setPhotos={setPhotos} plan={draft.plan} />;
  return <div className="wizardDetails wizardFields"><p>Completá los detalles que quieras mostrar. También vas a poder editarlos después desde tu panel.</p>{draft.features.includes("dress-code") && <label className="wizardField"><span className="fieldLabel">Vestimenta <em>Opcional</em></span><input placeholder="Ej.: Elegante sport" value={draft.dressCode ?? ""} onChange={(event) => update("dressCode", event.currentTarget.value)} /></label>}{draft.features.includes("music") && <label className="wizardField"><span className="fieldLabel">Música de YouTube <em>Opcional</em></span><input type="url" aria-invalid={Boolean(errors.musicUrl)} aria-describedby={errors.musicUrl ? "music-error" : undefined} placeholder="https://www.youtube.com/watch?v=..." value={draft.musicUrl ?? ""} onChange={(event) => update("musicUrl", event.currentTarget.value)} /><FieldError id="music-error">{errors.musicUrl}</FieldError></label>}<label className="wizardField"><span className="fieldLabel">Mensaje de cierre <em>Opcional</em></span><input placeholder="Ej.: Gracias por ser parte de este momento" value={draft.closingMessage ?? ""} onChange={(event) => update("closingMessage", event.currentTarget.value)} /></label></div>;
}

function PhotoPicker({ photos, setPhotos, plan }: { photos: Photo[]; setPhotos: (value: Photo[]) => void; plan: Plan }) {
  const [error, setError] = useState("");
  const maxPhotos = planDetails[plan].mediaLimit;
  const choose = async (event: ChangeEvent<HTMLInputElement>) => { const input = event.currentTarget; try { setError(""); const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith("image/")).slice(0, maxPhotos - photos.length); const prepared = await Promise.all(files.map(prepareImageUpload)); const added = prepared.map((file) => ({ file, preview: URL.createObjectURL(file) })); setPhotos([...photos, ...added]); } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos preparar la imagen."); } finally { if (input.isConnected) input.value = ""; } };
  return <div className="photoUploader"><p>{plan === "standard" ? "Podés subir una foto para la portada o usar la imagen de la plantilla elegida." : `Podés subir hasta ${maxPhotos} fotos o continuar con la portada de tu plantilla.`}</p>{photos.length < maxPhotos && <label className="upload">{photos.length ? "Agregar fotos" : "Elegir fotos"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choose} /></label>}<p className="wizardHint">Si no subís imágenes, tu invitación usará la portada de la plantilla que elegiste.</p>{error && <p className="wizardNotice">{error}</p>}<div className="photoThumbs">{photos.map((photo, index) => <figure key={photo.preview}><img src={photo.preview} alt={`Foto ${index + 1}`} /><button onClick={() => setPhotos(photos.filter((item) => item !== photo))}>×</button></figure>)}</div></div>;
}
