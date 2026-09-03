import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing-page";
export const metadata: Metadata = {title:"Planes y precios",description:"Compará Invitación e Invitación + Invitados para crear y organizar tu evento digital.",alternates:{canonical:"/precios"}};
export default function Page(){return <PricingPage/>}
