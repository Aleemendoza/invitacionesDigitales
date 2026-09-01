import { NextRequest, NextResponse } from "next/server";
import { isPlan, planDetails, type Plan } from "@/lib/event-drafts";
import { createPreference } from "@/lib/mercadopago-server";
import { getAdminSupabase } from "@/lib/public-guest-server";
import { enforceSharedRateLimit } from "@/lib/server-rate-limit";

export const runtime="nodejs";
export async function POST(request:NextRequest,{params}:{params:Promise<{eventId:string}>}){try{
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!token)return NextResponse.json({error:"Iniciá sesión para pagar."},{status:401});
  const db=getAdminSupabase(),{data:{user}}=await db.auth.getUser(token);if(!user)return NextResponse.json({error:"Sesión vencida."},{status:401});
  const{eventId}=await params,throttled=await enforceSharedRateLimit(request,"checkout",eventId);if(throttled)return throttled;
  const body=await request.json().catch(()=>({})) as{plan?:unknown;idempotencyKey?:unknown};
  const{data:event}=await db.from("events").select("id,slug,title,plan,payment_status").eq("id",eventId).eq("owner_id",user.id).maybeSingle();if(!event)return NextResponse.json({error:"Evento no encontrado."},{status:404});if(event.payment_status==="approved")return NextResponse.json({error:"La invitación ya está publicada."},{status:409});
  const plan=isPlan(body.plan)?body.plan:event.plan as Plan,idempotencyKey=typeof body.idempotencyKey==="string"&&/^[a-zA-Z0-9:_-]{16,128}$/.test(body.idempotencyKey)?body.idempotencyKey:`initial:${event.id}:${plan}`;
  let{data:payment}=await db.from("event_payments").select("id,provider_preference_id").eq("event_id",event.id).eq("payment_kind","initial").eq("plan",plan).eq("status","pending").eq("provider","mercadopago").maybeSingle();
  if(!payment){const inserted=await db.from("event_payments").insert({event_id:event.id,plan,amount:planDetails[plan].price,status:"pending",provider:"mercadopago",payment_kind:"initial",idempotency_key:idempotencyKey}).select("id,provider_preference_id").single();if(inserted.error?.code==="23505")payment=(await db.from("event_payments").select("id,provider_preference_id").eq("event_id",event.id).eq("payment_kind","initial").eq("plan",plan).eq("status","pending").eq("provider","mercadopago").single()).data;else if(inserted.error)throw inserted.error;else payment=inserted.data}
  if(!payment)throw new Error("payment_reservation_failed");const origin=process.env.APP_URL;if(!origin)throw new Error("APP_URL is required");
  const preference=await createPreference({paymentId:payment.id,eventId:event.id,slug:event.slug,title:event.title,plan,amount:planDetails[plan].price,origin});
  if(!payment.provider_preference_id){const{error}=await db.from("event_payments").update({provider_preference_id:preference.id,updated_at:new Date().toISOString()}).eq("id",payment.id).is("provider_preference_id",null);if(error)throw error}
  return NextResponse.json({checkoutUrl:preference.checkoutUrl,plan,amount:planDetails[plan].price});
}catch(error){console.error("mercadopago checkout",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"No pudimos iniciar el pago."},{status:500})}}
