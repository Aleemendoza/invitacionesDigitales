import type { AgendaItem, PaymentStatus, Plan } from "./event-drafts";
import type { EventTheme } from "./event-theme";
import type { GiftSectionConfig, InvitationSectionStyles, SocialPhotoSectionConfig } from "./event-sections";
import type { WelcomeConfig } from "./invitation-welcome";

export type RsvpQuestionKind = "single_choice" | "multiple_choice" | "text";
export type RsvpQuestion = { id?: string; key: string; label: string; kind: RsvpQuestionKind; required: boolean; options: string[]; position: number };
export type RsvpConfig = { enabled: boolean; deadline?: string; accessMode: "name_lookup" | "name_and_code"; questions: RsvpQuestion[] };
export type EventContent = {
  venue: string; venueAddress?: string; mapUrl?: string; closingMessage?: string; wizard_step: number; features: string[]; agenda: AgendaItem[];
  message?: string; dressCode?: string; musicUrl?: string; theme?: EventTheme; rsvp?: RsvpConfig; sectionStyles?: InvitationSectionStyles; welcome?: WelcomeConfig;
};
export type EventSections = { gifts?: GiftSectionConfig; socialPhotos?: SocialPhotoSectionConfig };
export type StoredEventSection = { kind: "gifts" | "social_photos" | string; content: Record<string, unknown> };
export type StoredEventMedia = { storage_path: string; kind: string; position: number; url?: string };
export type StoredEvent = { id: string; slug: string; title: string; event_type: string; starts_at: string | null; status: "draft" | "published" | "finished"; template_slug: string; plan: Plan; payment_status: PaymentStatus; rsvp_enabled?: boolean; content: EventContent; sections?: EventSections; event_sections?: StoredEventSection[]; event_media?: StoredEventMedia[] };

export function eventDateLabel(event: Pick<StoredEvent, "starts_at">) {
  return event.starts_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(event.starts_at)) : "Fecha a confirmar";
}
