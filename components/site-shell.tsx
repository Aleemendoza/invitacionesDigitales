"use client";

import Link from "next/link";
import { useState } from "react";
import { AnalyticsLink } from "@/components/analytics-link";
import styles from "./site-shell.module.css";

const whatsappUrl = "https://wa.me/5493884486112?text=%C2%A1Hola%21%20Quiero%20que%20armen%20mi%20invitaci%C3%B3n%20digital.";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <><header className="siteHeader">
    <Link className="brand" href="/" onClick={close}>Papeleta<span>✦</span></Link>
    <button className="siteMenuToggle" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"}><span/><span/><span/></button>
    <nav id="site-menu" className={open ? "open" : ""} aria-label="Navegación principal">
      <Link href="/plantillas" onClick={close}>Plantillas</Link><Link href="/#como-funciona" onClick={close}>Cómo funciona</Link><Link href="/precios" onClick={close}>Precios</Link><Link href="/la-armamos-por-vos" onClick={close}>La armamos por vos</Link><Link href="/partner" onClick={close}>Partner</Link>
      <AnalyticsLink className="button pink" href="/crear" analytics={{name:"create_start"}} onClick={close}>Crear invitación</AnalyticsLink><Link className="accountLogin" href="/login" onClick={close}>Ingresar</Link>
    </nav>
  </header></>;
}

export function SiteFooter() {
  return <footer className="siteFooter"><div className="footerTop"><div><Link className="brand" href="/">Papeleta<span>✦</span></Link><p>Tu invitación lista para compartir, hecha por vos.</p></div><div className="footerLinks">
    <div><b>Descubrí</b><Link href="/plantillas">Plantillas</Link><Link href="/precios">Planes y precios</Link><Link href="/#como-funciona">Cómo funciona</Link><Link href="/partner">Papeleta Partner</Link></div>
    <div><b>Tu evento</b><Link href="/crear">Crear invitación</Link><Link href="/mis-eventos">Mis eventos</Link><Link href="/login">Ingresar</Link></div>
    <div><b>Ayuda y legal</b><a href="mailto:hola@papeleta.com.ar">hola@papeleta.com.ar</a><AnalyticsLink href={whatsappUrl} target="_blank" rel="noreferrer" analytics={{name:"whatsapp_clicked"}}>WhatsApp</AnalyticsLink><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos y condiciones</Link><Link href="/politica-de-uso">Política de uso</Link><Link href="/reembolsos">Cancelaciones y reembolsos</Link><Link href="/arrepentimiento">Botón de arrepentimiento</Link><Link href="/baja">Baja del servicio</Link></div>
  </div></div><div className="footerBottom"><span>© 2026 Papeleta.</span><span>Invitaciones digitales para celebrar.</span></div></footer>;
}
