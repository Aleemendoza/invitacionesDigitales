import { DraftPreview } from "@/components/draft-preview";
export default async function Page({params}:{params:Promise<{eventId:string}>}){return <DraftPreview eventId={(await params).eventId}/>}
