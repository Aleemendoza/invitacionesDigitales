"use client";

import { InvitationExperience } from "@/components/public-invitation";
import type { Plan } from "@/lib/event-drafts";
import { previewDataToStoredEvent, type InvitationPreviewData } from "@/lib/invitation-render";

export type { InvitationPreviewData } from "@/lib/invitation-render";

export function EventInvitationPreview({ event, label = "Vista previa", plan, initiallyStarted = false }: { event: InvitationPreviewData; label?: string; plan?: Plan; initiallyStarted?: boolean }) {
  const renderEvent = previewDataToStoredEvent(event, plan ?? "standard");
  return <aside className="invitationPreview">
    {label && <span>{label}</span>}
    <div className="phoneFrame"><div className="phoneScreen"><InvitationExperience event={renderEvent} mode="preview" initiallyStarted={initiallyStarted} /></div></div>
  </aside>;
}
