import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { TemplateCatalog } from "@/components/template-catalog";
export const metadata: Metadata={title:"Plantillas de invitaciones digitales",description:"Explorá diseños para bodas, XV, cumpleaños, infantiles y eventos corporativos.",alternates:{canonical:"/plantillas"}};
export default function Page(){return <main><SiteHeader/><section className="section"><p className="eyebrow">ENCONTRÁ TU ESTILO</p><h1>Una plantilla para<br/><em>cada celebración.</em></h1><p className="lead">Elegí una para empezar. El plan compatible y el tipo de evento se completan automáticamente.</p><TemplateCatalog/></section><SiteFooter/></main>}
