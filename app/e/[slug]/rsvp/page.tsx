import { PublicRsvp } from "@/components/public-rsvp";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <PublicRsvp slug={slug}/>}
