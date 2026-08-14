import { PublicAlbum } from "@/components/public-album";
export default async function Page({params}:{params:Promise<{slug:string}>}){return <PublicAlbum slug={(await params).slug}/>}
