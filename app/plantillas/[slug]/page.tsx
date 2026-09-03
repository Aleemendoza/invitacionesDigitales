import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalyticsLink } from "@/components/analytics-link";
import { AnalyticsView } from "@/components/analytics-view";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { TemplateCard } from "@/components/template-card";
import { planDetails } from "@/lib/event-drafts";
import { templates } from "@/lib/templates";

export function generateStaticParams(){return templates.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const template=templates.find((item)=>item.slug===slug);if(!template)return{};const title=`Plantilla ${template.name} para ${template.category}`;return{title,description:`Conocé ${template.name}, una plantilla ${template.style.toLowerCase()} para crear tu invitación digital.`,alternates:{canonical:`/plantillas/${slug}`},openGraph:{title,description:`Creá tu invitación con la plantilla ${template.name}.`,url:`/plantillas/${slug}`}}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const template=templates.find((item)=>item.slug===slug);if(!template)notFound();const plan=planDetails[template.plan];return <main><AnalyticsView event={{name:"template_view",templateSlug:template.slug,plan:template.plan,eventType:template.category}}/><SiteHeader/><section className="preview"><div><p className="eyebrow">{template.category} · {plan.name}</p><h1>{template.name}</h1><p className="lead">Una experiencia {template.style.toLowerCase()} preparada para que tu celebración se sienta desde el primer mensaje.</p><ul className="previewFeatures"><li>Agenda, ubicación y detalles en un solo link</li><li>Vista optimizada para celular</li><li>{template.plan==="standard"?"Información completa, lista para compartir":"RSVP, invitados, álbum QR y trivia"}</li></ul><AnalyticsLink className="button pink" href={`/crear?template=${template.slug}`} analytics={{name:"create_start",templateSlug:template.slug,plan:template.plan,eventType:template.category}}>Usar esta plantilla</AnalyticsLink></div><TemplateCard template={template}/></section><SiteFooter/></main>}
