import type { Metadata } from "next";
import { LegalPage, ProviderIdentity, type LegalSection } from "@/components/legal-page";

export const metadata: Metadata = { title: "Política de privacidad | Papeleta", description: "Cómo Papeleta trata y protege los datos personales.", alternates: { canonical: "/privacidad" }, robots: { index: true, follow: true } };

const sections: LegalSection[] = [
  { id: "responsable", title: "1. Responsable y contacto", content: <><p>Papeleta trata los datos necesarios para crear, publicar y administrar invitaciones digitales. Para consultas o para ejercer derechos, usá el contacto informado a continuación.</p><ProviderIdentity /></> },
  { id: "datos", title: "2. Qué datos tratamos", content: <p>Datos de cuenta y contacto, contenido del evento, configuración de la invitación, datos de pago informados por el proveedor, respuestas RSVP cuando el plan las incluye, fotos y registros técnicos de seguridad.</p> },
  { id: "finalidades", title: "3. Para qué los usamos", content: <p>Para prestar el servicio, autenticar usuarios, procesar pagos, publicar invitaciones, gestionar respuestas, prevenir abuso, atender consultas y cumplir obligaciones legales. La medición publicitaria opcional sólo se activa con consentimiento y no debe recibir nombres, emails, teléfonos, códigos ni respuestas.</p> },
  { id: "proveedores", title: "4. Con quién se comparten", content: <p>Usamos proveedores de infraestructura, almacenamiento, autenticación, pagos y medición —incluidos Vercel, Supabase y Mercado Pago— únicamente para operar el servicio. Cada proveedor trata datos bajo sus propias condiciones y medidas de seguridad.</p> },
  { id: "conservacion", title: "5. Conservación y eliminación", content: <p>Conservamos datos mientras la cuenta o el evento estén activos y durante los plazos necesarios para seguridad, facturación y obligaciones legales. La eliminación de una cuenta comprende contenido y archivos asociados, salvo registros mínimos que debamos conservar.</p> },
  { id: "derechos", title: "6. Tus derechos", content: <p>Podés solicitar acceso, rectificación, actualización, exportación o eliminación. También podés retirar el consentimiento de medición eliminando la preferencia guardada en el navegador o escribiéndonos.</p> },
  { id: "invitados", title: "7. Invitados y organizadores", content: <p>Quien organiza el evento decide qué datos solicita a sus invitados. Recomendamos pedir sólo la información necesaria y comunicar esta política al compartir la invitación.</p> },
  { id: "seguridad", title: "8. Seguridad y cambios", content: <p>Aplicamos controles de acceso, cifrado en tránsito, límites antiabuso y registro de incidentes. Ningún sistema es infalible; notificaremos cambios materiales de esta política por nuestros canales habituales.</p> },
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="DATOS Y PRIVACIDAD" title="Política de privacidad" lead="Qué información usamos, para qué la necesitamos y cómo podés ejercer tus derechos." notice={<><strong>Tu información no se vende.</strong>Usamos los datos para operar la invitación y sólo compartimos lo necesario con los proveedores que hacen funcionar el servicio.</>} sections={sections} />;
}
