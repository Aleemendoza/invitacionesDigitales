import { IndividualInvitation } from "@/components/individual-invitation";
export default async function Page({params}:{params:Promise<{slug:string;token:string}>}){const {slug,token}=await params;return <IndividualInvitation slug={slug} token={token}/>}
