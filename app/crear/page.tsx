import { Suspense } from "react";
import type { Metadata } from "next";
import { CreateEventWizard } from "@/components/create-event-wizard";
export const metadata:Metadata={title:"Crear invitación",robots:{index:false,follow:false}};
export default function Page(){return <Suspense fallback={null}><CreateEventWizard/></Suspense>}
