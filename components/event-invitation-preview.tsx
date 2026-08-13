"use client";

import type { EventContent, EventSections, StoredEvent } from "@/lib/event-types";
import { PublicInvitation } from "@/components/public-invitation";
import { templates } from "@/lib/templates";
import type { Plan } from "@/lib/event-drafts";
import "./event-invitation-preview.css";

export type InvitationPreviewData = Pick<StoredEvent, "title" | "event_type" | "starts_at" | "template_slug"> & {
  content: EventContent;
  photos?: string[];
  sections?: EventSections;
};
type PreviewSection = { kind: string; content: Record<string, unknown> };

export function EventInvitationPreview({ event, label = "Vista previa", plan }: { event: InvitationPreviewData; label?: string; plan?: Plan }) {
  const template = templates.find((item) => item.slug === event.template_slug) ?? (plan ? templates.find((item) => item.plan === plan) : undefined) ?? templates[0];
  const photos = event.photos?.filter(Boolean) ?? [];
  const sections: PreviewSection[] = [];
  if (event.sections?.gifts?.enabled) sections.push({ kind: "gifts", content: event.sections.gifts as unknown as Record<string, unknown> });
  if (event.sections?.socialPhotos?.enabled) sections.push({ kind: "social_photos", content: event.sections.socialPhotos as unknown as Record<string, unknown> });
  const previewEvent: StoredEvent & { event_sections: PreviewSection[] } = {
    id: "preview",
    slug: "preview",
    title: event.title || "Tu celebración",
    event_type: event.event_type || "Celebración",
    starts_at: event.starts_at,
    status: "draft",
    template_slug: template.slug,
    plan: plan ?? template.plan,
    payment_status: "unpaid",
    rsvp_enabled: event.content.rsvp?.enabled ?? true,
    content: event.content,
    event_media: photos.map((url, position) => ({ storage_path: `preview/${position}`, kind: position === 0 ? "cover" : "gallery", position, url })),
    event_sections: sections,
  };

  return <aside className="invitationPreview invitationPreview--public">
    <span>{label}</span>
    <div className="phoneFrame"><div className="phoneScreen"><PublicInvitation event={previewEvent} /></div></div>
  </aside>;
}
