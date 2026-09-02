import type { Plan } from "./event-drafts";
import type { EventContent, EventSections, StoredEvent, StoredEventMedia, StoredEventSection } from "./event-types";

export type InvitationPreviewData = Pick<StoredEvent, "title" | "event_type" | "starts_at" | "template_slug"> & {
  content: EventContent;
  photos?: string[];
  media?: StoredEventMedia[];
  sections?: EventSections;
  welcomeBackgroundUrl?: string;
};

export function previewDataToStoredEvent(event: InvitationPreviewData, plan: Plan): StoredEvent {
  const media = event.media ?? (event.photos ?? []).filter(Boolean).map((url, position) => ({
    storage_path: `preview-${position}`,
    kind: position === 0 ? "cover" : "gallery",
    position,
    url,
  }));
  const eventSections: StoredEventSection[] = [];
  if (event.sections?.gifts?.enabled) eventSections.push({ kind: "gifts", content: event.sections.gifts as unknown as Record<string, unknown> });
  if (event.sections?.socialPhotos?.enabled) eventSections.push({ kind: "social_photos", content: event.sections.socialPhotos as unknown as Record<string, unknown> });
  const content = event.welcomeBackgroundUrl
    ? { ...event.content, welcome: { ...event.content.welcome, backgroundPhotoPath: "preview-welcome" } }
    : event.content;
  const eventMedia = event.welcomeBackgroundUrl
    ? [...media, { storage_path: "preview-welcome", kind: "welcome", position: media.length, url: event.welcomeBackgroundUrl }]
    : media;

  return {
    id: "preview",
    slug: "preview",
    title: event.title,
    event_type: event.event_type,
    starts_at: event.starts_at,
    status: "draft",
    template_slug: event.template_slug,
    plan,
    payment_status: "unpaid",
    rsvp_enabled: event.content.rsvp?.enabled ?? false,
    content,
    event_sections: eventSections,
    event_media: eventMedia,
  };
}

export function sanitizePublicEventSection(section: StoredEventSection): StoredEventSection {
  if (section.kind !== "gifts") return section;
  const { title, message, type, styleVariant, externalUrl, externalLabel, visual } = section.content;
  return { kind: section.kind, content: { enabled: true, title, message, type, styleVariant, externalUrl, externalLabel, visual } };
}
