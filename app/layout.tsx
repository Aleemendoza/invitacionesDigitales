import type { Metadata } from "next";
import { BackToTop } from "@/components/back-to-top";
import "./globals.css";
import "./design-system.css";
import "./pricing.css";
import "@/components/guests-manager.css";
import "@/components/organizer-shell.css";

export const metadata: Metadata = { title: "Papeleta — Invitaciones que se viven", description: "Crea una invitación digital hermosa y gestiona tu evento." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}<BackToTop /></body></html>;
}
