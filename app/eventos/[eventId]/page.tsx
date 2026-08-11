import { EventDashboard } from "@/components/event-portal";
export default async function Page({params}:{params:Promise<{eventId:string}>}){return <EventDashboard eventId={(await params).eventId}/>}
