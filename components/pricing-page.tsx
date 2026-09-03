import { AnalyticsLink } from "@/components/analytics-link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { planDetails, type Plan } from "@/lib/event-drafts";
import styles from "./pricing-page.module.css";

const pricingPlans: Array<{ id: Plan; eyebrow: string; description: string; features: string[]; cta: string; recommended?: boolean }> = [
  {
    id: "standard",
    eyebrow: "INVITACIÓN DIGITAL",
    description: "Todo lo necesario para presentar tu evento y compartirlo con tus invitados.",
    features: ["Diseño personalizado", "Fecha, agenda y ubicación", "Dress code y regalos", "Foto principal", "Link para compartir"],
    cta: "Crear mi invitación",
  },
  {
    id: "premium",
    eyebrow: "INVITACIÓN + ORGANIZACIÓN",
    description: "Además de tu invitación, organizá confirmaciones e invitados desde Papeleta.",
    features: ["Todo lo del plan Invitación", "Confirmación de asistencia", "Preguntas personalizadas", "Lista e invitaciones individuales", "Galería y música", "Álbum QR y trivia"],
    cta: "Crear y gestionar invitados",
    recommended: true,
  },
];

export function PricingPage() {
  return <main>
    <SiteHeader />
    <section className="section pricing">
      <p className="eyebrow">PLANES Y PRECIOS</p>
      <h1>Elegí lo que necesita<br/><em>tu celebración.</em></h1>
      <p className="lead">Creá el borrador sin costo. Cuando esté listo, pagá de forma segura con Mercado Pago para publicarlo.</p>
      <div className={`plans ${styles.planGrid}`}>
        {pricingPlans.map((plan) => {
          const detail = planDetails[plan.id];
          return <article className={`planCard ${styles.planCard} ${plan.recommended ? "planPremium" : "planEssential"}`} key={plan.id}>
            {plan.recommended && <span className={`planBadge ${styles.badge}`}>Recomendado</span>}
            <div className={styles.planHeader}>
              <p className="eyebrow">{plan.eyebrow}</p>
              <h2>{detail.name}</h2>
              <strong className="planPrice">${detail.price.toLocaleString("es-AR")}</strong>
              <p className={styles.planDescription}>{plan.description}</p>
            </div>
            <div className={styles.planBenefits}>
              <p className="planIncludes">Incluye</p>
              <ul aria-label={`Incluye plan ${detail.name}`}>{plan.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
            </div>
            <div className={`planActions ${styles.planActions}`}>
              <AnalyticsLink className="button dark" href={`/crear?plan=${plan.id}`} analytics={{ name:"create_start", plan:plan.id }}>{plan.cta}</AnalyticsLink>
              <small>El precio se valida al iniciar el pago.</small>
            </div>
          </article>;
        })}
      </div>
      <p className="pricingHelp">¿No querés configurarla? <a href="/la-armamos-por-vos">Conocé el servicio “La armamos por vos”.</a></p>
    </section>
    <SiteFooter />
  </main>;
}
