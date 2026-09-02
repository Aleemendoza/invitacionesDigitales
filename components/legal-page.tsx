import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getLegalProvider, LEGAL_LAST_UPDATED } from "@/lib/legal";
import styles from "./legal-page.module.css";

export type LegalSection = { id: string; title: string; content: React.ReactNode };

export function ProviderIdentity() {
  const p = getLegalProvider();
  return <dl className={styles.provider}>
    <div><dt>Nombre comercial</dt><dd>{p.commercialName}</dd></div>
    {p.legalName && <div><dt>Razón social / titular</dt><dd>{p.legalName}</dd></div>}
    {p.cuit && <div><dt>CUIT</dt><dd>{p.cuit}</dd></div>}
    {(p.address || p.city) && <div><dt>Domicilio</dt><dd>{[p.address,p.city].filter(Boolean).join(", ")}</dd></div>}
    <div><dt>Contacto legal y atención</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd></div>
    {p.phone && <div><dt>Teléfono</dt><dd>{p.phone}</dd></div>}
    <div><dt>Atención electrónica</dt><dd>{p.supportHours}</dd></div>
  </dl>;
}

export function LegalPage({eyebrow,title,lead,notice,sections}:{eyebrow:string;title:string;lead:string;notice?:React.ReactNode;sections:LegalSection[]}) {
  return <main className={styles.page}><SiteHeader/><header className={styles.hero}>
    <p className={styles.eyebrow}>{eyebrow} · ACTUALIZADO EL {LEGAL_LAST_UPDATED.toUpperCase()}</p><h1>{title}</h1><p className={styles.lead}>{lead}</p>{notice&&<div className={styles.notice}>{notice}</div>}
  </header><div className={styles.layout}><nav className={styles.toc} aria-label="Contenido de esta página"><strong>En esta página</strong>{sections.map(s=><a key={s.id} href={`#${s.id}`}>{s.title}</a>)}</nav><article className={styles.content}>{sections.map(s=><section id={s.id} key={s.id}><h2>{s.title}</h2>{s.content}</section>)}<p>¿Necesitás ayuda? Escribinos a <a href="mailto:hola@papeleta.app">hola@papeleta.app</a> o consultá nuestros <Link href="/terminos">Términos y condiciones</Link>.</p></article></div><SiteFooter/></main>;
}
