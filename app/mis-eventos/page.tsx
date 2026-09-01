import type { Metadata } from "next";
import { EventsPortal } from "@/components/event-portal";
export const metadata:Metadata={title:"Mis eventos",robots:{index:false,follow:false}};
export default function Page(){return <EventsPortal/>}
