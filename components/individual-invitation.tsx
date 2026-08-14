"use client";

import { SingleLinkInvitation } from "@/components/single-link-invitation";

/**
 * Personal URLs issued before the share-link change remain valid as invitation
 * URLs. They intentionally do not create an RSVP session or bypass access.
 */
export function IndividualInvitation({ slug }: { slug: string; token: string }) {
  return <SingleLinkInvitation slug={slug} />;
}
