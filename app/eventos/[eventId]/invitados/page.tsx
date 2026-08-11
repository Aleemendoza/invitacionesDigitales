import { GuestsManager } from "@/components/guests-manager";
export default async function Page({params}:{params:Promise<{eventId:string}>}){return <GuestsManager eventId={(await params).eventId}/>}
