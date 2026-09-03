"use client";

import { useEffect, useState } from "react";
import { GeneralRsvp } from "@/components/general-rsvp";
import { PublicRsvp } from "@/components/public-rsvp";
import { UnavailableInvitation } from "@/components/single-link-invitation";
import { normalizePlan } from "@/lib/event-drafts";

type RsvpFlow = "loading" | "general" | "group" | "unavailable";

export function RsvpEntry({ slug }: { slug: string }) {
  const [flow, setFlow] = useState<RsvpFlow>("loading");

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/public/events/${encodeURIComponent(slug)}/general-rsvp`, { signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => null) as { event?: { plan?: string } } | null;
        if (!response.ok) {
          setFlow("unavailable");
          return;
        }
        setFlow(normalizePlan(body?.event?.plan) === "premium" ? "group" : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setFlow("unavailable");
      });
    return () => controller.abort();
  }, [slug]);

  if (flow === "loading") return null;
  if (flow === "unavailable") return <UnavailableInvitation rsvp />;
  return flow === "group" ? <PublicRsvp slug={slug} /> : <GeneralRsvp slug={slug} />;
}
