import type { Metadata } from "next";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { BackToTop } from "@/components/back-to-top";
import "./globals.css";
import "./design-system.css";
import "./pricing.css";
import "@/components/guests-manager.css";
import "@/components/organizer-shell.css";

const publicUrl = process.env.APP_URL?.startsWith("http") ? process.env.APP_URL : "https://papeleta.app";
export const metadata: Metadata = { metadataBase:new URL(publicUrl), title:{default:"Papeleta — Invitaciones digitales",template:"%s | Papeleta"}, description:"Creá una invitación digital, pagá online y publicala cuando esté lista.", openGraph:{siteName:"Papeleta",locale:"es_AR",type:"website"},twitter:{card:"summary_large_image"} };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}<BackToTop /><AnalyticsConsent /></body></html>;
}
