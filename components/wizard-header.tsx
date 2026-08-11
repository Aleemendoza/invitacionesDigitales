"use client";
import Link from "next/link";
import { useState } from "react";
export function WizardHeader() { const [open,setOpen]=useState(false); return <header className="wizardHeader"><Link className="brand" href="/">celebra<span>✦</span></Link><button type="button" className="menuToggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="wizard-menu" aria-label="Abrir menú">☰</button><nav id="wizard-menu" className={open?"open":""}><Link href="/plantillas" onClick={()=>setOpen(false)}>Plantillas</Link><Link href="/precios" onClick={()=>setOpen(false)}>Precios</Link><Link href="/login" onClick={()=>setOpen(false)}>Ingresar</Link><Link className="button pink" href="/crear" onClick={()=>setOpen(false)}>Crear invitación</Link></nav></header>; }
