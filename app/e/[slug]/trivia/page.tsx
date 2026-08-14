import { PublicTrivia } from "@/components/public-trivia";
export default async function Page({params}:{params:Promise<{slug:string}>}){return <PublicTrivia slug={(await params).slug}/>}
