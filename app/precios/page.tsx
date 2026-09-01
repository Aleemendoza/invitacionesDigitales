import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing-page";
export const metadata: Metadata = {title:"Planes y precios",description:"Compará Estándar, Premium y Premium Plus+ para crear tu invitación digital.",alternates:{canonical:"/precios"}};
export default function Page(){return <PricingPage/>}
