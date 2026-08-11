import { RsvpPanel } from "@/components/rsvp-panel";
export default async function Page({params}:{params:Promise<{eventId:string}>}){return <RsvpPanel eventId={(await params).eventId}/>}
