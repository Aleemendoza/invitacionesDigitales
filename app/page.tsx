import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing-home";
export const metadata: Metadata = { title:"Invitaciones digitales para crear y compartir", description:"Elegí una plantilla, cargá los datos, pagá online y publicá tu invitación digital desde Papeleta.", alternates:{canonical:"/"}, openGraph:{title:"Papeleta — Tu invitación lista para compartir",description:"Creá, pagá y publicá tu invitación digital en pocos pasos.",url:"/",type:"website"}, twitter:{card:"summary_large_image",title:"Papeleta — Invitaciones digitales",description:"Tu invitación lista para compartir en pocos pasos."} };
export default function Page(){return <MarketingHome/>}
