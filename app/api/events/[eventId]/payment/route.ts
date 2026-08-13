import { NextRequest, NextResponse } from "next/server";
import { planDetails, type Plan } from "@/lib/event-drafts";
import { getAdminSupabase } from "@/lib/public-guest-server";

export const runtime = "nodejs";
export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) { const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); if(!token)return NextResponse.json({error:"Iniciá sesión."},{status:401}); const db=getAdminSupabase(); const {data:auth}=await db.auth.getUser(token); const {eventId}=await params; const {data:event}=await db.from("events").select("id").eq("id",eventId).eq("owner_id",auth.user?.id??"").maybeSingle(); if(!event)return NextResponse.json({error:"Evento no encontrado."},{status:404}); return NextResponse.json({instructions:{alias:process.env.PAYMENT_TRANSFER_ALIAS??"A configurar",holder:process.env.PAYMENT_TRANSFER_HOLDER??"Papeleta"}}); }
export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) { try {
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); if(!token)return NextResponse.json({error:"Iniciá sesión para enviar el comprobante."},{status:401});
  const db=getAdminSupabase(); const {data:auth}=await db.auth.getUser(token); const {eventId}=await params;
  const {data:event}=await db.from("events").select("id,plan").eq("id",eventId).eq("owner_id",auth.user?.id??"").maybeSingle(); if(!event)return NextResponse.json({error:"Evento no encontrado."},{status:404});
  const form=await request.formData(); const receipt=form.get("receipt"); const note=String(form.get("note")??"").slice(0,500);
  if(!(receipt instanceof File)||receipt.size>8*1024*1024||!["image/jpeg","image/png","application/pdf"].includes(receipt.type))return NextResponse.json({error:"Subí un comprobante JPG, PNG o PDF de hasta 8 MB."},{status:400});
  const extension=receipt.name.split(".").pop()?.replace(/[^a-z0-9]/gi,"")||"bin"; const path=`${eventId}/${crypto.randomUUID()}.${extension}`; const {error:uploadError}=await db.storage.from("payment-receipts").upload(path,receipt,{contentType:receipt.type}); if(uploadError)throw uploadError;
  const plan=event.plan as Plan; const {error}=await db.from("event_payments").insert({event_id:eventId,plan,amount:planDetails[plan].price,status:"pending",receipt_path:path,organizer_note:note}); if(error)throw error;
  await db.from("events").update({payment_status:"pending",status:"draft",updated_at:new Date().toISOString()}).eq("id",eventId); return NextResponse.json({ok:true});
}catch(error){console.error("payment request",error);return NextResponse.json({error:"No pudimos registrar el comprobante."},{status:500});} }
