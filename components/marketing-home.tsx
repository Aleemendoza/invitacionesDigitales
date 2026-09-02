import Link from "next/link";
import { AnalyticsLink } from "@/components/analytics-link";
import { EventInvitationPreview, type InvitationPreviewData } from "@/components/event-invitation-preview";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { TemplateCard } from "@/components/template-card";
import { TestimonialsShowcase } from "@/components/testimonials-showcase";
import { defaultFeatures, planDetails } from "@/lib/event-drafts";
import { templates } from "@/lib/templates";
import styles from "./marketing-home.module.css";

const steps = [
  ["01", "Elegí una plantilla", "Encontrá un diseño pensado para tu tipo de celebración."],
  ["02", "Cargá los datos", "Completá fecha, lugar, agenda, fotos y los detalles que quieras mostrar."],
  ["03", "Creá tu cuenta y pagá", "Guardamos tu borrador y te llevamos a un pago seguro con Mercado Pago."],
  ["04", "Publicá y compartí", "Recibí tu enlace listo para enviar por WhatsApp, sin que tus invitados instalen una app."],
] as const;

const heroInvitation: InvitationPreviewData = {
  title: "Valeria & Julian",
  event_type: "Boda",
  starts_at: "2027-12-12T18:30:00-03:00",
  template_slug: "eclat",
  photos: ["/images/templates/eclat-cover.webp", "/images/sections/wedding-editorial.webp"],
  content: {
    venue: "Estancia La Candelaria",
    venueAddress: "Lobos, Buenos Aires",
    closingMessage: "Gracias por ser parte de nuestra historia.",
    wizard_step: 8,
    features: defaultFeatures("premium"),
    agenda: [
      { time: "18:30", title: "Ceremonia" },
      { time: "20:00", title: "Recepción" },
      { time: "22:00", title: "Cena y fiesta" },
    ],
    message: "Nos emociona compartir este día con vos.",
    dressCode: "Elegante",
    theme: { primaryColor: "#38242b", accentColor: "#b7795f", backgroundColor: "#f7efe8", titleColor: "#fffaf7", fontStyle: "refinada" },
    rsvp: { enabled: true, deadline: "2027-11-30T23:59:00-03:00", accessMode: "name_lookup", questions: [] },
    sectionStyles: {
      closing: { backgroundColor: "#38242b", textColor: "#fffaf7", accentColor: "#d6a88f", photoOverlay: 0.48 },
    },
  },
  sections: {
    gifts: {
      enabled: true,
      title: "Regalos",
      message: "Tu presencia es nuestro mejor regalo.",
      type: "bank_transfer",
      protectedDetails: true,
      accounts: [],
      styleVariant: "editorial",
      visual: { backgroundColor: "#38242b", textColor: "#fffaf7", accentColor: "#d6a88f" },
    },
    socialPhotos: {
      enabled: true,
      title: "Compartí tus fotos",
      description: "Ayudanos a guardar cada momento de esta noche.",
      socialType: "hashtag",
      socialValue: "SofiYJulian",
      ctaLabel: "Ver fotos",
      showCopyButton: true,
      visual: { backgroundColor: "#f7efe8", textColor: "#38242b", accentColor: "#b7795f" },
    },
  },
};

