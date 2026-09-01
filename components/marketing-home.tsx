import Link from "next/link";
import { AnalyticsLink } from "@/components/analytics-link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { TemplateCard } from "@/components/template-card";
import { TestimonialsShowcase } from "@/components/testimonials-showcase";
import { planDetails } from "@/lib/event-drafts";
import { templates } from "@/lib/templates";

const steps = [
  ["01", "Elegí una plantilla", "Encontrá un diseño pensado para tu tipo de celebración."],
  ["02", "Cargá los datos", "Completá fecha, lugar, agenda, fotos y los detalles que quieras mostrar."],
  ["03", "Creá tu cuenta y pagá", "Guardamos tu borrador y te llevamos a un pago seguro con Mercado Pago."],
  ["04", "Publicá y compartí", "Recibí tu enlace listo para enviar por WhatsApp, sin que tus invitados instalen una app."],
] as const;

export function MarketingHome() {
  return <main><SiteHeader/><section className="hero"><div><p className="eyebrow">INVITACIONES DIGITALES AUTOGESTIONABLES</p><h1>Tu invitación, lista para compartir <em>en pocos pasos.</em></h1><p className="lead">Elegí un diseño, cargá los datos de tu evento, pagá online y publicá. Todo desde Papeleta y a tu ritmo.</p><p><AnalyticsLink className="button dark" href="/crear" analytics={{ name: "create_start" }}>Crear mi invitación <span aria-hidden="true">→</span></AnalyticsLink> <Link className="button outline" href="/plantillas">Explorar plantillas</Link></p><div className="heroTrust"><span>✓ Borrador guardado</span><span>✓ Pago con Mercado Pago</span><span>✓ Sin app para invitados</span></div></div><div className="heroPreview" aria-label="Vista previa de plantillas"><TemplateCard template={templates[2]}/></div></section>
    <section className="band">Diseños para cada celebración.<span>Bodas</span><span>XV</span><span>Cumpleaños</span><span>Infantiles</span><span>Corporativos</span></section>
    <section className="section howItWorks" id="como-funciona"><div className="sectionHeading"><div><p className="eyebrow">CÓMO FUNCIONA</p><h2>De la idea al link,<br/><em>sin vueltas.</em></h2></div><p>Tu borrador queda guardado mientras avanzás. Podés crear la invitación primero y pagar cuando esté lista para publicar.</p></div><ol>{steps.map(([number,title,copy])=><li key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>
    <section className="section templateShowcase"><div className="sectionHeading"><div><p className="eyebrow">PLANTILLAS PARA CADA HISTORIA</p><h2>Elegí el estilo<br/><em>que se sienta tuyo.</em></h2></div><Link className="textLink" href="/plantillas">Ver catálogo completo <span aria-hidden="true">→</span></Link></div><div className="grid">{templates.slice(0,4).map((template)=><TemplateCard template={template} key={template.slug}/>)}</div></section>
    <section className="section planSummary"><p className="eyebrow">PLANES CLAROS, SIN SORPRESAS</p><h2>Empezá desde ${planDetails.standard.price.toLocaleString("es-AR")}</h2><p>Estándar incluye todo lo esencial para informar y emocionar. Si necesitás RSVP dentro de la invitación, galería o experiencias interactivas, elegí Premium o Premium Plus+.</p><Link className="button outline" href="/precios">Comparar planes</Link></section>
    <TestimonialsShowcase/>
    <section className="section conciergeTeaser"><div><p className="eyebrow">¿PREFERÍS DELEGARLO?</p><h2>La armamos por vos.</h2><p>Nos compartís la información y nuestro equipo configura la invitación. Es un servicio separado de la autogestión.</p></div><Link className="button dark" href="/la-armamos-por-vos">Conocer el servicio</Link></section>
    <section className="closingCta"><div><p className="eyebrow">TU EVENTO EMPIEZA CON LA INVITACIÓN</p><h2>Elegí. Creá.<br/><em>Publicá.</em></h2><p>Armá hoy tu borrador y descubrí cómo se verá antes de pagar.</p><AnalyticsLink className="button pink" href="/crear" analytics={{ name: "create_start" }}>Empezar mi invitación <span aria-hidden="true">→</span></AnalyticsLink></div></section><SiteFooter/></main>;
}
