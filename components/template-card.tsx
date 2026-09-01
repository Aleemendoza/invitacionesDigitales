import Link from "next/link";
import { planDetails } from "@/lib/event-drafts";
import type { Template } from "@/lib/templates";

export function TemplateCard({ template }: { template: Template }) {
  return <article className="card"><Link href={`/plantillas/${template.slug}`}><div className={`invite ${template.theme}`}><div style={{ backgroundImage: `linear-gradient(transparent 30%,#160d10cc),url(${template.coverImage})` }}/><section><small>{template.category} · {template.style}</small><h3>{template.preview.title}</h3><b>{template.preview.date}</b><span>{template.preview.venue}</span></section></div></Link><div><span><b>{template.name}</b><small>{template.category} · {template.style}</small></span><em>{planDetails[template.plan].name}</em></div></article>;
}
