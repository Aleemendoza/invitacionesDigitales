import { SingleLinkInvitation } from "@/components/single-link-invitation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SingleLinkInvitation slug={slug} />;
}
