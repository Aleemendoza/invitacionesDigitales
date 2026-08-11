import { EventEditor } from "@/components/event-editor";
export default async function Page({params}:{params:Promise<{eventId:string}>}){return <EventEditor eventId={(await params).eventId}/>}