export function MarketingHome() {
  return <main><SiteHeader/><section className={`${styles.hero} hero`}>
      <div className={styles.heroCopy}>
        <p className="eyebrow">TU INVITACIÓN, TAL COMO LA VAN A VIVIR</p>
        <h1>Empezá a emocionar <em>desde la invitación.</em></h1>
        <p className={`lead ${styles.heroLead}`}>Diseñá, personalizá y mirá el resultado real antes de publicar. La misma experiencia que reciben tus invitados, sin sorpresas.</p>
        <div className={styles.heroActions}>
          <AnalyticsLink className="button dark" href="/crear" analytics={{ name: "create_start" }}>Crear mi invitación <span aria-hidden="true">→</span></AnalyticsLink>
          <Link className="button outline" href="/plantillas">Ver diseños</Link>
        </div>
        <ul className={styles.heroTrust} aria-label="Beneficios principales">
          <li><span aria-hidden="true">✓</span><strong>Vista previa real</strong><small>Antes de pagar</small></li>
          <li><span aria-hidden="true">✓</span><strong>Todo editable</strong><small>Textos, fotos y colores</small></li>
          <li><span aria-hidden="true">✓</span><strong>Lista para compartir</strong><small>Sin instalar una app</small></li>
        </ul>
      </div>
      <div className={styles.heroProduct} aria-label="Ejemplo real de una invitación digital">
        <div className={styles.previewHeading}><span>VISTA PREVIA REAL</span><strong>Así la reciben tus invitados</strong></div>
        <div className={styles.previewPhone}>
          <EventInvitationPreview event={heroInvitation} label="" plan="premium" initiallyStarted />
        </div>
        <div className={`${styles.previewDetail} ${styles.dateDetail}`}>
          <span>12 DIC · 18:30</span>
          <strong>Valeria &amp; Julian</strong>
          <small>Estancia La Candelaria</small>
        </div>
        <div className={`${styles.previewDetail} ${styles.featureDetail}`}>
          <span>TODO EN UN SOLO LINK</span>
          <strong>Mapa · agenda · regalos</strong>
          <small>Fotos sociales y confirmación RSVP</small>
        </div>
        <p className={styles.scrollHint}>Deslizá dentro del teléfono para explorarla <span aria-hidden="true">↓</span></p>
      </div>
    </section>
    <section className="band">Diseños para cada celebración.<span>Bodas</span><span>XV</span><span>Cumpleaños</span><span>Infantiles</span><span>Corporativos</span></section>
    <section className="section howItWorks" id="como-funciona"><div className="sectionHeading"><div><p className="eyebrow">CÓMO FUNCIONA</p><h2>De la idea al link,<br/><em>sin vueltas.</em></h2></div><p>Tu borrador queda guardado mientras avanzás. Podés crear la invitación primero y pagar cuando esté lista para publicar.</p></div><ol>{steps.map(([number,title,copy])=><li key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>
    <section className="section templateShowcase"><div className="sectionHeading"><div><p className="eyebrow">PLANTILLAS PARA CADA HISTORIA</p><h2>Elegí el estilo<br/><em>que se sienta tuyo.</em></h2></div><Link className="textLink" href="/plantillas">Ver catálogo completo <span aria-hidden="true">→</span></Link></div><div className="grid">{templates.slice(0,4).map((template)=><TemplateCard template={template} key={template.slug}/>)}</div></section>
    <section className="section planSummary"><p className="eyebrow">PLANES CLAROS, SIN SORPRESAS</p><h2>Empezá desde ${planDetails.standard.price.toLocaleString("es-AR")}</h2><p>Estándar incluye todo lo esencial para informar y emocionar. Si necesitás RSVP dentro de la invitación, galería o experiencias interactivas, elegí Premium o Premium Plus+.</p><Link className="button outline" href="/precios">Comparar planes</Link></section>
    <TestimonialsShowcase/>
    <section className="section conciergeTeaser"><div><p className="eyebrow">¿PREFERÍS DELEGARLO?</p><h2>La armamos por vos.</h2><p>Nos compartís la información y nuestro equipo configura la invitación. Es un servicio separado de la autogestión.</p></div><Link className="button dark" href="/la-armamos-por-vos">Conocer el servicio</Link></section>
    <section className="closingCta"><div><p className="eyebrow">TU EVENTO EMPIEZA CON LA INVITACIÓN</p><h2>Elegí. Creá.<br/><em>Publicá.</em></h2><p>Armá hoy tu borrador y descubrí cómo se verá antes de pagar.</p><AnalyticsLink className="button pink" href="/crear" analytics={{ name: "create_start" }}>Empezar mi invitación <span aria-hidden="true">→</span></AnalyticsLink></div></section><SiteFooter/></main>;
}
