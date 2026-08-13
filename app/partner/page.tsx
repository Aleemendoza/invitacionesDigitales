import type { Metadata } from "next";
import { PartnerPage } from "@/components/partner-page";
import "./partner.css";

export const metadata: Metadata = { title: "Celebra Partner | Digitalizá tu espacio para eventos", description: "Sumá Celebra Partner y ofrecé invitaciones digitales para potenciar tu salón, quinta o espacio para celebraciones." };

export default function Page() { return <PartnerPage/>; }
