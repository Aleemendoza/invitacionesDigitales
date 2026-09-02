import type { EventDraftInput } from "./event-drafts";

export type WizardFieldErrors = Record<string, string>;

const isHttpsUrl = (value: string | undefined) => {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export function validateCreateEventStep(
  draft: EventDraftInput,
  step: number,
  planChosen: boolean,
): WizardFieldErrors {
  const errors: WizardFieldErrors = {};

  if (step === 0 && !planChosen) errors.plan = "Elegí un plan para continuar.";
  if (step === 1 && !draft.eventType.trim()) errors.eventType = "Elegí qué tipo de evento vas a celebrar.";

  if (step === 2) {
    const titleLength = draft.title.trim().length;
    if (!titleLength) errors.title = "Ingresá el nombre o título de la celebración.";
    else if (titleLength < 2) errors.title = "El título debe tener al menos 2 caracteres.";
    else if (draft.title.length > 120) errors.title = "El título no puede superar los 120 caracteres.";
  }

  if (step === 3) {
    if (!draft.date) errors.date = "Elegí la fecha del evento.";
    if (!draft.time) errors.time = "Elegí la hora de inicio.";
  }

  if (step === 4) {
    if (draft.venue.trim().length < 2) errors.venue = "Ingresá o seleccioná el nombre del lugar.";
    if ((draft.venueAddress ?? "").trim().length < 5) errors.venueAddress = "Seleccioná una dirección completa.";
    if (!isHttpsUrl(draft.mapUrl)) errors.mapUrl = "Elegí una ubicación válida para guardar su enlace de Google Maps.";
  }

  if (step === 5) {
    if (!draft.agenda.length) errors.agenda = "Agregá al menos un momento a la agenda.";
    draft.agenda.forEach((item, index) => {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) errors[`agenda.${index}.time`] = "Completá la hora.";
      if (!item.title.trim()) errors[`agenda.${index}.title`] = "Completá el nombre del momento.";
    });
  }

  if (step === 6 && !draft.templateSlug) errors.templateSlug = "Elegí una plantilla para tu invitación.";

  if (step === 8 && draft.musicUrl && !isHttpsUrl(draft.musicUrl)) {
    errors.musicUrl = "Ingresá un enlace HTTPS válido de YouTube.";
  }

  return errors;
}

export function firstInvalidCreateEventStep(draft: EventDraftInput, planChosen: boolean) {
  for (const step of [0, 1, 2, 3, 4, 5, 6, 8]) {
    if (Object.keys(validateCreateEventStep(draft, step, planChosen)).length) return step;
  }
  return null;
}
