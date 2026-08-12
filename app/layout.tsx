import type { Metadata } from "next";
import "./globals.css";
import "./design-system.css";
import "./pricing.css";

export const metadata: Metadata = { title: "Celebra — Invitaciones que se viven", description: "Crea una invitación digital hermosa y gestiona tu evento." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
