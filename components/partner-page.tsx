"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { partnerWhatsappUrl } from "@/lib/contact";

type Benefit = { icon: IconName; title: string; body: string; note?: string };

const benefits: Benefit[] = [
  { icon: "gallery", title: "Presencia digital profesional", body: "Los Partners seleccionados pueden acceder a una web profesional para mostrar galería, eventos, servicios, capacidad, ubicación, mapa, WhatsApp, Instagram y consultas.", note: "La web forma parte del programa según las condiciones y modalidad de cada partnership." },
  { icon: "gift", title: "Un beneficio para tus clientes", body: "Cuando alguien reserva tu espacio, podés ofrecerle Papeleta para reunir cada detalle de su casamiento, cumpleaños, XV, bautismo u otra celebración." },
  { icon: "pin", title: "Tu espacio dentro de la celebración", body: "Cada invitación puede incluir el nombre de tu espacio, su ubicación y el acceso al mapa. Así, los invitados también descubren dónde se realiza el evento." },
  { icon: "hand", title: "Nosotros nos ocupamos", body: "No necesitás diseñar invitaciones, brindar soporte ni aprender un sistema nuevo. Tu equipo recomienda Papeleta; nosotros hacemos el resto." },
];

const steps = [
  ["01", "Te sumás como Partner", "Conocemos tu espacio, cómo trabajan y qué tipo de eventos reciben."],
  ["02", "Preparamos tu integración", "Creamos tu acceso y definimos los beneficios disponibles para tu negocio."],
  ["03", "Recomendás Papeleta", "Cuando reservan un evento, compartís un QR o enlace exclusivo."],
  ["04", "Nosotros atendemos al cliente", "Diseñamos, configuramos y publicamos su invitación digital."],
  ["05", "Crecemos juntos", "Medimos las contrataciones y habilitamos beneficios según el volumen del Partner."],
];

function PartnerHeader() {
  return <header className="partnerHeader"><Link className="brand" href="/">Papeleta<span>✦</span></Link><nav><Link href="/plantillas">Plantillas</Link><Link href="/precios">Precios</Link><Link href="/partner" aria-current="page">Papeleta Partner</Link><Link className="button pink" href="/crear">Crear invitación</Link></nav></header>;
}

function PartnerFooter() {
  return <footer className="siteFooter"><div className="footerTop"><div><Link className="brand" href="/">Papeleta<span>✦</span></Link><p>La forma más linda de reunir a quienes más querés.</p></div><div className="footerLinks"><div><b>Descubrí</b><Link href="/plantillas">Plantillas</Link><Link href="/precios">Planes y precios</Link><Link href="/partner">Papeleta Partner</Link></div><div><b>¿Necesitás ayuda?</b><a href="mailto:hola@papeleta.com.ar">hola@papeleta.com.ar</a><a href={partnerWhatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a></div></div></div><div className="footerBottom"><span>© 2026 Papeleta. Hecho para grandes momentos.</span></div></footer>;
}

export function PartnerPage() {
  return <main><PartnerHeader/>
    <section className="partnerHero"><div><p className="eyebrow">PROGRAMA PAPELETA PARTNER</p><h1>Hacé crecer tu espacio.<br/><em>Nosotros te ayudamos a digitalizarlo.</em></h1><p className="lead">Si tenés un salón de eventos, quinta, casa de alquiler o espacio para celebraciones, podés formar parte de Papeleta Partner.</p><p className="partnerHeroCopy">Vos acercás Papeleta a quienes organizan un evento en tu espacio. Nosotros te damos herramientas digitales para potenciar tu negocio.</p><p><a className="button pink" href={partnerWhatsappUrl} target="_blank" rel="noreferrer">Quiero ser Partner →</a> <a className="button partnerOutline" href="#como-funciona">Conocer cómo funciona</a></p><div className="partnerProof"><span>Sin inversión inicial</span><span>Sin sistemas complicados</span></div></div><aside className="partnerHeroVisual"><p className="eyebrow">TU ESPACIO, MÁS PRESENTE</p><Icon name="pin" size={34}/><strong>Una invitación que también muestra dónde sucede la celebración.</strong><span>Ubicación · Mapa · Información del espacio</span><div className="partnerQr">QR<small>Tu enlace Partner</small></div></aside></section>
    <section className="partnerAlliance section"><p className="eyebrow">UNA ALIANZA DONDE GANAMOS LOS DOS</p><h2>Tus clientes ya necesitan<br/><em>organizar cada detalle.</em></h2><p className="sectionLead">Invitados, ubicación, confirmación de asistencia y toda la información del evento encuentran su lugar en una invitación digital diseñada para su celebración.</p><p className="partnerStatement">Vos ofrecés un beneficio más. <strong>Nosotros hacemos todo el trabajo.</strong></p></section>
    <section className="partnerBenefits section"><p className="eyebrow">¿QUÉ OBTIENE TU ESPACIO?</p><h2>Una experiencia que<br/><em>trabaja a tu favor.</em></h2><div className="partnerBenefitsGrid">{benefits.map((benefit) => <article key={benefit.title}><Icon name={benefit.icon} size={31}/><h3>{benefit.title}</h3><p>{benefit.body}</p>{benefit.note && <small>{benefit.note}</small>}</article>)}</div></section>
    <section className="partnerProcess" id="como-funciona"><div className="partnerProcessInner"><div><p className="eyebrow">CÓMO FUNCIONA</p><h2>Simple para tu equipo.<br/><em>Valioso para tu negocio.</em></h2></div><ol>{steps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></div></section>
    <section className="partnerExperience section"><div><p className="eyebrow">TU ESPACIO PUEDE TENER SU PROPIA EXPERIENCIA PAPELETA</p><h2>Más que una dirección.<br/><em>El comienzo de la celebración.</em></h2><p className="sectionLead">Una pareja que reserva su casamiento en tu salón puede enviar una invitación donde los invitados encuentren fecha, horarios, ubicación, mapa, confirmación, dress code, regalos, fotografías, música e información del evento.</p></div><div className="partnerPhone"><p>CASAMIENTO</p><h3>Valeria &amp; Julian</h3><span>Sábado 12 de diciembre</span><hr/><strong>Estancia La Candelaria</strong><small>Ver ubicación en el mapa →</small></div></section>
    <section className="partnerClosing"><div><p className="eyebrow">¿TENÉS UN ESPACIO PARA EVENTOS?</p><h2>Queremos conocer<br/><em>tu negocio.</em></h2><p>Estamos incorporando salones, quintas, casas de alquiler y espacios para celebraciones. No necesitás tener página web ni conocimientos técnicos.</p><a className="button pink" href={partnerWhatsappUrl} target="_blank" rel="noreferrer">Quiero sumar mi espacio →</a><p className="partnerWhatsappPrompt">¿Preferís hablar directamente? <a href={partnerWhatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp</a></p></div></section>
    <PartnerFooter/>
  </main>;
}
