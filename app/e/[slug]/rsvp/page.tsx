import { RsvpEntry } from "@/components/rsvp-entry";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <RsvpEntry slug={slug}/>}
