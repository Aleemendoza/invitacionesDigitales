import type { EventSections, RsvpConfig } from "./event-types";
import type { InvitationSectionStyles } from "./event-sections";
import type { EventTheme } from "./event-theme";

export type Plan = "standard" | "premium" | "premium_plus";
export type PaymentStatus = "unpaid" | "pending" | "approved" | "rejected";
export type AgendaItem = { time: string; title: string };
export type PlanFeature = "cover" | "agenda" | "map" | "message" | "dress-code" | "gifts" | "gallery" | "music" | "general-rsvp" | "custom-rsvp" | "csv-export" | "guest-list" | "individual-links" | "qr-album" | "trivia";
export type PlanDefinition = { name: string; price: number; features: readonly PlanFeature[]; mediaLimit: number };

export const planDetails: Record<Plan, PlanDefinition> = {
  standard: { name: "Estándar", price: 18000, features: ["cover", "agenda", "map", "message", "dress-code", "gifts"], mediaLimit: 1 },
  premium: { name: "Premium", price: 23000, features: ["cover", "agenda", "map", "message", "dress-code", "gifts", "gallery", "music", "general-rsvp", "custom-rsvp", "csv-export"], mediaLimit: 5 },
  premium_plus: { name: "Premium Plus+", price: 28000, features: ["cover", "agenda", "map", "message", "dress-code", "gifts", "gallery", "music", "general-rsvp", "custom-rsvp", "csv-export", "guest-list", "individual-links", "qr-album", "trivia"], mediaLimit: 10 },
};
export const plans = Object.keys(planDetails) as Plan[];
export const hasPlanFeature = (plan: Plan, feature: PlanFeature) => planDetails[plan].features.includes(feature);
export const canManageGuests = (plan: Plan) => hasPlanFeature(plan, "guest-list");
export const usesPersonalizedRsvp = (plan: Plan) => hasPlanFeature(plan, "guest-list") && hasPlanFeature(plan, "custom-rsvp");
export const hasPublicMenuActions = (plan: Plan, rsvpEnabled: boolean) => (hasPlanFeature(plan, "general-rsvp") && rsvpEnabled) || hasPlanFeature(plan, "qr-album") || hasPlanFeature(plan, "trivia");
export const isPlan = (value: unknown): value is Plan => typeof value === "string" && plans.includes(value as Plan);
export const planRank = (plan: Plan) => plans.indexOf(plan);
export const defaultFeatures = (plan: Plan): PlanFeature[] => [...planDetails[plan].features].filter((feature) => !["general-rsvp", "custom-rsvp", "csv-export", "guest-list", "individual-links", "qr-album", "trivia"].includes(feature));

export type EventDraftInput = { title:string; eventType:string; date:string; time:string; venue:string; venueAddress?:string; mapUrl?:string; closingMessage?:string; templateSlug:string; plan:Plan; step:number; agenda:AgendaItem[]; features:PlanFeature[]; message?:string; dressCode?:string; musicUrl?:string; theme?:EventTheme; rsvp?:RsvpConfig; sections?:EventSections; sectionStyles?:InvitationSectionStyles };
export const defaultAgenda=():AgendaItem[]=>[{time:"19:30",title:"Ceremonia"},{time:"21:00",title:"Recepción"},{time:"00:00",title:"Fiesta"}];
export function slugify(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,56)}
export function nextAvailableSlug(base:string,existing:Iterable<string>){const occupied=new Set(existing);if(!occupied.has(base))return base;for(let suffix=2;suffix<10_000;suffix+=1){const candidate=`${base}-${suffix}`;if(!occupied.has(candidate))return candidate}throw new Error("No se pudo asignar una URL disponible.")}
export function startsAt(date:string,time:string){const value=new Date(`${date}T${time}:00-03:00`);return Number.isNaN(value.getTime())?null:value.toISOString()}
const url=(value:string|undefined)=>!value||(()=>{try{return new URL(value).protocol==="https:"}catch{return false}})();
const validTheme=(value:unknown)=>!!value&&typeof value==="object"&&/^#[0-9a-fA-F]{6}$/.test((value as EventTheme).primaryColor)&&/^#[0-9a-fA-F]{6}$/.test((value as EventTheme).accentColor)&&(!(value as Partial<EventTheme>).backgroundColor||/^#[0-9a-fA-F]{6}$/.test((value as EventTheme).backgroundColor))&&(!(value as Partial<EventTheme>).titleColor||/^#[0-9a-fA-F]{6}$/.test((value as EventTheme).titleColor))&&["clasica","refinada","princesa"].includes((value as EventTheme).fontStyle);
export function validateDraft(input:Partial<EventDraftInput>){if(typeof input.title!=="string"||input.title.trim().length<2||input.title.length>120)return"Ingresá un título de entre 2 y 120 caracteres.";if(!input.eventType?.trim()||input.eventType.length>48)return"Elegí un tipo de evento válido.";if(!input.templateSlug||!/^[a-z0-9-]+$/.test(input.templateSlug))return"Elegí una plantilla válida.";if(!isPlan(input.plan))return"El plan no es válido.";if(!Array.isArray(input.agenda)||!input.agenda.length||input.agenda.some(item=>!/^[0-2]\d:[0-5]\d$/.test(item.time)||!item.title.trim()))return"Completá cada momento de la agenda.";if(input.theme&&!validTheme(input.theme))return"Elegí colores válidos para la identidad visual.";if(!url(input.mapUrl)||!url(input.musicUrl))return"Usá enlaces HTTPS válidos.";if(input.rsvp?.questions.some(question=>!question.key||!question.label.trim()||!(["single_choice","multiple_choice","text"] as string[]).includes(question.kind)||((question.kind!=="text")&&question.options.filter(Boolean).length<2)))return"Revisá las preguntas RSVP y sus opciones.";return null}
export function validatePlanFeatures(plan:Plan,features:readonly string[]){return features.every(feature=>hasPlanFeature(plan,feature as PlanFeature));}
