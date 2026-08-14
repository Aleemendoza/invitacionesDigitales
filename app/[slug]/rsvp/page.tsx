import { redirect } from "next/navigation";

export default async function LegacyRsvpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/e/${encodeURIComponent(slug)}/rsvp`);
}
