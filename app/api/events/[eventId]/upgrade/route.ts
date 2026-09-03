import { NextRequest, NextResponse } from "next/server";
import { isPlan, normalizePlan, planDetails, planRank } from "@/lib/event-drafts";
import { ownerContext } from "@/lib/event-owner";
import { createPreference } from "@/lib/mercadopago-server";
import { enforceSharedRateLimit } from "@/lib/server-rate-limit";

export const runtime="nodejs";
export async function POST(request:NextRequest,{params}:{params:Promise<{eventId:string}>}){try{
  const{eventId}=await params,context=await ownerContext(request,eventId);if("error" in context)return context.error;
  const throttled=await enforceSharedRateLimit(request,"checkout",`${eventId}:upgrade`);if(throttled)return throttled;
  if(context.event.payment_status!=="approved")return NextResponse.json({error:"Podés cambiar el plan directamente hasta publicar."},{status:409});
  const body=await request.json() as{targetPlan?:unknown;idempotencyKey?:unknown};if(!isPlan(body.targetPlan)||planRank(body.targetPlan)<=planRank(context.event.plan))return NextResponse.json({error:"Elegí un plan superior."},{status:400});
  const amount=planDetails[body.targetPlan].price-planDetails[normalizePlan(context.event.plan)].price;if(amount<=0)return NextResponse.json({error:"El plan ya está activo."},{status:409});
  let{data:upgrade}=await context.db.from("event_plan_upgrades").select("id,amount,target_plan").eq("event_id",eventId).eq("status","pending").maybeSingle();
  if(upgrade&&upgrade.target_plan!==body.targetPlan)return NextResponse.json({error:"Ya hay otra actualización pendiente."},{status:409});
  if(!upgrade){const created=await context.db.from("event_plan_upgrades").insert({event_id:eventId,source_plan:context.event.plan,target_plan:body.targetPlan,amount}).select("id,amount,target_plan").single();if(created.error?.code==="23505")upgrade=(await context.db.from("event_plan_upgrades").select("id,amount,target_plan").eq("event_id",eventId).eq("status","pending").single()).data;else if(created.error)throw created.error;else upgrade=created.data}
  if(!upgrade)throw new Error("upgrade_reservation_failed");
  const idempotencyKey=typeof body.idempotencyKey==="string"&&/^[a-zA-Z0-9:_-]{16,128}$/.test(body.idempotencyKey)?body.idempotencyKey:`upgrade:${upgrade.id}`;
  let{data:payment}=await context.db.from("event_payments").select("id,provider_preference_id").eq("event_plan_upgrade_id",upgrade.id).eq("status","pending").maybeSingle();
  if(!payment){const created=await context.db.from("event_payments").insert({event_id:eventId,plan:body.targetPlan,amount:upgrade.amount,status:"pending",provider:"mercadopago",payment_kind:"upgrade",event_plan_upgrade_id:upgrade.id,idempotency_key:idempotencyKey}).select("id,provider_preference_id").single();if(created.error?.code==="23505")payment=(await context.db.from("event_payments").select("id,provider_preference_id").eq("event_plan_upgrade_id",upgrade.id).eq("status","pending").single()).data;else if(created.error)throw created.error;else payment=created.data}
  if(!payment)throw new Error("payment_reservation_failed");const origin=process.env.APP_URL;if(!origin)throw new Error("APP_URL is required");
  const preference=await createPreference({paymentId:payment.id,eventId,slug:context.event.slug,title:context.event.title,plan:body.targetPlan,amount:upgrade.amount,origin});
  if(!payment.provider_preference_id){const{error}=await context.db.from("event_payments").update({provider_preference_id:preference.id,updated_at:new Date().toISOString()}).eq("id",payment.id).is("provider_preference_id",null);if(error)throw error}
  return NextResponse.json({upgrade,checkoutUrl:preference.checkoutUrl});
}catch(error){console.error("plan upgrade",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"No pudimos iniciar la actualización."},{status:500})}}
