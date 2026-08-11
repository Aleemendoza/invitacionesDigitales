import { TemplatePreview } from "@/components/celebra";
export default async function Page({params}:{params:Promise<{slug:string}>}){return <TemplatePreview slug={(await params).slug}/>}
