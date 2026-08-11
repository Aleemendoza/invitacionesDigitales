import { Suspense } from "react";
import { CreateEventWizard } from "@/components/create-event-wizard";

export default function Page(){return <Suspense fallback={null}><CreateEventWizard/></Suspense>}
