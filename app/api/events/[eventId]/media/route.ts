import { NextRequest, NextResponse } from "next/server";
import { normalizePlan, planDetails } from "@/lib/event-drafts";
import { getAdminSupabase } from "@/lib/public-guest-server";
import { validateAndSanitizeImage } from "@/lib/server-image-validation";

export const runtime="nodejs";const MAX_BYTES=3_500_000;
export async function POST(request:NextRequest,{params}:{params:Promise<{eventId:string}>}){try{
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!token)return NextResponse.json({error:"Iniciá sesión para subir fotos."},{status:401});
  const db=getAdminSupabase(),{data:{user}}=await db.auth.getUser(token),{eventId}=await params;if(!user)return NextResponse.json({error:"Sesión vencida."},{status:401});
  const{data:event}=await db.from("events").select("id,plan").eq("id",eventId).eq("owner_id",user.id).maybeSingle();if(!event)return NextResponse.json({error:"Evento no encontrado."},{status:404});
  const maxFiles=planDetails[normalizePlan(event.plan)].mediaLimit,form=await request.formData(),files=form.getAll("photos").filter((value):value is File=>value instanceof File);
  if(!files.length||files.length>maxFiles)return NextResponse.json({error:`Tu plan permite hasta ${maxFiles} imágenes.`},{status:400});
  const{count}=await db.from("event_media").select("id",{count:"exact",head:true}).eq("event_id",eventId);let nextPosition=count??0;const uploaded:{path:string;url:string}[]=[];
  for(const file of files){let safe;try{safe=await validateAndSanitizeImage(file,MAX_BYTES)}catch{return NextResponse.json({error:"Subí archivos JPEG, PNG o WebP válidos de hasta 3,5 MB."},{status:400})}
    const path=`${eventId}/${crypto.randomUUID()}.${safe.extension}`,blob=new Blob([safe.bytes as BlobPart],{type:safe.contentType});
    const{error:storageError}=await db.storage.from("event-media").upload(path,blob,{contentType:safe.contentType,upsert:false});if(storageError)throw storageError;
    const{error:registerError}=await db.rpc("register_event_media",{p_event_id:eventId,p_storage_path:path,p_kind:nextPosition===0?"cover":"gallery",p_position:nextPosition,p_limit:maxFiles});
    if(registerError){await db.storage.from("event-media").remove([path]);if(registerError.message.includes("media_quota_exceeded"))return NextResponse.json({error:`Tu plan permite hasta ${maxFiles} imágenes.`},{status:409});throw registerError}
    const{data:signed}=await db.storage.from("event-media").createSignedUrl(path,3600);uploaded.push({path,url:signed?.signedUrl??""});nextPosition++;
  }
  return NextResponse.json({media:uploaded});
}catch(error){console.error("upload event media",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"No pudimos subir las fotos."},{status:500})}}
